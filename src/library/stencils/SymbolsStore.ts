import { CarbonStore, dispatchAction } from "../../CarbonFlux";
import { IPage, app, IDisposable, ArtboardType, Symbol } from "carbon-core";
import { CarbonAction } from "../../CarbonActions";
import { StencilsAction } from "./StencilsActions";
import ToolboxConfiguration from "../ToolboxConfiguration";
import Toolbox from "../Toolbox";
import { IToolboxStore, StencilInfo } from "../LibraryDefs";

export type SymbolsStoreState = {
    dirtyConfig: boolean;
    changedId: string;
    config: any;
    configVersion: number;
    currentPage: IPage;
    activeCategory: any;
    lastScrolledCategory: any;
};

class SymbolsStore extends CarbonStore<SymbolsStoreState> implements IToolboxStore {
    storeType = "Symbols";

    constructor() {
        super();
        this.state = {
            currentPage: null,
            config: null,
            configVersion: 0,
            changedId: null,
            dirtyConfig: false,
            activeCategory: null,
            lastScrolledCategory: null
        };
    }

    createElement(data: StencilInfo) {
        var element = new Symbol();
        element.source({pageId: data.sourceId, artboardId: data.templateId});
        return element;
    }
    elementAdded(){
    }

    onAction(action: StencilsAction | CarbonAction) {
        switch (action.type) {
            case "Stencils_Refresh":
                this.refreshLibrary();
                return;
            case "Stencils_ChangePage":
                this.loadConfig(action.page);
                return;
            case "Stencils_Loaded":
                if (action.page === this.state.currentPage) {
                    let activeCategory = null;
                    if (action.config && action.config.groups.length) {
                        activeCategory = action.config.groups[0];
                    }

                    this.setState({ config: action.config, dirtyConfig: false, changedId: null, activeCategory, configVersion: ++this.state.configVersion });
                }
                return;
            case "Carbon_ResourceAdded":
                if (action.resourceType === ArtboardType.Symbol) {
                    if (this.state.currentPage !== action.resource.parent()) {
                        this.loadConfig(action.resource.parent());
                    }
                    else if (action.resource.parent() === this.state.currentPage) {
                        this.setState({ dirtyConfig: true });
                        action.resource.parent().setProps({ toolboxConfigId: null });
                    }
                }
                return;
            case "Carbon_ResourceChanged":
                if (action.resourceType === ArtboardType.Symbol && action.resource.parent() === this.state.currentPage) {
                    this.setState({ dirtyConfig: true, changedId: action.resource.id() });
                    action.resource.parent().setProps({ toolboxConfigId: null });
                }
                return;
            case "Carbon_ResourceDeleted":
                if (action.resourceType === ArtboardType.Symbol && action.parent === this.state.currentPage) {
                    this.setState({ dirtyConfig: true, changedId: action.resource.id() });
                    action.parent.setProps({ toolboxConfigId: null });
                }
                return;
            case "Carbon_AppUpdated":
                this.loadInitialConfig();
                return;

            case "Stencils_ClickedCategory":
                this.onCategoryClicked(action.category);
                return;
            case "Stencils_ScrolledToCategory":
                this.onScrolledToCategory(action.category);
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
        else {
            this.setState({ currentPage: null, config: null });
        }
    }

    private loadConfig(page) {
        if (page === this.state.currentPage) {
            return;
        }

        let configPromise: Promise<any>;
        if (!page.props.toolboxConfigId) {
            configPromise = ToolboxConfiguration.buildToolboxConfig(page);
        }
        else {
            configPromise = ToolboxConfiguration.getConfigForPage(page);
        }

        this.setState({ currentPage: page });

        configPromise.then(config => {
            dispatchAction({ type: "Stencils_Loaded", config: config, page: page, async: true });
        });
    }

    private getCurrentSymbolsPage() {
        let pageId = app.getUserSetting("symbolsPageId");
        if (!pageId) {
            return null;
        }

        let pages = app.pagesWithSymbols();
        return pages.find(x => x.id() === pageId);
    }
    private saveCurrentSymbolsPage(page?: IPage) {
        app.setUserSetting("symbolsPageId", page.id());
    }

    private refreshLibrary() {
        ToolboxConfiguration.buildToolboxConfig(this.state.currentPage)
            .then(config => {
                dispatchAction({ type: "Stencils_Loaded", config: config, page: this.state.currentPage, async: true });
            });
    }

    private onCategoryClicked(category) {
        this.setState({ activeCategory: category, lastScrolledCategory: category });
    }
    private onScrolledToCategory(category) {
        this.setState({ activeCategory: category });
    }
}

export default Toolbox.registerStore(new SymbolsStore());