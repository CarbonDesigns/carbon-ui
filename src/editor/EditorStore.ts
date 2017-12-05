import { CarbonStore, dispatch, handles } from "../CarbonFlux";
import Immutable from "immutable";

var emptyCode: string = require("./model/empty.txt") as any;

import { IDisposable, IArtboard, app, Environment, Sandbox, PreviewModel, util, AutoDisposable } from "carbon-core";
import { ensureMonacoLoaded } from "./MonacoLoader";
import EditorActions from "./EditorActions";
import { CompilerService } from "../compiler/CompilerService";

interface IEditorStoreState {
    currentArtboard?: IArtboard;
    artboards?: { name: string, id: string }[];
}

class EditorStore extends CarbonStore<IEditorStoreState> implements IDisposable {
    private initialized: boolean = false;
    private editor: monaco.editor.IStandaloneCodeEditor;
    // private activeProxyModel: IArtboardModel;
    private proxyModelDisposable = new AutoDisposable();
    private storeDisposables = new AutoDisposable();
    private activeProxyVersion: number;
    // private modelsCache: { [id: string]: IArtboardModel }[] = [];
    private codeCache: { [id: string]: monaco.editor.IModel }[] = [];
    private currentEditorModel: monaco.editor.IModel;
    private editorDisposables: IDisposable[] = [];

    private _onPageChangedBinding: IDisposable;
    private _ignoreChange:boolean = false;

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

        var staticLibs = previewModel.codeProvider.getStaticLibs();
        var libNames = Object.keys(staticLibs);
        for (var lib of libNames) {
            this.storeDisposables.add(
                monaco.languages.typescript.typescriptDefaults.addExtraLib(staticLibs[lib].text(), lib)
            );
        }

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
        if (previewModel.sourceArtboard) {
            previewModel.sourceArtboard.code(this.currentEditorModel.getValue());
            this._restartModel();
        }
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

    refreshProxyModel(force?) {
        if (!this.state.currentArtboard || (!force && this.activeProxyVersion === this.state.currentArtboard.version)) {
            return;
        }

        let previewModel = (Environment.controller as any).previewModel;
        if (!previewModel) {
            return;
        }

        var artboard: IArtboard = previewModel.sourceArtboard;
        if (!artboard) {
            return;
        }

        this.activeProxyVersion = this.state.currentArtboard.version;
        this.proxyModelDisposable.dispose();

        let dynamicLibs = previewModel.codeProvider.getDynamicLibs(artboard, false);
        let libNames = Object.keys(dynamicLibs);
        for (let libName of libNames) {
            this.proxyModelDisposable.add(
                monaco.languages.typescript.typescriptDefaults.addExtraLib(dynamicLibs[libName].text(), libName)
            );
        }
    }

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
        this.storeDisposables.dispose();
    }
}

var store = new EditorStore();

ensureMonacoLoaded().then(() => { store.initialize(null); })

export default store;