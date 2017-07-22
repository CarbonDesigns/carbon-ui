import { app, ArtboardType, backend, Matrix, createUUID, workspace, TileSize } from "carbon-core";

let PADDING = 5;
let _configCache = {};

export interface IStencil {
    id: string;
    title: string;
    realWidth: number;
    realHeight: number;
    spriteMap: number[];
}

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

    static renderElementsToSprite(elements, outConfig, contextScale?): Promise<any> {
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
        let elementsMap = {};
        let taskPromises = [];
        for (i = 0; i < renderTasks.length; ++i) {
            taskPromises.push(ToolboxConfiguration._performRenderTask(renderTasks[i], elementWithTiles[i].element, elementsMap, context, contextScale, env));
        }

        return Promise.all(taskPromises)
            .then(() => {
                if (outConfig) {
                    for (i = elements.length - 1; i >= 0; --i) {
                        outConfig.push(elementsMap[elements[i].id()]);
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

    static _performRenderTask(t, element, elementsMap, context, contextScale, env): Promise<any> {
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
            "id": element.id(),
            "realHeight": w,
            "realWidth": h,
            "spriteMap": [t.x * contextScale, t.y * contextScale, t.data.width * contextScale, t.data.height * contextScale],
            "title": element.name()
        };

        let fontTasks = app.fontManager.getPendingTasks();
        if (!fontTasks.length) {
            return Promise.resolve();
        }

        return Promise.all(fontTasks)
            .then(() => ToolboxConfiguration._performRenderTask(t, element, elementsMap, context, contextScale, env));
    }

    static getConfigForPage(page) {
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

        return ToolboxConfiguration.buildToolboxConfig(page)
    }

    static buildToolboxConfig(page) {
        let elements = page.getAllArtboards().filter(x => x.props.type === ArtboardType.Symbol);

        if (!elements.length) {
            page.setProps({ toolboxConfigUrl: null });
            return Promise.resolve({ groups: [] });
        }

        let configId = createUUID();

        let groupedElements = {};
        for (let i = 0; i < elements.length; ++i) {
            let e = elements[i];
            let group = groupedElements[e.props.toolboxGroup] || [];
            group.push(e);
            groupedElements[e.props.toolboxGroup] = group;
        }
        let groups = [];
        function makeGroup(groupName, elements): Promise<any> {
            let config = [];
            let spriteUrlPromise = ToolboxConfiguration.renderElementsToSprite(elements, config);

            let spriteUrl2xPromise = ToolboxConfiguration.renderElementsToSprite(elements, null, 2);
            let group: any = {
                name: groupName,
                items: config
            };
            groups.push(group);

            if (app.serverless()) {
                return Promise.all([spriteUrlPromise, spriteUrl2xPromise])
                    .then(sprites => {
                        group.spriteUrl = sprites[0].backgroundUrl;
                        group.spriteUrl2x = sprites[1].backgroundUrl;
                        group.size = sprites[0].size;
                    });
            }

            spriteUrlPromise = spriteUrlPromise.then(sprite => {
                return backend.fileProxy.uploadPublicImage({ content: sprite.imageData })
                    .then((data) => {
                        group.spriteUrl = data.url;
                        group.size = sprite.size;
                    })
            });

            spriteUrl2xPromise = spriteUrl2xPromise.then(sprite => {
                return backend.fileProxy.uploadPublicImage({ content: sprite.imageData })
                    .then((data) => {
                        group.spriteUrl2x = data.url;
                    })
            });

            return Promise.all([spriteUrlPromise, spriteUrl2xPromise]);
        }
        let promises = [];
        for (let group in groupedElements) {
            promises.push(makeGroup(group, groupedElements[group]));
        }

        let config = { groups: groups, id: configId };
        return Promise.all(promises)
            .then(() => {
                if (app.serverless()) {
                    return { url: '#', configId: createUUID() };
                }
                return backend.fileProxy.uploadPublicFile({ content: JSON.stringify(config) });
            })
            .then((data) => {
                page.setProps({ toolboxConfigUrl: data.url, toolboxConfigId: configId });
                return config;
            })
    }
}