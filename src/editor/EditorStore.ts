import { CarbonStore, dispatch, handles } from "../CarbonFlux";
import Immutable from "immutable";
// var RuntimeTSDefinition: string = require("raw!../../../carbon-core/mylibs/definitions/carbon-runtime.d.ts") as any;
var platformCodeDefinition: string = require("raw!./model/platform.d.ts") as any;
var emptyCode: string = require("./model/empty.txt") as any;

import { RuntimeTSDefinition, CompiledCodeProvider, IDisposable, IArtboard, app, Environment, Sandbox, PreviewModel, util } from "carbon-core";
import { ensureMonacoLoaded } from "./MonacoLoader";
import EditorActions from "./EditorActions";
import { CompilerService } from "../compiler/CompilerService";


interface IArtboardModel {
    version: number;
    name: string;
    proxyDefinition: string;
}

interface IEditorStoreState {
    currentArtboard?: IArtboard;
    artboards?: { name: string, id: string }[];
}

class EditorStore extends CarbonStore<IEditorStoreState> implements IDisposable {
    private initialized: boolean = false;
    private editor: monaco.editor.IStandaloneCodeEditor;
    private activeProxyModel: IArtboardModel;
    private activeProxyModelDisposable: IDisposable;
    private activeProxyVersion: number;
    private modelsCache: { [id: string]: IArtboardModel }[] = [];
    private codeCache: { [id: string]: monaco.editor.IModel }[] = [];
    private currentEditorModel: monaco.editor.IModel;
    private editorDisposables: IDisposable[] = [];
    private storeDisposables: IDisposable[] = [];

    private _onPageChangedBinding: IDisposable;

    private _restartModel: () => void;
    constructor(dispatcher?) {
        super(dispatcher);
        this._restartModel = util.debounce(this.restartModel, 200);
        this.state = { currentArtboard: null, artboards: [] };
    }

    initialize(editor: monaco.editor.IStandaloneCodeEditor) {
        this._setEditor(editor);

        let previewModel = (Environment.controller as any).previewModel;
        if (!previewModel) {
            return;
        }
        this.setState({ currentArtboard: previewModel.activeArtboard, artboards: this._artboardsMetainfo() });

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
            removeComments: true,
            strictNullChecks: true,
            alwaysStrict: true,
            target: monaco.languages.typescript.ScriptTarget.ES2016
        });

        let code = RuntimeTSDefinition;
        this.storeDisposables.push(
            monaco.languages.typescript.typescriptDefaults.addExtraLib(code as string, 'carbon-runtime.d.ts')
        );
        this.storeDisposables.push(
            monaco.languages.typescript.typescriptDefaults.addExtraLib(platformCodeDefinition as string, 'platform.d.ts')
        );
        this.initialized = true;

        Environment.detaching.bind(() => {
            if (this._onPageChangedBinding) {
                this._onPageChangedBinding.dispose();
                this._onPageChangedBinding = null;
            }
        });

        this.changeArtboard(previewModel.activeArtboard);
        this._onPageChangedBinding = previewModel.onPageChanged.bind((page) => {
            dispatch(EditorActions.changeArtboard(previewModel.activeArtboard));
        });

        Environment.attached.bind((view, controller) => {
            let previewModel = (controller as any).previewModel;
            if (this._onPageChangedBinding) {
                this._onPageChangedBinding.dispose();
                this._onPageChangedBinding = null;
            }

            if (previewModel) {
                this._onPageChangedBinding = previewModel.onPageChanged.bind((page) => {
                    dispatch(EditorActions.changeArtboard(previewModel.activeArtboard));
                });
            }
        });

        // TODO: bind on event to refresh list of artboards
    }

    private _artboardsMetainfo() {
        return app.activePage.getAllArtboards().reverse().map(a => { return { id: a.id, name: a.name } });
    }

    @handles(EditorActions.changeArtboard)
    onChangeArtboard({ artboard }) {
        this.changeArtboard(artboard);
    }

    _contentChanged = (event: monaco.editor.IModelContentChangedEvent) => {
        let previewModel = (Environment.controller as any).previewModel;
        previewModel.sourceArtboard.code(this.currentEditorModel.getValue());
        this._restartModel();
    }

    _setEditor(editor: monaco.editor.IStandaloneCodeEditor) {
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

                this.editorDisposables.push(this.editor.onDidChangeModelContent(util.debounce(this._contentChanged, 1000)));
            }
        }
    }

    getArtboardFileName(artboard: IArtboard) {
        return "artboard.ts";
    }

    _setModelFromArtboard(artboard: IArtboard) {
        if (!artboard) {
            this.editor && this.editor.setModel(null);
            return;
        }
        let codeModel: monaco.editor.IModel = this.codeCache[artboard.id];
        if (!codeModel) {
            let code = artboard.code();
            if (!code) {
                code = emptyCode;
            }

            codeModel = monaco.editor.createModel(code, "typescript", monaco.Uri.parse(artboard.id + ".ts"));
            let range = new monaco.Range(1, 0, 99999, 0);
            (codeModel as any).setEditableRange(range);

            this.codeCache[artboard.id] = codeModel;
        }
        this.currentEditorModel = codeModel;
        this.editor && this.editor.setModel(codeModel);
    }

    changeArtboard(artboard: IArtboard) {
        if (artboard === this.state.currentArtboard) {
            return;
        }

        this.setState({ currentArtboard: artboard });

        this._setModelFromArtboard(artboard);
        this.refreshProxyModel(true);
    }

    getActiveArtboardProxyModel(): Promise<IArtboardModel> {
        var artboard = this.state.currentArtboard;
        if (!artboard) {
            return Promise.resolve(null);
        }

        let version = artboard.version;

        let currentModel = this.modelsCache[artboard.id];
        if (currentModel && currentModel.version === version) {
            return Promise.resolve(currentModel);
        }

        let res = { version, proxyDefinition: artboard.declaration(), name: artboard.name };
        this.modelsCache[artboard.id] = res;
        return Promise.resolve(res);
    }

    refreshProxyModel(force?) {
        if (!this.state.currentArtboard || (!force && this.activeProxyVersion === this.state.currentArtboard.version)) {
            return;
        }

        this.activeProxyVersion = this.state.currentArtboard.version;
        this.getActiveArtboardProxyModel().then((model) => {
            // do not dispose active model before new one is ready
            if (this.activeProxyModelDisposable) {
                this.activeProxyModelDisposable.dispose();
                this.activeProxyModelDisposable = null;
            }

            if (model) {
                this.activeProxyModelDisposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(model.proxyDefinition, 'proxy.d.ts');
            }
        });
    }

    @handles(EditorActions.restart)
    restartModel() {
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
                    // if (code) {
                    //     new Sandbox().runOnElement(this.currentArtboard, code);
                    // }
                    dispatch(EditorActions.restart());
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