import { CarbonStore, dispatch, handles } from "../CarbonFlux";
import Immutable from "immutable";
import platformCodeDefinition from "./model/platform.txt";
var emptyCode: any = require("./model/empty.txt");

import { IDisposable, IArtboard, app, Environment, ArtboardProxyGenerator, Sandbox } from "carbon-core";
import { ensureMonacoLoaded } from "./MonacoLoader";
import EditorActions from "./EditorActions";

interface IArtboardModel {
    version: number;
    proxyDefinition: string;
}

class EditorStore extends CarbonStore<any> implements IDisposable {
    private initialized: boolean = false;
    private editor: monaco.editor.IStandaloneCodeEditor;
    private activeProxyModel: IArtboardModel;
    private activeProxyModelDisposable: IDisposable;
    private activeProxyVersion: number;
    private modelsCache: { [id: string]: IArtboardModel }[] = [];
    private codeCache: { [id: string]: monaco.editor.IModel }[] = [];
    private currentEditorModel: monaco.editor.IModel;
    private currentArtboard: IArtboard;
    private editorDisposables: IDisposable[] = [];
    private storeDisposables: IDisposable[] = [];

    private proxyGenerator = new ArtboardProxyGenerator();

    initialize(editor: monaco.editor.IStandaloneCodeEditor) {
        if (this.editor !== editor) {
            this.editorDisposables.forEach(e => e.dispose());
            this.editorDisposables = [];

            if (this.editor) {
                this.editor.setModel(null); // detach current model if any
            }
            this.editor = editor;
            if (editor) {
                this.editor.setModel(this.currentEditorModel); // detach current model if any
                this.refreshProxyModel();
                this.editorDisposables.push(editor.onKeyDown(() => {
                    this.refreshProxyModel();
                }));

                this.editorDisposables.push(editor.onMouseDown(() => {
                    this.refreshProxyModel();
                }));
            }
        }

        if (this.initialized) {
            return;
        }

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            allowJs: false,
            noLib: true,
            // noEmitOnError:true,
            allowNonTsExtensions: true,
            noResolve: true,
            noImplicitAny: true,
            noImplicitThis: true,
            noImplicitReturns: true,
            noImplicitUseStrict: true,
            removeComments:true,
            strictNullChecks:true,
            alwaysStrict:true,
            target: monaco.languages.typescript.ScriptTarget.ES2016
        });

        this.storeDisposables.push(
            monaco.languages.typescript.typescriptDefaults.addExtraLib(platformCodeDefinition as string, 'filename/storage.d.ts')
        );
        this.initialized = true;
        this.changeArtboard(app.activePage.getActiveArtboard());
        this.storeDisposables.push(
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
            this.editor && this.editor.setModel(null);
            return;
        }
        let codeModel = this.codeCache[artboard.id()];
        if (!codeModel) {
            let code = artboard.code();
            if (!code) {
                code = emptyCode;
            }

            codeModel = monaco.editor.createModel(code, "typescript", monaco.Uri.parse(artboard.name() + ".ts"));
            this.codeCache[artboard.id()] = codeModel;
        }
        this.currentEditorModel = codeModel;
        this.editor && this.editor.setModel(codeModel);
    }

    changeArtboard(artboard: IArtboard) {
        if (artboard === this.currentArtboard) {
            return;
        }
        this.currentArtboard = artboard;

        this._setModelFromArtboard(artboard);
        this.refreshProxyModel(true);
    }

    getActiveArtboardProxyModel(): Promise<IArtboardModel> {
        var artboard = app.activePage.getActiveArtboard();
        if (!artboard) {
            return Promise.resolve(null);
        }

        let version = artboard.version;

        let currentModel = this.modelsCache[artboard.id()];
        if (currentModel && currentModel.version === version) {
            return Promise.resolve(currentModel);
        }

        return this.proxyGenerator.generate(artboard).then((text) => {
            let res = { version, proxyDefinition: text };
            this.modelsCache[artboard.id()] = res;
            return res;
        });
    }

    refreshProxyModel(force?) {
        if (!this.currentArtboard || (!force && this.activeProxyVersion === this.currentArtboard.version)) {
            return;
        }
        this.activeProxyVersion = this.currentArtboard.version;
        this.getActiveArtboardProxyModel().then((model) => {
            // do not dispose active model before new one is ready
            if (this.activeProxyModelDisposable) {
                this.activeProxyModelDisposable.dispose();
                this.activeProxyModelDisposable = null;
            }

            if (model) {
                this.activeProxyModelDisposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(model.proxyDefinition, 'filename/proxy.d.ts');
            }
        });
    }

    @handles(EditorActions.run)
    onRun() {
        let model = this.currentEditorModel;
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
                    if (code) {
                        new Sandbox().runOnArtboard(this.currentArtboard, code);
                    }
                })
            });
        });

    }

    dispose() {
        if (this.storeDisposables) {
            this.storeDisposables.forEach(e => e.dispose());
        }
    }
}

var store = new EditorStore();

ensureMonacoLoaded().then(() => { store.initialize(null); })

export default store;