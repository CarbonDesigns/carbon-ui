import { ArtboardType, UIElementFlags, TileSize, app, Matrix, backend, ContextPool, IUIElement, RenderEnvironment, RenderFlags } from "carbon-core";
import { PageSpriteCacheItem } from "./LibraryDefs";

export default class IconSetSpriteManager {
    static fitToSize(w, h, iconSize) {
        let data: any = {};
        data.width = iconSize;
        data.height = iconSize;


        let pw = data.width;
        let ph = data.height;

        if (w > h) {
            data.scale = pw / w;
        } else {
            data.scale = ph / h;
        }

        return data;
    }

    static renderElementsToSprite(elements, iconSize, contextScale?): Promise<any> {
        contextScale = contextScale || 1;
        if (!elements.length) {
            return Promise.resolve({});
        }

        let x: number = 0;
        let height: number = iconSize;
        let width: number = elements.length * iconSize;
        let context = ContextPool.getContext(width, height, contextScale, true);
        context.clearRect(0, 0, context.width, context.height);
        let env: RenderEnvironment = {
            flags: RenderFlags.Final | RenderFlags.Offscreen,
            setupContext: () => { },
            contextScale,
            scale: 1,
            pageMatrix: Matrix.Identity,
            fill: null,
            stroke: null
        };
        let taskPromises = [];

        for (let element of elements) {
            let data = IconSetSpriteManager.fitToSize(element.width, element.height, iconSize);
            let renderTask = { x, y: 0, data: data };
            x += iconSize;
            taskPromises.push(IconSetSpriteManager._performRenderTask(renderTask, element, context, contextScale, env));
        }

        return Promise.all(taskPromises)
            .then(() => {
                return { imageData: context.canvas.toDataURL("image/png"), size: { width, height } };
            })
            .finally(() => {
                ContextPool.releaseContext(context);
            });
    }

    static _performRenderTask(t, element, context, contextScale, env: RenderEnvironment): Promise<any> {
        let fontTasks = app.fontManager.getPendingTasks();

        if (fontTasks.length) {
            return Promise.all(fontTasks)
                .then(() => IconSetSpriteManager._performRenderTask(t, element, context, contextScale, env));
        }

        if (!element.shouldApplyViewMatrix() && element.commitMatrixChanges) {
            let clone = element.clone();
            clone.commitMatrixChanges();
            clone.parent = element.parent;
            element = clone;
        }

        let w = element.width;
        let h = element.height;
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

        matrix.translate(t.x + (0 | (t.data.width - w * scale) / 2) - element.props.br.x * scale, t.y + (0 | t.data.height - h * scale) / 2 - element.props.br.y * scale);
        matrix.scale(scale, scale);



        matrix.append(element.globalViewMatrix().clone().invert());
        env.pageMatrix = matrix;
        matrix.applyToContext(context);

        element.draw(context, env);

        context.restore();

        return Promise.resolve();
    }

    static buildAndUploadSprite(id: string, version: string, elements: IUIElement[], iconsSize: number): Promise<PageSpriteCacheItem> {
        let spriteUrlPromise = IconSetSpriteManager.renderElementsToSprite(elements, iconsSize);
        let spriteUrl2xPromise = IconSetSpriteManager.renderElementsToSprite(elements, iconsSize, 2);

        if (app.serverless()) {
            return Promise.all([spriteUrlPromise, spriteUrl2xPromise])
                .then(sprites => {
                    return {
                        id,
                        version,
                        spriteUrl: "url('" + sprites[0].imageData + "')",
                        spriteUrl2x: "url('" + sprites[1].imageData + "')",
                        spriteSize: sprites[0].size
                    }
                });
        }

        var iconSetSpriteUrl;
        var iconSetSpriteSize;
        var iconSetSpriteUrl2x;

        spriteUrlPromise = spriteUrlPromise.then(sprite => {
            return backend.fileProxy.uploadPublicImage({ content: sprite.imageData })
                .then((data) => {
                    iconSetSpriteUrl = "url('" + data.url + "')";
                    iconSetSpriteSize = sprite.size;
                })
        });

        spriteUrl2xPromise = spriteUrl2xPromise.then(sprite => {
            return backend.fileProxy.uploadPublicImage({ content: sprite.imageData })
                .then((data) => {
                    iconSetSpriteUrl2x = "url('" + data.url + "')";
                })
        });

        return Promise.all([spriteUrlPromise, spriteUrl2xPromise]).then(() => {
            return {
                id,
                version,
                spriteUrl: iconSetSpriteUrl,
                spriteUrl2x: iconSetSpriteUrl2x,
                spriteSize: iconSetSpriteSize
            }
        });
    }
}