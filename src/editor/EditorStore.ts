import { CarbonStore, dispatch, handles } from "../CarbonFlux";
import Immutable from "immutable";
var platformCodeDefinition: any = require("./model/platform.txt");

import { backend } from "carbon-api";
import { IDisposable, IArtboard, app } from "carbon-core";
import { ensureMonacoLoaded } from "./MonacoLoader";
import { ArtboardProxyGenerator } from "./ProxyGenerator";

interface IArtboardModel {
    version: number;
    model: monaco.editor.IModel;
    proxyDefinition: string;
}

class EditorStore extends CarbonStore<any> implements IDisposable {
    private _initialized: boolean = false;
    private _platformDefinition: IDisposable;
    private _editor: monaco.editor.IStandaloneCodeEditor;
    private _activeModel: IArtboardModel;
    private _activeProxyModel: IDisposable;
    private _modelsCache: { [id: string]: IArtboardModel }[] = [];

    initialize(editor: monaco.editor.IStandaloneCodeEditor) {
        if (this._editor !== editor) {
            if (this._editor) {
                this._editor.setModel(null); // detach current model if any
            }
            this._editor = editor;
            if (editor) {
                this.refreshModel();
            }
        }

        if (this._initialized) {
            return;
        }

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            allowJs: false,
            noLib: true,
            alwaysStrict: true,
            allowNonTsExtensions: true,
            noResolve:true,
            noImplicitAny:true,
            noImplicitThis:true,
            noImplicitReturns:true,
            noImplicitUseStrict:true
        });

        this._platformDefinition = monaco.languages.typescript.typescriptDefaults.addExtraLib(platformCodeDefinition as string, 'filename/storage.d.ts');
        this._initialized = true;
    }

    getArtboardFileName(artboard: IArtboard) {
        return "artboard.ts";
    }

    getActiveArtboardModel(): Promise<IArtboardModel> {
        var artboard = app.activePage.getActiveArtboard();
        if (!artboard) {
            return Promise.resolve(null);
        }

        var model = monaco.editor.createModel(`
        export class Model2 {
            run() {
                let a = new Facts();
            }
        }
    `, "typescript", monaco.Uri.parse("model.ts"));

        let version = artboard.version;

        return ArtboardProxyGenerator.generate(artboard).then((text) => {
            return { model, version, proxyDefinition: text };
        });
    }

    refreshModel() {
        this.getActiveArtboardModel().then((model) => {
            if (this._activeProxyModel) {
                this._activeProxyModel.dispose();
                this._activeProxyModel = null;
            }

            if (!model) {
                this._editor.setModel(null);
            } else {
                this._activeProxyModel = monaco.languages.typescript.typescriptDefaults.addExtraLib(model.proxyDefinition, 'filename/proxy.d.ts');
                this._editor.setModel(model.model);
            }
        });
    }

    dispose() {
        if (this._platformDefinition) {
            this._platformDefinition.dispose();
            this._platformDefinition = null;
        }
    }
}

var store = new EditorStore();

ensureMonacoLoaded().then(() => { store.initialize(null); })

export default store;