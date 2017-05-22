import AppActions from "./RichAppActions";
import CarbonActions from "./CarbonActions"
import {handles, CarbonStore, Dispatcher} from './CarbonFlux';
import {richApp} from './RichApp';
import RichPanelConfig from './RichPanelConfig';
import LayoutActions from './layout/LayoutActions';
import {Selection, app, CommandManager, Environment, ViewTool} from "carbon-core";

class RichAppStore extends CarbonStore<any> {
    [name: string]: any;
    constructor(props) {
        super(props);
        this.state = {
            mainMenuVisible: false,
            frameVisible: false,
            activeTool: app.currentTool,
            canUndo: false,
            canRedo: false,
            selectionCount: 0,
            scale: Environment.view?Environment.view.scale():0,
            activeMode: 'edit',
            fullscreen: false,
            loaded: false
        };

        CommandManager.stateChanged.bind(this, (e)=> {
            richApp.Dispatcher.dispatchAsync(AppActions.canUndoRedo(e.canUndo, e.canRedo));
        });

        this.scaleChangedToken = null;

        this._bindToView(Environment.view);
        Environment.attached.bind(this, (view)=>{
            this._bindToView(view);
        });
    }

    @handles(AppActions.canUndoRedo)
    onCanUndo({canUndo, canRedo}) {
        this.setState({canUndo, canRedo});
    }

    @handles(AppActions.selectionChanged)
    onSelectionChanged({selection}) {
        this.setState({selectionCount: selection.length});
    }

    _switchMode(mode) {
        this.setState({activeMode: mode});

        if (mode === "edit") {
            app.resetCurrentTool();
        } else if (mode === "prototype") {
            app.actionManager.invoke(ViewTool.Proto);
        }
        richApp.dispatch(LayoutActions.setLayout(mode, RichPanelConfig[mode]));
    }

    _onScaleChanged = ()=> {
        var view = Environment.view;
        richApp.dispatch(AppActions.changeCurrentPageScale(view.scale()));
    }

    @handles(CarbonActions.loaded)
    onLoaded(action) {
        var app = action.app;
        var view = Environment.view;

        this.app = app;
        Selection.onElementSelected.bind((e: any) => {
            richApp.Dispatcher.dispatchAsync(AppActions.selectionChanged(e.elements));
        })

        app.pageChanged.bind((oldPage, newPage)=> {
            richApp.Dispatcher.dispatchAsync(AppActions.changeCurrentPageScale(newPage.scale()));
        });

        var fApi = window['fullScreenApi'];
        if (!fApi.supportsFullScreen) {
            return;
        }

        var that = this;
        document.addEventListener(fApi.fullScreenEventName, function (e) {
            richApp.Dispatcher.dispatchAsync(AppActions.fullscreenEvent(!that.state.fullscreen))
        }, true);

        this.setState({loaded: true});
    }

    @handles(AppActions.fullscreenEvent)
    onFullscreenEvent({fullscreen}) {
        this.setState({fullscreen: fullscreen});
    }

    _bindToView(view){
        if(this.scaleChangedToken){
            this.scaleChangedToken.dispose();
        }
        if(!view){
            return;
        }

        this.scaleChangedToken = view.scaleChanged.bind(this, this._onScaleChanged);
        this._onScaleChanged();
    }

    @handles(CarbonActions.modeChanged)
    onModeChanged({mode}) {
        this._switchMode(mode);
    }

    @handles(CarbonActions.toolChanged)
    onToolChanged({tool}) {
        this.setState({activeTool: tool});
    }

    // @handles(AppActions.showMainMenu)
    // onShowMenu() {
    //     this.setState({mainMenuVisible: true});
    // }
    //
    // @handles(AppActions.hideMainMenu)
    // onHideMenu() {
    //     this.setState({mainMenuVisible: false});
    // }

    @handles(AppActions.switchFrameState)
    switchFrameState({frameVisible}) {
        // this.setState({frameVisible: frameVisible});
        // if (this.app) {
        //     this.app.activePage.isPhoneVisible(frameVisible);
        // }
    }

    @handles(AppActions.changeCurrentPageScale)
    onPageScaleChanged({scale}) {
        this.setState({scale: scale});
    }
}

export default new RichAppStore(Dispatcher);
