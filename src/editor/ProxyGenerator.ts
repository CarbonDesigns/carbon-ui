import { IArtboard, IUIElement, Types } from "carbon-core";

export class ArtboardProxyGenerator {
    static escapeName(name: string) {
        return name.replace(' ', '_');
    }

    static getControlType(e) {
        switch (e.t) {
            case Types.Path:
                return "IPath";
            case Types.Rectangle:
                return "IRectangle";
        }
        return "IElement";
    }

    static generate(artboard: IArtboard): Promise<string> {
        return new Promise<string>(resolve => {
            let controlList = [];

            artboard.applyVisitor(e => {
                if (e === artboard) {
                    return;
                }
                let name = ArtboardProxyGenerator.escapeName(e.name());
                let type = ArtboardProxyGenerator.getControlType(e);
                controlList.push({ name, type });
            });
            resolve(`
                declare const Artboard:any;
                ${
                controlList.map(v => `declare const ${v.name}:${v.type};`).join('\n')
                }
            `)
        });
    }
}