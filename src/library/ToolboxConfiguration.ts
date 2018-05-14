import { app, ArtboardType, backend, Matrix, createUUID, TileSize, IArtboard, IPage, ISize, IRect, IRectData, SymbolGroup, renderer, RenderEnvironment, RenderFlags, IUIElement, model, Origin, IStateboard, Artboard } from "carbon-core";
import { ToolboxConfig, SpriteStencil, ToolboxGroup, SymbolStencil } from "./LibraryDefs";

let PADDING = 5;
let _configCache = {};

type StencilMap = { [id: string]: SymbolStencil };

export default class ToolboxConfiguration {
    static chooseTileType(w, h) {
        let opaque = w / h < 2;
        if (opaque && h > 200) {
            return TileSize.XLarge;
        }
        let wide = w > 250;
        if (wide) {
            return TileSize.Large;
        }
        return TileSize.Small;
    }
    static fitToTile(w, h, tileType, padding?) {
        padding = padding || 0;
        let data: any = {};
        data.width = 128;
        data.height = 60;

        if (tileType === TileSize.XLarge) {
            data.width = 257;
            data.height = 121;
        }
        else if (tileType === TileSize.Large) {
            data.width = 257;
        }

        let pw = data.width - padding * 2;
        let ph = data.height - padding * 2;

        if (w / h >= 1.62) {
            data.scale = pw / w;
            if (h * data.scale > ph) {
                data.scale = ph / h;
            }
        } else {
            data.scale = ph / h;
            if (w * data.scale > pw) {
                data.scale = pw / w;
            }
        }

        if (data.scale > 1) {
            data.scale = 1;
        }

        //ideally, image should be scaled relative to the center of the tile, but that does not work for artboards (but works for rects)
        data.tileX = (data.width - w * data.scale) / 2 + .5 | 0;
        data.tileY = (data.height - h * data.scale) / 2 + .5 | 0;

        return data;
    }

    static renderElementsToSprite(page: IPage, elements: IArtboard[], items, contextScale?): Promise<any> {
        contextScale = contextScale || 1;
        if (!elements.length) {
            return Promise.resolve({});
        }
        let elementWithTiles: Array<{ element: IArtboard | IStateboard, tileSize: TileSize }> = elements.map(e => {
            let tileSize;
            if (e.props.tileSize === TileSize.Auto) {
                tileSize = ToolboxConfiguration.chooseTileType(e.width, e.height);
            } else {
                tileSize = e.props.tileSize;
            }
            return { tileSize: tileSize, element: e };
        })
        elementWithTiles.sort((a, b) => {
            return b.tileSize - a.tileSize;
        });
        let x: number = 0;
        let y: number = 0;
        let height: number = 0;
        let i: number = 0;
        let countOnLine: number = 1;
        let renderTasks = [];
        let prevTileSize: number = -1;

        while (i < elementWithTiles.length && elementWithTiles[i].tileSize === TileSize.XLarge) {
            let element = elementWithTiles[i].element;
            let tileSize = elementWithTiles[i].tileSize;
            let bb = element.getBoundingBoxGlobal();
            let data = ToolboxConfiguration.fitToTile(bb.width, bb.height, tileSize, PADDING);
            renderTasks.push({ x, y, data: data });
            x += data.width;
            height = Math.max(height, data.height);
            ++i;
            countOnLine = 2;
            prevTileSize = tileSize;
        }

        let counter = 0;
        let lastX = x;

        while (i < elementWithTiles.length) {
            let element = elementWithTiles[i].element;
            let tileSize = elementWithTiles[i].tileSize;

            if (prevTileSize !== tileSize) {
                counter = 0;
                x = lastX;
                y = 0;
            }

            let data = ToolboxConfiguration.fitToTile(element.width, element.height, tileSize, PADDING);
            renderTasks.push({ x, y, data: data });
            height = Math.max(height, data.height);
            if ((counter + 1) % countOnLine === 1) {
                y += data.height;
                lastX = x + data.width;
            } else {
                x += data.width;
                lastX = x;
                y = 0;
            }
            ++i;
            ++counter;
            prevTileSize = tileSize;
        }

        let width: number = lastX;

        let context = renderer.contextPool.getContext(width, height, contextScale, true);
        context.clear();

        let elementsMap: StencilMap = {};
        let taskPromises = [];

        for (i = 0; i < renderTasks.length; ++i) {
            let artboard = elementWithTiles[i].element;
            taskPromises.push(ToolboxConfiguration._performRenderTask(page, renderTasks[i], artboard, (artboard as IStateboard).props.stateId || null, elementsMap, context, contextScale));
        }

        return Promise.all(taskPromises)
            .then(() => {
                if (items) {
                    for (i = 0; i < elements.length; ++i) {
                        items.push(elementsMap[elements[i].id]);
                    }
                }

                let imageData = context.canvas.toDataURL();
                let backgroundUrl = "url(" + imageData + ")";
                return { imageData, backgroundUrl, size: { width, height } };
            })
            .finally(() => {
                renderer.contextPool.releaseContext(context);
            });
    }

    static _performRenderTask(page: IPage, t, artboard: IArtboard, stateId: string | null, stencilMap: StencilMap, context, contextScale): Promise<any> {
        let bb = artboard.getBoundingBoxGlobal();

        let tileMatrix = Matrix.allocate();
        tileMatrix.translate(t.x + t.data.tileX, t.y + t.data.tileY);
        tileMatrix.scale(t.data.scale, t.data.scale);
        renderer.elementToContext(artboard, context, contextScale, tileMatrix);
        tileMatrix.free();

        stencilMap[artboard.id] = {
            id: createUUID(),
            artboardId: artboard instanceof IStateboard ? artboard.props.masterId : artboard.id,
            pageId: page.id,
            realHeight: bb.width,
            realWidth: bb.height,
            spriteMap: { x: t.x * contextScale, y: t.y * contextScale, width: t.data.width * contextScale, height: t.data.height * contextScale },
            title: artboard.name,
            stateId,
            //will be set later
            spriteSize: null,
            spriteUrl: null,
            spriteUrl2x: null
        };

        let fontTasks = app.fontManager.getPendingTasks();
        if (!fontTasks.length) {
            return Promise.resolve();
        }

        return Promise.all(fontTasks)
            .then(() => ToolboxConfiguration._performRenderTask(page, t, artboard, stateId, stencilMap, context, contextScale));
    }

    static getConfigForPage(page: IPage) {
        if (page.props.toolboxConfigUrl && page.props.toolboxConfigUrl !== '#') {
            let config = _configCache[page.props.toolboxConfigUrl];
            if (config) {
                return Promise.resolve(config);
            }
            return fetch(page.props.toolboxConfigUrl).then(r => r.json()).then(function (config) {
                _configCache[page.props.toolboxConfigUrl] = config;
                return config;
            });
        }

        //skip page update to avoid infinite loops
        return ToolboxConfiguration.buildToolboxConfig(page, true);
    }

    static buildToolboxConfig(page, skipPageUpdate?: boolean): Promise<ToolboxConfig<SpriteStencil>> {
        let artboards = page.getAllResourceArtboards(ArtboardType.Symbol) as IArtboard[];

        if (!artboards.length) {
            if (!skipPageUpdate) {
                page.setProps({ toolboxConfigUrl: null });
            }
            return Promise.resolve({ groups: [] });
        }

        let stateboards = ToolboxConfiguration.findStateboards(artboards);
        for (let i = 0; i < stateboards.length; ++i) {
            artboards.push(stateboards[i]);
        }

        artboards.sort(ToolboxConfiguration.symbolComparer);

        let configId = createUUID();
        let groups = [];
        let promises = [];
        let symbolGroups = page.props.symbolGroups as SymbolGroup[];

        for (let i = 0; i < symbolGroups.length; ++i) {
            let group = symbolGroups[i];
            let groupElements = [];
            for (let j = 0; j < artboards.length; ++j) {
                let e = artboards[j];
                if (e instanceof IStateboard) {
                    e = e.artboard;
                }
                if (e.props.symbolGroup === group.id) {
                    groupElements.push(artboards[j]);
                }
            }

            if (group.id === "default") {
                for (let k = 0; k < artboards.length; ++k) {
                    let e = artboards[k];
                    if (!symbolGroups.find(x => x.id === e.props.symbolGroup)) {
                        groupElements.push(e);
                    }
                }
            }

            if (groupElements.length) {
                promises.push(ToolboxConfiguration.makeGroup(page, groups, group.id, group.name, groupElements));
            }
        }

        let config: ToolboxConfig<SpriteStencil> = { groups: groups, id: configId };
        return Promise.all(promises)
            .then(() => {
                if (app.serverless()) {
                    return { url: '#' };
                }
                return backend.fileProxy.uploadPublicFile({ content: JSON.stringify(config) });
            })
            .then((data) => {
                if (!skipPageUpdate) {
                    page.setProps({ toolboxConfigUrl: data.url });
                }
                return config;
            })
    }

    private static makeGroup(page: IPage, groups, groupId, groupName, elements): Promise<any> {
        let items = [];
        let spriteUrlPromise = ToolboxConfiguration.renderElementsToSprite(page, elements, items);

        let spriteUrl2xPromise = ToolboxConfiguration.renderElementsToSprite(page, elements, null, 2);
        let group: ToolboxGroup<SpriteStencil> = {
            name: groupName,
            items: items
        };
        groups.push(group);

        if (app.serverless()) {
            return Promise.all([spriteUrlPromise, spriteUrl2xPromise])
                .then(sprites => {
                    group.items.forEach(x => {
                        x.spriteUrl = sprites[0].backgroundUrl;
                        x.spriteUrl2x = sprites[1].backgroundUrl;
                        x.spriteSize = sprites[0].size;
                    });
                });
        }

        spriteUrlPromise = spriteUrlPromise.then(sprite => {
            return backend.fileProxy.uploadPublicImage({ content: sprite.imageData })
                .then((data) => {
                    group.items.forEach(x => {
                        x.spriteUrl = "url('" + data.url + "')";
                        x.spriteSize = sprite.size;
                    });
                })
        });

        spriteUrl2xPromise = spriteUrl2xPromise.then(sprite => {
            return backend.fileProxy.uploadPublicImage({ content: sprite.imageData })
                .then((data) => {
                    group.items.forEach(x => {
                        x.spriteUrl2x = "url('" + data.url + "')";
                    });
                })
        });

        return Promise.all([spriteUrlPromise, spriteUrl2xPromise]);
    }

    private static findStateboards(artboards: IArtboard[]): IArtboard[] {
        let result: IArtboard[] = [];
        for (let i = 0; i < artboards.length; ++i) {
            let stateboards = artboards[i].getStateboards();
            for (let j = 0; j < stateboards.length; ++j) {
                result.push(stateboards[j]);
            }
        }
        return result;
    }

    /**
     * Defines sort order of symbols.
     * General rule: symbols are sorted by their "grid" position, row by row, column by column.
     *
     * Special rule for states: states are considered to be located in the position of their master
     * so that they are always grouped together.
     * A master always comes first. The rest of the states follow the general rule.
     */
    private static symbolComparer(a: IArtboard, b: IArtboard) {
        if (a instanceof IStateboard && a.props.masterId === b.id) {
            return 1;
        }
        else if (b instanceof IStateboard && b.props.masterId === a.id) {
            return -1;
        }

        let artboard1 = a;
        let artboard2 = b;
        let sameMaster = a instanceof IStateboard && b instanceof IStateboard && a.props.masterId === b.props.masterId;

        if (!sameMaster) {
            if (a instanceof IStateboard) {
                artboard1 = a.artboard;
            }
            if (b instanceof IStateboard) {
                artboard2 = b.artboard;
            }
        }

        let rect1 = artboard1.getBoundingBox();
        let rect2 = artboard2.getBoundingBox();

        if (rect1.y <= rect2.y + rect2.height && rect1.y + rect1.height >= rect2.y) {
            return rect1.x - rect2.x;
        }
        return rect1.y - rect2.y;
    }
}