import { CarbonStore, dispatchAction } from "../../CarbonFlux";
import { IPage, app, IDisposable, ToolboxConfiguration } from "carbon-core";
import { CarbonAction } from "../../CarbonActions";
import { StencilsAction } from "./StencilsActions";

export type SymbolsStoreState = {
    dirtyConfig: boolean;
    changedId: string;
    config: any;
    currentPage: IPage;
};

class SymbolsStore extends CarbonStore<SymbolsStoreState> {
    private dirtyConfigToken: IDisposable;

    onAction(action: StencilsAction | CarbonAction) {
        switch (action.type) {
            case "Stencils_Refresh":
                this.refreshLibrary();
                return;
            case "Stencils_ChangePage":
                this.loadConfig(action.page);
                return;
            case "Stencils_Loaded":
                this.setState({ dirtyConfig: action.dirtyConfig, config: action.config, changedId: action.changedId, currentPage: action.page });
                return;
            case "Carbon_AppLoaded":
                this.loadInitialConfig();
                return;
        }
    }

    private loadInitialConfig() {
        let page = this.getCurrentSymbolsPage();
        if (!page) {
            let pages = app.pagesWithSymbols();
            if (pages.length) {
                page = pages[0];
                this.saveCurrentSymbolsPage(page);
            }
        }
        if (page) {
            this.loadConfig(page);
        }
    }

    private loadConfig(page) {
        if (page === this.state.currentPage) {
            return;
        }

        if (this.dirtyConfigToken) {
            this.dirtyConfigToken.dispose();
        }
        this.dirtyConfigToken = page.toolboxConfigIsDirty.bind(this, this.onConfigDirty);

        let configPromise: Promise<any>;
        if (!page.props.toolboxConfigId) {
            configPromise = ToolboxConfiguration.buildToolboxConfig(page);
        }
        else {
            configPromise = ToolboxConfiguration.getConfigForPage(page);
        }

        configPromise.then(config => {
            dispatchAction({ type: "Stencils_Loaded", dirtyConfig: false, config: config, changedId: null, page: page, async: true });
        });
    }

    private getCurrentSymbolsPage() {
        let pageId = app.getUserSetting("symbolsPageId", null);
        if (!pageId) {
            return null;
        }

        let pages = app.pagesWithSymbols();
        return pages.find(x => x.id() === pageId);
    }
    private saveCurrentSymbolsPage(page?: IPage) {
        app.setUserSetting("symbolsPageId", page.id());
    }

    private onConfigDirty(forceUpdate, changedId) {
        if (forceUpdate) {
            this.refreshLibrary();
        } else {
            this.setState({ dirtyConfig: true, changedId: changedId });
        }
    }

    private refreshLibrary() {
        ToolboxConfiguration.buildToolboxConfig(this.state.currentPage).then(config => {
            this.setState({ dirtyConfig: false, config: config, changedId: null });
        });
    }
}

export default new SymbolsStore();