import CarbonActions from './CarbonActions';
import AppActions from "./RichAppActions";
import IdleDialog from "./workspace/IdleDialog";
import { dispatch, dispatchAction } from "./CarbonFlux";
import { app, backend, PropertyTracker, Selection, Environment, IDisposable, IPage, CommandManager } from "carbon-core";

let workspaceTokens: IDisposable[] = [];
let frequentAppTokens: IDisposable[] = [];

export function registerEvents() {
    app.onLoad(() => {
        dispatch(CarbonActions.loaded(app))
    });

    app.updating.bind(() => {
        frequentAppTokens.forEach(x => x.dispose());
        frequentAppTokens.length = 0;
    });

    app.updated.bind(() => {
        let token = app.resourceAdded.bindAsync((resourceType, resource) => dispatchAction({type: "Carbon_ResourceAdded", resourceType, resource}));
        frequentAppTokens.push(token);

        token = app.resourceChanged.bindAsync((resourceType, resource) => dispatchAction({type: "Carbon_ResourceChanged", resourceType, resource}));
        frequentAppTokens.push(token);

        token = app.resourcePageChanged.bindAsync((page) => dispatchAction({type: "Carbon_ResourcePageChanged", page}));
        frequentAppTokens.push(token);

        token = app.resourceDeleted.bindAsync((resourceType, resource, parent) => dispatchAction({type: "Carbon_ResourceDeleted", resourceType, resource, parent}));
        frequentAppTokens.push(token);

        token = app.changed.bindAsync(events => dispatch((CarbonActions.appChanged(events))));
        frequentAppTokens.push(token);

        dispatchAction({ type: "Carbon_AppUpdated" });
    });

    app.modeChanged.bindAsync(mode => {
        dispatch((CarbonActions.modeChanged(mode)));
    });
    app.currentToolChanged.bindAsync((tool) => {
        dispatch(CarbonActions.toolChanged(tool));
    });
    app.settingsChanged.bindAsync(settings => {
        dispatchAction({ type: "Carbon_AppSettingsChanged", settings });
    });

    PropertyTracker.propertyChanged.bindAsync((e, props, oldProps) => dispatchAction({ type: "Carbon_PropsChanged", element: e, props, oldProps }));

    Selection.onElementSelected.bindAsync((e, prevSelectedElements) =>
        dispatch(CarbonActions.elementSelected(e, prevSelectedElements)));

    Environment.detaching.bind(() => {
        workspaceTokens.forEach(x => x.dispose());
        workspaceTokens.length = 0;
    });

    Environment.attached.bind((view, controller) => {
        if (controller.inlineEditModeChanged) {
            let token = controller.inlineEditModeChanged.bindAsync(mode => dispatch(CarbonActions.inlineEditModeChanged(mode)));
            workspaceTokens.push(token);
        }

        if (view.activeLayerChanged){
            let token = view.activeLayerChanged.bindAsync(layer => dispatch(CarbonActions.activeLayerChanged(layer)));
            workspaceTokens.push(token);
        }

        let token = controller.onArtboardChanged.bindAsync((newArtboard, oldArtboard) =>
            dispatch(CarbonActions.activeArtboardChanged(oldArtboard, newArtboard)));
        workspaceTokens.push(token);

        if (view.scaleChanged) {
            let token = view.scaleChanged.bindAsync(scale => dispatchAction({ type: "Carbon_ScaleChanged", scale }));
            workspaceTokens.push(token);
        }
    });

    app.pageChanged.bindAsync((oldPage, newPage) => dispatch(CarbonActions.pageChanged(oldPage, newPage)));
    app.pageAdded.bindAsync((page) => dispatch(CarbonActions.pageAdded(page)));
    app.pageRemoved.bindAsync((page) => dispatch(CarbonActions.pageRemoved(page)));

    app.actionManager.actionPerformed.bindAsync((name) => dispatch(CarbonActions.actionPerformed(name)));

    backend.requestStarted.bind(url => dispatchAction({type: "Backend_RequestStarted", async: true, url}));
    backend.requestEnded.bind(url => dispatchAction({type: "Backend_RequestEnded", async: true, url}));

    backend.connectionStateChanged.bind(state => {
        if (state.type === "stopped" && state.idle){
            dispatchAction({type: "Dialog_Show", dialogType: "IdleDialog"});
        }
    });

    CommandManager.stateChanged.bind(this, (e)=> {
        dispatch(AppActions.canUndoRedo(e.canUndo, e.canRedo));
    });
}

export default { registerEvents: registerEvents };

