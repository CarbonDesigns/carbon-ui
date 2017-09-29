import { app, ArtboardType, backend, Matrix, createUUID, workspace, TileSize, IArtboard, IPage, ISize, IRect, IRectData, SymbolGroup } from "carbon-core";
import { ToolboxConfig, SpriteStencil, ToolboxGroup } from "./LibraryDefs";

let PADDING = 5;
let _configCache = {};

type StencilMap = {[id: string]: SpriteStencil};

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
        else if (tileType === TileSize.Large ) {
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

        return data;
    }

    static renderElementsToSprite(page: IPage, elements, items, contextScale?): Promise<any> {
        contextScale = contextScale || 1;
        if (!elements.length) {
            return Promise.resolve({});
        }
        let elementWithTiles: Array<any> = elements.map(e => {
            let tileSize;
            if (e.props.tileSize === TileSize.Auto) {
                tileSize = ToolboxConfiguration.chooseTileType(e.width(), e.height());
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
            let data = ToolboxConfiguration.fitToTile(element.width(), element.height(), tileSize, PADDING);
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

            let data = ToolboxConfiguration.fitToTile(element.width(), element.height(), tileSize, PADDING);
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
        let context = workspace.contextPool.getContext(width, height, contextScale, true);
        context.clearRect(0, 0, context.width, context.height);
        let env = { finalRender: true, setupContext: () => { }, contextScale: contextScale, offscreen: true, view: { scale: () => 1, contextScale, focused: () => false } };
        let elementsMap: StencilMap = {};
        let taskPromises = [];
        for (i = 0; i < renderTasks.length; ++i) {
            taskPromises.push(ToolboxConfiguration._performRenderTask(page, renderTasks[i], elementWithTiles[i].element, elementsMap, context, contextScale, env));
        }

        return Promise.all(taskPromises)
            .then(() => {
                if (items) {
                    for (i = elements.length - 1; i >= 0; --i) {
                        items.push(elementsMap[elements[i].id()]);
                    }
                }

                let imageData = context.canvas.toDataURL("image/png");
                let backgroundUrl = "url(" + imageData  + ")";
                return { imageData, backgroundUrl, size: { width, height } };
            })
            .finally(() => {
                workspace.contextPool.releaseContext(context);
            });
    }

    static _performRenderTask(page: IPage, t, element, elementsMap: StencilMap, context, contextScale, env): Promise<any> {
        let w = element.width();
        let h = element.height();
        let scale = t.data.scale;
        let matrix = Matrix.Identity.clone();
        context.save();
        context.scale(contextScale, contextScale);
        context.beginPath();
        context.clearRect(t.x, t.y, t.data.width, t.data.height);
        context.rect(t.x, t.y, t.data.width, t.data.height);
        context.clip();

        env.setupContext = (context) => {
            context.scale(contextScale, contextScale);
            env.pageMatrix.applyToContext(context);
        }

        matrix.translate(t.x + (0 | (t.data.width - w * scale) / 2), t.y + (0 | (t.data.height - h * scale) / 2));
        matrix.scale(scale, scale);
        matrix.append(element.viewMatrix().clone().invert());
        env.pageMatrix = matrix;
        matrix.applyToContext(context);

        try {
            element.standardBackground(false);
            element.draw(context, env);
        }
        finally {
            element.standardBackground(true);
        }

        context.restore();

        elementsMap[element.id()] = {
            id: element.id(),
            pageId: page.id(),
            realHeight: w,
            realWidth: h,
            spriteMap: {x : t.x * contextScale, y: t.y * contextScale, width: t.data.width * contextScale, height: t.data.height * contextScale},
            title: element.name(),
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
            .then(() => ToolboxConfiguration._performRenderTask(page, t, element, elementsMap, context, contextScale, env));
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
        let elements = page.getAllResourceArtboards(ArtboardType.Symbol) as IArtboard[];

        if (!elements.length) {
            if (!skipPageUpdate) {
                page.setProps({ toolboxConfigUrl: null });
            }
            return Promise.resolve({ groups: [] });
        }

        elements.sort((a, b) => {
            let rect1 = a.getBoundingBox();
            let rect2 = b.getBoundingBox();

            if (rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
                return rect2.x - rect1.x;
            }
            return rect2.y - rect1.y;
        });

        let configId = createUUID();
        let groups = [];
        let promises = [];
        let symbolGroups = page.props.symbolGroups as SymbolGroup[];

        for (let i = 0; i < symbolGroups.length; ++i) {
            let group = symbolGroups[i];
            let groupElements = [];
            for (let j = 0; j < elements.length; ++j) {
                let e = elements[j];
                if (e.props.symbolGroup === group.id) {
                    groupElements.push(e);
                }
            }

            if (group.id === "default") {
                for (let k = 0; k < elements.length; ++k) {
                    let e = elements[k];
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
}