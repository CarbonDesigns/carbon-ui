import {Dispatcher} from './CarbonFlux';

import LayoutStore from './layout/LayoutStore';

import RichPanelConfig from "./RichPanelConfig";
import LibraryProgressStore from './library/LibraryProgressStore';

import WorkspaceStore from "./workspace/WorkspaceStore";
// import ManageStylesDialogStore from "./properties/dialogs/ManageStylesDialogStore"

export class Application {
    dispatch(action) {
        if (action.async) {
            this.Dispatcher.dispatchAsync(action);
        } else {
            this.Dispatcher.dispatch(action);
        }
    }

    constructor(options) {
        this.Dispatcher = Dispatcher;
        window.richApp = this;

        this.layoutStore = LayoutStore;

        this.libraryProgressStore = new LibraryProgressStore(this.Dispatcher);

        this.layoutStore.setLayout("edit", RichPanelConfig.edit);

        this.workspaceStore = new WorkspaceStore(this.Dispatcher);

        // this.manageStylesDialogStore = new ManageStylesDialogStore(this.Dispatcher);
    }
}

export const app = new Application({});
export const richApp = app;
export const dispatcher = app.Dispatcher;
