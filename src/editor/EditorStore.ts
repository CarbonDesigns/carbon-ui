import { CarbonStore, dispatch, handles } from "../CarbonFlux";
import Immutable from "immutable";
var platformCodeDefinition: any = require("./model/platform.txt");
var emptyCode: any = require("./model/empty.txt");

import { IDisposable, IArtboard, app, Environment } from "carbon-core";
import { ensureMonacoLoaded } from "./MonacoLoader";
import { ArtboardProxyGenerator } from "./ProxyGenerator";
import EditorActions from "./EditorActions";

interface IArtboardModel {
    version: number;
    proxyDefinition: string;
}

class EditorStore extends CarbonStore<any> implements IDisposable {
    private _initialized: boolean = false;
    private _editor: monaco.editor.IStandaloneCodeEditor;
    private _activeProxyModel: IArtboardModel;
    private _activeProxyModelDisposable: IDisposable;
    private _activeProxyVersion: number;
    private _modelsCache: { [id: string]: IArtboardModel }[] = [];
    private _codeCache: { [id: string]: monaco.editor.IModel }[] = [];
    private _currentEditorModel: monaco.editor.IModel;
    private _currentArtboard: IArtboard;
    private _editorDisposables: IDisposable[] = [];
    private _storeDisposables: IDisposable[] = [];

    initialize(editor: monaco.editor.IStandaloneCodeEditor) {
        if (this._editor !== editor) {
            this._editorDisposables.forEach(e => e.dispose());
            this._editorDisposables = [];

            if (this._editor) {
                this._editor.setModel(null); // detach current model if any
            }
            this._editor = editor;
            if (editor) {
                this._editor.setModel(this._currentEditorModel); // detach current model if any
                this.refreshProxyModel();
                this._editorDisposables.push(editor.onKeyDown(() => {
                    this.refreshProxyModel();
                }));

                this._editorDisposables.push(editor.onMouseDown(() => {
                    this.refreshProxyModel();
                }));
            }
        }

        if (this._initialized) {
            return;
        }

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            allowJs: false,
            noLib: true,
            // noEmitOnError:true,
            //alwaysStrict: true,
            allowNonTsExtensions: true,
            noResolve: true,
            noImplicitAny: true,
            noImplicitThis: true,
            noImplicitReturns: true,
            noImplicitUseStrict: true
        });

        this._storeDisposables.push(
            monaco.languages.typescript.typescriptDefaults.addExtraLib(platformCodeDefinition as string, 'filename/storage.d.ts')
        );
        this._initialized = true;
        this.changeArtboard(app.activePage.getActiveArtboard());
        this._storeDisposables.push(
            Environment.controller.onArtboardChanged.bind((artboard, oldArtboard) => {
                this.changeArtboard(artboard);
            })
        );
    }

    getArtboardFileName(artboard: IArtboard) {
        return "artboard.ts";
    }

    _setModelFromArtboard(artboard: IArtboard) {
        if (!artboard) {
            this._editor && this._editor.setModel(null);
            return;
        }
        let codeModel = this._codeCache[artboard.id()];
        if (!codeModel) {
            let code = artboard.code();
            if (!code) {
                code = emptyCode;
            }

            codeModel = monaco.editor.createModel(code, "typescript", monaco.Uri.parse(artboard.name() + ".ts"));
            this._codeCache[artboard.id()] = codeModel;
        }
        this._currentEditorModel = codeModel;
        this._editor && this._editor.setModel(codeModel);
    }

    changeArtboard(artboard: IArtboard) {
        if (artboard === this._currentArtboard) {
            return;
        }
        this._currentArtboard = artboard;

        this._setModelFromArtboard(artboard);
        this.refreshProxyModel(true);
    }

    getActiveArtboardProxyModel(): Promise<IArtboardModel> {
        var artboard = app.activePage.getActiveArtboard();
        if (!artboard) {
            return Promise.resolve(null);
        }

        let version = artboard.version;

        let currentModel = this._modelsCache[artboard.id()];
        if (currentModel && currentModel.version === version) {
            return Promise.resolve(currentModel);
        }

        return ArtboardProxyGenerator.generate(artboard).then((text) => {
            let res = { version, proxyDefinition: text };
            this._modelsCache[artboard.id()] = res;
            return res;
        });
    }

    refreshProxyModel(force?) {
        if (!this._currentArtboard || (!force && this._activeProxyVersion === this._currentArtboard.version)) {
            return;
        }
        this._activeProxyVersion = this._currentArtboard.version;
        this.getActiveArtboardProxyModel().then((model) => {
            // do not dispose active model before new one is ready
            if (this._activeProxyModelDisposable) {
                this._activeProxyModelDisposable.dispose();
                this._activeProxyModelDisposable = null;
            }

            if (model) {
                this._activeProxyModelDisposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(model.proxyDefinition, 'filename/proxy.d.ts');
            }
        });
    }

    @handles(EditorActions.run)
    onRun() {
        let model = this._currentEditorModel;
        if (!model) {
            return;
        }

        monaco.languages.typescript.getTypeScriptWorker().then(worker => {
            worker(model.uri).then(client => {
                client.getSyntacticDiagnostics(model.uri.toString()).then(result => {
                    if (result.length !== 0) {
                        // todo: log error
                    } else {
                        return client.getSemanticDiagnostics(model.uri.toString()).then(result => {
                            if (result.length !== 0) {
                                // todo log errors
                            } else {
                                return client.getEmitOutput(model.uri.toString()).then(result => {
                                    if (result.outputFiles && result.outputFiles.length) {
                                        return result.outputFiles[0].text;
                                    }
                                });
                            }
                        });
                    }
                }).then((code) => {
                    alert(code);
                })
            });
        });

    }

    dispose() {
        if (this._storeDisposables) {
            this._storeDisposables.forEach(e => e.dispose());
        }
    }
}

var store = new EditorStore();

ensureMonacoLoaded().then(() => { store.initialize(null); })

export default store;