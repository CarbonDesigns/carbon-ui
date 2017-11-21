import { CarbonStore, dispatch, handles } from "../CarbonFlux";
import Immutable from "immutable";
var runtimeCodeDefinition: string = require("raw!../../../carbon-core/mylibs/definitions/carbon-runtime.d.ts") as any;
var platformCodeDefinition: string = require("raw!./model/platform.d.ts") as any;
var emptyCode: string = require("./model/empty.txt") as any;

import { IDisposable, IArtboard, app, Environment, ArtboardProxyGenerator, Sandbox, PreviewProxy } from "carbon-core";
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

    private _onPageChangedBinding: IDisposable;

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
        let previewProxy = (Environment.controller as any).previewProxy;

        if (this.initialized || !previewProxy) {
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
            removeComments: true,
            strictNullChecks: true,
            alwaysStrict: true,
            target: monaco.languages.typescript.ScriptTarget.ES2016
        });

        // this.storeDisposables.push(
        //     monaco.editor.createModel(runtimeCodeFefinition as string, "typescript", monaco.Uri.parse("carbon-runtime.d.ts"))
        // );
        runtimeCodeDefinition = runtimeCodeDefinition.replace(/^.+export /gm, "");
        runtimeCodeDefinition = runtimeCodeDefinition.replace('declare module "carbon-runtime" {', '');
        let idx = runtimeCodeDefinition.lastIndexOf('}');
        runtimeCodeDefinition = runtimeCodeDefinition.substr(0, idx - 1);
        this.storeDisposables.push(
            monaco.languages.typescript.typescriptDefaults.addExtraLib(runtimeCodeDefinition as string, 'carbon-runtime.d.ts')
        );
        this.storeDisposables.push(
            monaco.languages.typescript.typescriptDefaults.addExtraLib(platformCodeDefinition as string, 'platform.d.ts')
        );
        this.initialized = true;
        // this.changeArtboard(app.activePage.getActiveArtboard());
        // this.storeDisposables.push(
        //     Environment.controller.onArtboardChanged.bind((artboard, oldArtboard) => {
        //         this.changeArtboard(artboard);
        //     })
        // );

        Environment.detaching.bind(() => {
            if (this._onPageChangedBinding) {
                this._onPageChangedBinding.dispose();
                this._onPageChangedBinding = null;
            }
        })
        this.changeArtboard(previewProxy.activeArtboard);
        this._onPageChangedBinding = previewProxy.onPageChanged.bind((page) => {
            this.changeArtboard(previewProxy.activeArtboard);
        });

        Environment.attached.bind((view, controller) => {
            let previewProxy = (controller as any).previewProxy;
            if (this._onPageChangedBinding) {
                this._onPageChangedBinding.dispose();
                this._onPageChangedBinding = null;
            }

            if (previewProxy) {
                this._onPageChangedBinding = previewProxy.onPageChanged.bind((page) => {
                    this.changeArtboard(previewProxy.activeArtboard);
                });
            }
        })
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

            codeModel = monaco.editor.createModel(code, "typescript", monaco.Uri.parse(artboard.name + ".ts"));
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

                this.activeProxyModelDisposable = monaco.editor.createModel(model.proxyDefinition, "typescript", monaco.Uri.parse("proxy.d.ts"));
                //this.activeProxyModelDisposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(model.proxyDefinition, 'proxy.d.ts');
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