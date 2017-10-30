import AppActions from "./RichAppActions";
import CarbonActions, { CarbonAction } from "./CarbonActions"
import { handles, CarbonStore, Dispatcher, dispatch } from './CarbonFlux';
import RichPanelConfig from './RichPanelConfig';
import LayoutActions from './layout/LayoutActions';
import { Selection, app, CommandManager, Environment, IDisposable, backend, WorkspaceTool } from "carbon-core";
import { ProjectAvatars } from "./Constants";

type AppStoreState = {
    mainMenuVisible: boolean;
    frameVisible: boolean;
    activeTool: string;
    canUndo: boolean;
    canRedo: boolean;
    selectionCount: number;
    scale: number;
    activeMode: string;
    loaded: boolean;
    appName: string;
    appAvatar: string;
}

class AppStore extends CarbonStore<AppStoreState> {
    private scaleChangedToken: IDisposable;

    constructor() {
        super();

        this.state = {
            mainMenuVisible: false,
            frameVisible: false,
            activeTool: Environment.controller ? Environment.controller.currentTool : "pointerTool",
            canUndo: false,
            canRedo: false,
            selectionCount: 0,
            scale: Environment.view ? Environment.view.scale() : 0,
            activeMode: 'edit',
            loaded: false,
            appName: app.props.name,
            appAvatar: app.props.avatar
        };
    }

    onAction(action: CarbonAction) {
        super.onAction(action);

        switch (action.type) {
            case "Carbon_Selection":
                this.onSelectionChanged();
                return;
            case "Carbon_AppSettingsChanged":
                this.setState({ appName: action.settings.name, appAvatar: action.settings.avatar });
                return;
            case "Carbon_ScaleChanged":
                this.setState({ scale: action.scale });
                return;
            case "Carbon_AppUpdated":
                this.setState({ appName: app.name() });
                return;
        }
    }

    @handles(AppActions.canUndoRedo)
    onCanUndo({ canUndo, canRedo }) {
        this.setState({ canUndo, canRedo });
    }

    onSelectionChanged() {
        this.setState({ selectionCount: Selection.elements.length });
    }

    _switchMode(mode) {
        this.setState({ activeMode: mode });

        if (mode === "edit") {
            Environment.controller.resetCurrentTool();
        }
        else if (mode === "prototype") {
            app.actionManager.invoke("protoTool" as WorkspaceTool);
        }
        dispatch(LayoutActions.setLayout(mode, RichPanelConfig[mode]));
    }

    _onScaleChanged = () => {
        this.setState({ scale: Environment.view.scale() });
    }

    @handles(CarbonActions.loaded)
    onLoaded(action) {
        if (app.props.avatar === null) {
            app.setProps({ avatar: this.getRandomAvatarUrl() });
        }

        this.setState({ loaded: true });
    }

    getRandomAvatarUrl() {
        let id = (Math.random() * ProjectAvatars) % ProjectAvatars | 0;
        return backend.cdnEndpoint + `/img/ava/project-${id}.png`;
    }

    @handles(CarbonActions.modeChanged)
    onModeChanged({ mode }) {
        this._switchMode(mode);
    }

    @handles(CarbonActions.toolChanged)
    onToolChanged({ tool }) {
        this.setState({ activeTool: tool });
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
    switchFrameState({ frameVisible }) {
        // this.setState({frameVisible: frameVisible});
        // if (this.app) {
        //     this.app.activePage.isPhoneVisible(frameVisible);
        // }
    }
}

export default new AppStore();
