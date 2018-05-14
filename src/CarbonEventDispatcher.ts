import CarbonActions from './CarbonActions';
import AppActions from "./RichAppActions";
import IdleDialog from "./workspace/IdleDialog";
import { dispatch, dispatchAction } from "./CarbonFlux";
import { app, backend, PropertyTracker, Selection, IDisposable, IPage, CommandManager } from "carbon-core";

let frequentTokens: IDisposable[] = [];

export function registerEvents() {
    app.onLoad(() => {
        dispatch(CarbonActions.loaded(app))

        app.actionManager.subscribe('cancel', ()=>dispatch(CarbonActions.cancel()));
    });


    app.updating.bind(() => {
        frequentTokens.forEach(x => x.dispose());
        frequentTokens.length = 0;
    });

    app.updated.bind(() => {
        let token = app.resourceAdded.bindAsync((resourceType, resource) => dispatchAction({ type: "Carbon_ResourceAdded", resourceType, resource }));
        frequentTokens.push(token);

        token = app.resourceChanged.bindAsync((resourceType, resource) => dispatchAction({ type: "Carbon_ResourceChanged", resourceType, resource }));
        frequentTokens.push(token);

        token = app.resourcePageChanged.bindAsync((page) => dispatchAction({ type: "Carbon_ResourcePageChanged", page }));
        frequentTokens.push(token);

        token = app.resourceDeleted.bindAsync((resourceType, resource, parent) => dispatchAction({ type: "Carbon_ResourceDeleted", resourceType, resource, parent }));
        frequentTokens.push(token);

        token = app.changed.bindAsync(primitives => dispatchAction({ type: "Carbon_AppChanged", primitives }));
        frequentTokens.push(token);

        token = app.recentColorsChanged.bindAsync(colors => dispatch((CarbonActions.recentColorsChanged(colors))));
        frequentTokens.push(token);

        token = PropertyTracker.propertyChanged.bindAsync((e, props, oldProps) => {
            dispatchAction({ type: "Carbon_PropsChanged", element: e, props, oldProps });
        });
        frequentTokens.push(token);

        dispatchAction({ type: "Carbon_AppUpdated" });
    });

    app.onsplash.bindAsync(data => {
        dispatch(AppActions.splashAction(data.progress, data.message));
    })

    app.modeChanged.bindAsync(mode => {
        dispatch((CarbonActions.modeChanged(mode)));
    });
    app.settingsChanged.bindAsync(settings => {
        dispatchAction({ type: "Carbon_AppSettingsChanged", settings });
    });

    Selection.onElementSelected.bindAsync((e) => {
        dispatchAction({ type: "Carbon_Selection", composite: e })
    });
    Selection.propertiesRequested.bindAsync((e) => {
        dispatchAction({ type: "Carbon_PropertiesRequested", composite: e })
    });

    app.pageChanged.bindAsync((oldPage, newPage) => dispatch(CarbonActions.pageChanged(oldPage, newPage)));
    app.pageAdded.bindAsync((page) => dispatch(CarbonActions.pageAdded(page)));
    app.pageRemoved.bindAsync((page) => dispatch(CarbonActions.pageRemoved(page)));

    app.actionManager.actionPerformed.bindAsync((name) => dispatch(CarbonActions.actionPerformed(name)));

    backend.requestStarted.bind(url => dispatchAction({ type: "Backend_RequestStarted", async: true, url }));
    backend.requestEnded.bind(url => dispatchAction({ type: "Backend_RequestEnded", async: true, url }));

    backend.connectionStateChanged.bind(state => {
        if (state.type === "stopped" && state.idle) {
            dispatchAction({ type: "Dialog_Show", dialogType: "IdleDialog" });
        }
    });

    CommandManager.stateChanged.bind(this, (e) => {
        dispatch(AppActions.canUndoRedo(e.canUndo, e.canRedo));
    });
}

export default { registerEvents: registerEvents };

