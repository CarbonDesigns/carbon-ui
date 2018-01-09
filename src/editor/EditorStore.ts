import { CarbonStore, dispatch, handles } from "../CarbonFlux";
import Immutable from "immutable";

var emptyCode: string = require("./model/empty.txt") as any;

//import { IDisposable, IArtboard, app, Environment, Sandbox, PreviewModel, util, AutoDisposable, Services } from "carbon-core";
import * as core from "carbon-core";
import { ensureMonacoLoaded } from "./MonacoLoader";
import EditorActions from "./EditorActions";
import { instanceOf } from "../../node_modules/@types/prop-types/index";
import { Page, NullPage } from "carbon-core";

interface IEditorStoreState {
    currentItem?: core.IElementWithCode & core.IDisposable;
    codeItems?: { name: string, id: string }[];
    hasPreview?: boolean;
    currentItemName?: string;
}

class EditorStore extends CarbonStore<IEditorStoreState> implements core.IDisposable {
    private initialized: boolean = false;
    private editor: monaco.editor.IStandaloneCodeEditor;
    // private activeProxyModel: IArtboardModel;
    private proxyModelDisposable = new core.AutoDisposable();
    private storeDisposables = new core.AutoDisposable();
    private globalModelDisposable = new core.AutoDisposable();
    private activeProxyVersion: number;
    // private modelsCache: { [id: string]: IArtboardModel }[] = [];
    private codeCache: { [id: string]: monaco.editor.IModel }[] = [];
    private currentEditorModel: monaco.editor.IModel;
    private parentEditorModel: monaco.editor.IModel;
    private editorDisposables: core.IDisposable[] = [];

    private _onPageChangedBinding: core.IDisposable;
    private _ignoreChange: boolean = false;

    private _restartModel: () => void;
    constructor(dispatcher?) {
        super(dispatcher);
        this._restartModel = core.util.debounce(this.restartModel, 30);
        this.state = { currentItem: null, codeItems: [] };
    }

    initialize(editor: monaco.editor.IStandaloneCodeEditor) {
        this._setEditor(editor);

        let previewModel = (core.Environment.controller as any).previewModel;
        if (!previewModel) {
            return;
        }

        let name = null;
        if (previewModel.activeArtboard) {
            name = previewModel.activeArtboard.name
        }
        this.setState({ currentItem: previewModel.activeArtboard, currentItemName: name, codeItems: this._codeItemsMetainfo() });

        if (this.initialized) {
            return;
        }

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            allowJs: false,
            noLib: true,
            // noEmitOnError:true,
            allowNonTsExtensions: true,
            noResolve: false,
            noImplicitAny: true,
            noImplicitThis: true,
            noImplicitReturns: true,
            noImplicitUseStrict: true,
            removeComments: true,
            strictNullChecks: true,
            alwaysStrict: true,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            rootDir: "./"
        });

        var staticLibs = core.Services.compiler.codeProvider.getStaticLibs();
        var libNames = Object.keys(staticLibs);

        for (var lib of libNames) {
            this.storeDisposables.add(
                monaco.languages.typescript.typescriptDefaults.addExtraLib(staticLibs[lib].text(), lib)
            );
        }

        this.initialized = true;

        core.Environment.detaching.bind(() => {
            if (this._onPageChangedBinding) {
                this._onPageChangedBinding.dispose();
                this._onPageChangedBinding = null;
            }
        });

        this.setFromArtboard(previewModel.activeArtboard);
        this._onPageChangedBinding = previewModel.onPageChanged.bind((page) => {
            dispatch(EditorActions.changeArtboard(previewModel.activeArtboard));
        });

        core.Environment.attached.bind((view, controller) => {
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

    private _codeItemsMetainfo() {
        let page = core.app.activePage;
        return [
            { id: page.id, name: page.name, type: 'page' }
        ].concat(page.getAllArtboards(true).reverse().map(a => { return { id: a.id, name: a.name, type: "artboard" } }));
    }

    @handles(EditorActions.changeArtboard)
    onChangeArtboard({ artboard }) {
        if (artboard) {
            this.setFromArtboard(artboard);
        }
    }

    @handles(EditorActions.showPageCode)
    onShowPageCode({ id }) {
        let page = core.app.getImmediateChildById(id, true);
        if (page) {
            this.setFromPage(page as any);
        }
    }

    _contentChanged = (event: monaco.editor.IModelContentChangedEvent) => {
        if (!this.state.hasPreview) {
            (this.state.currentItem as any).code(this.currentEditorModel.getValue());
        } else {
            let previewModel = (core.Environment.controller as any).previewModel;
            let previewArtboard = previewModel.activeArtboard;

            if (previewArtboard && previewArtboard.runtimeProps.sourceArtboard) {
                previewArtboard.runtimeProps.sourceArtboard.code(this.currentEditorModel.getValue());
                this._restartModel();
            }
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

                this.editorDisposables.push(this.editor.onDidChangeModelContent(core.util.debounce(this._contentChanged, 1000)));
            }
        }
    }

    getArtboardFileName(artboard: core.IArtboard) {
        return "artboard.ts";
    }

    _setModelFromArtboard(artboard: core.IArtboard) {
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
            this.codeCache[artboard.id] = codeModel;
        }
        this.currentEditorModel = codeModel;
        this.editor && this.editor.setModel(codeModel);
    }

    _setModelFromPage(page: core.IPage & core.IElementWithCode) {
        if (!page) {
            this.editor && this.editor.setModel(null);
            return;
        }
        let pageModelName = './' + core.CodeNameProvider.escapeName(page.name) + ".ts";
        let codeModel: monaco.editor.IModel = this.codeCache[pageModelName];
        if (!codeModel) {
            let code = page.code();
            if (!code) {
                code = emptyCode;
            }

            codeModel = monaco.editor.createModel(code, "typescript", monaco.Uri.parse(pageModelName));
            this.codeCache[pageModelName] = codeModel;
        }

        this.currentEditorModel = codeModel;
        this.editor && this.editor.setModel(codeModel);
    }

    setFromArtboard(artboard: core.IArtboard) {
        if (artboard === this.state.currentItem) {
            return;
        }

        let hasSameSource = (artboard as any).name === this.state.currentItemName;

        this.setState({ currentItem: artboard, currentItemName: artboard.name, hasPreview: true });

        if (hasSameSource) {
            return;
        }

        this.globalModelDisposable.dispose();
        this._setModelFromArtboard(artboard);
        this.refreshProxyModel(true);

        if ((artboard as any).runtimeProps && (artboard as any).runtimeProps.sourceArtboard) {
            let models = core.Services.compiler.codeProvider.getGlobalModels((artboard as any).runtimeProps.sourceArtboard);
            let libNames = Object.keys(models);
            for (let libName of libNames) {
                let lib = this.codeCache[libName];;
                if (lib) {
                    lib.dispose();
                    this.codeCache[libName] = null;
                }
                this.globalModelDisposable.add(
                    //monaco.editor.createModel(models[libName].text(), "typescript", monaco.Uri.parse(libName))
                    monaco.languages.typescript.typescriptDefaults.addExtraLib(models[libName].text(), libName)
                );
            }
        }
    }

    setFromPage(page: core.IPage & core.IElementWithCode) {
        if (page === this.state.currentItem) {
            return;
        }
        this.globalModelDisposable.dispose();

        this.setState({ currentItem: page, currentItemName: page.name, hasPreview: false });

        this._setModelFromPage(page);
        this.proxyModelDisposable.dispose();
        let previewModel = (core.Environment.controller as any).previewModel;
        if (!previewModel) {
            return;
        }

        previewModel.activePage = NullPage;
    }

    refreshProxyModel(force?) {
        if (!this.state.currentItem || (this.state.currentItem as any).isDisposed() || (!force && this.activeProxyVersion === this.state.currentItem.version)) {
            return;
        }

        let previewModel = (core.Environment.controller as any).previewModel;
        if (!previewModel || !previewModel.activeArtboard) {
            return;
        }

        var artboard: core.IArtboard = previewModel.activeArtboard.runtimeProps.sourceArtboard;
        if (!artboard) {
            return;
        }

        this.activeProxyVersion = this.state.currentItem.version;
        this.proxyModelDisposable.dispose();

        let dynamicLibs = core.Services.compiler.codeProvider.getDynamicLibs(artboard, false);
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
                    if (this.state.hasPreview) {
                        dispatch(EditorActions.restart());
                    }
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