import CarbonActions from './CarbonActions';
import IdleDialog from "./workspace/IdleDialog";
import { dispatch, dispatchAction } from "./CarbonFlux";
import { app, backend, PropertyTracker, Selection, Environment, IDisposable, IPage } from "carbon-core";

let disposables: IDisposable[] = [];

export function registerEvents() {
    app.onLoad(() => {
        dispatch(CarbonActions.loaded(app))
    });

    app.modeChanged.bindAsync(mode => {
        dispatch((CarbonActions.modeChanged(mode)));
    });

    app.changed.bindAsync(events => {
        dispatch((CarbonActions.appChanged(events)));
    });

    app.restoredLocally.bindAsync(() => dispatch(CarbonActions.restoredLocally()));

    app.changeToolboxPage.bindAsync((page: IPage) => {
        dispatchAction({type: "Stencils_ChangePage", page});
    });

    app.currentToolChanged.bindAsync((tool) => {
        dispatch(CarbonActions.toolChanged(tool));
    });

    PropertyTracker.propertyChanged.bindAsync((e, props, oldProps) => dispatch(CarbonActions.propsChanged(e, props, oldProps)));

    Selection.onElementSelected.bindAsync((e, prevSelectedElements) =>
        dispatch(CarbonActions.elementSelected(e, prevSelectedElements)));

    Environment.detaching.bind(() => {
        disposables.forEach(x => x.dispose());
        disposables.length = 0;
    });

    Environment.attached.bind((view, controller) => {
        if (controller.inlineEditModeChanged) {
            let token = controller.inlineEditModeChanged.bindAsync(mode => dispatch(CarbonActions.inlineEditModeChanged(mode)));
            disposables.push(token);
        }

        if (view.activeLayerChanged){
            let token = view.activeLayerChanged.bindAsync(layer => dispatch(CarbonActions.activeLayerChanged(layer)));
            disposables.push(token);
        }

        let token = controller.onArtboardChanged.bindAsync((newArtboard, oldArtboard) =>
            dispatch(CarbonActions.activeArtboardChanged(oldArtboard, newArtboard)));
        disposables.push(token);
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
}

export default { registerEvents: registerEvents };

