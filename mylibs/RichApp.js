import {Dispatcher} from './CarbonFlux';
import RichAppStore from './RichAppStore';

import PagesStore from './pages/PagesStore';
import LayoutStore from './layout/LayoutStore';

import RichPanelConfig from "./RichPanelConfig";
import LibraryProgressStore from './library/LibraryProgressStore';
import SearchStencilsStore from './library/stencils/SearchStencilsStore';
import RecentStencilsStore from './library/stencils/RecentStencilsStore';


import SearchIconsStore from './library/icons/SearchIconsStore';

import RecentImagesStore from './library/images/RecentImagesStore';
import WorkspaceStore from "./workspace/WorkspaceStore";
import LayersStore from "./layers/LayersStore";
import ManageStylesDialogStore from "./properties/dialogs/ManageStylesDialogStore"

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

        this.appStore = RichAppStore;//new RichAppStore(this.Dispatcher);
        this.layoutStore = LayoutStore;

        this.pagesStore = new PagesStore(this.Dispatcher);

        this.libraryProgressStore = new LibraryProgressStore(this.Dispatcher);

        //this.stencilsQueries', require('./library/stencils/StencilsQueries'));
        this.searchStencilsStore = new SearchStencilsStore(this.Dispatcher);
        this.recentStencilsStore = new RecentStencilsStore(this.Dispatcher);

        this.searchIconsStore = new SearchIconsStore(this.Dispatcher);

        this.recentImagesStore = new RecentImagesStore(this.Dispatcher);
        //this.recentIconsStore', require('./library/icons/RecentIconsStore'));
        //this.iconFinderStore', require('./library/icons/IconFinderStore'));
        //this.searchIconsStore', require('./library/icons/SearchIconsStore'));

        // this.pagesActions', require('./pages/PagesActions').ActionCreators);
        // this.pagesStore', require('./pages/PagesStore'));

        this.layoutStore.setLayout("edit", RichPanelConfig.edit);

        this.workspaceStore = new WorkspaceStore(this.Dispatcher);
        this.layersStore = new LayersStore(this.Dispatcher);

        this.manageStylesDialogStore = new ManageStylesDialogStore(this.Dispatcher);
    }
}

export const app = new Application({});
export const richApp = app;
export const dispatcher = app.Dispatcher;