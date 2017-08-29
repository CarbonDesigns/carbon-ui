
import { SymbolsAction } from "./SymbolsActions";
import { handles, CarbonStore, dispatchAction } from "../../CarbonFlux";
import ToolboxConfiguration from "../ToolboxConfiguration";
import { CarbonAction } from "../../CarbonActions";
import { app, Symbol, IPage } from "carbon-core";
import { ToolboxConfig, SpriteStencil, ToolboxConfigGroup, IToolboxStore, StencilInfo, SpriteStencilInfo } from "../LibraryDefs";
import Toolbox from "../Toolbox";

export type SearchSymbolsStoreState = {
    searchConfig: ToolboxConfig<SpriteStencil>;
    query: string;
    configVersion: number;
    activeCategory: any;
    lastScrolledCategory: any;
}

class SearchSymbolsStore extends CarbonStore<SearchSymbolsStoreState> implements IToolboxStore {
    private loadingConfigs = false;
    private cachedConfigs: ToolboxConfig<SpriteStencil>[] = [];

    storeType = "searchSymbols";

    constructor() {
        super();
        this.state = {
            searchConfig: null,
            query: null,
            configVersion: 0,
            lastScrolledCategory: null,
            activeCategory: null
        };
    }

    findStencil(info: SpriteStencilInfo) {
        for (let i = 0; i < this.cachedConfigs.length; i++) {
            let config = this.cachedConfigs[i];
            let stencil = this.findStencilInConfig(config, info);
            if (stencil) {
                return stencil;
            }
        }
        return null;
    }
    private findStencilInConfig(config: ToolboxConfig<SpriteStencil>, info: SpriteStencilInfo) {
        for (let i = 0; i < config.groups.length; ++i) {
            for (let j = 0; j < config.groups[i].items.length; ++j) {
                let stencil = config.groups[i].items[j];
                if (stencil.id === info.stencilId && stencil.pageId === info.pageId) {
                    return stencil;
                }
            }
        }
        return null;
    }

    createElement(info: SpriteStencilInfo) {
        var element = new Symbol();
        element.source({ pageId: info.pageId, artboardId: info.stencilId });
        return element;
    }

    elementAdded() {}

    onAction(action: SymbolsAction | CarbonAction) {
        switch (action.type) {
            case "Symbols_Loaded":
                this.cachedConfigs.length = 0;
                return;
            case "Symbols_Search":
                this.search(action.q);
                return;
            case "SymbolsSearch_ClickedCategory":
                this.onCategoryClicked(action.category);
                return;
            case "SymbolsSearch_ScrolledToCategory":
                this.onScrolledToCategory(action.category);
                return;
        }
    }

    private ensureConfigsLoaded() {
        if (!this.cachedConfigs.length && !this.loadingConfigs) {
            this.loadingConfigs = true;

            let promises = app.pagesWithSymbols().map(x => ToolboxConfiguration.getConfigForPage(x));
            Promise.all<ToolboxConfig<SpriteStencil>>(promises).then(configs => {
                this.cachedConfigs = configs;

                if (this.cachedConfigs.length && this.state.query) {
                    dispatchAction({ type: "Symbols_Search", q: this.state.query })
                }
            }).finally(() => {
                this.loadingConfigs = false;
            });
        }
    }

    private search(q) {
        this.ensureConfigsLoaded();

        var result = { groups: [], id: "searchConfig", name: "searchConfig", pageId: "searchConfig" };
        var r = new RegExp(q, "gi");
        for (var i = 0; i < this.cachedConfigs.length; i++) {
            var config = this.cachedConfigs[i];
            for (var j = 0; j < config.groups.length; j++) {
                var group = config.groups[j];
                for (var k = 0; k < group.items.length; k++) {
                    var stencil = group.items[k];
                    r.lastIndex = 0;
                    if (r.test(stencil.title)) {
                        var searchGroup = this.findOrCreateGroup(result, config, group, stencil.pageId);
                        searchGroup.items.push(stencil);
                    }
                }
            }
        }

        let activeCategory = result.groups.length ? result.groups[0] : null;
        this.setState({
            searchConfig: result,
            query: q,
            configVersion: ++this.state.configVersion,
            activeCategory,
            lastScrolledCategory: activeCategory
        });
    }

    private findOrCreateGroup(searchConfig: ToolboxConfig<SpriteStencil>, sourceConfig: ToolboxConfig<SpriteStencil>, sourceGroup: ToolboxConfigGroup<SpriteStencil>, pageId: string) {
        let page = app.getImmediateChildById<IPage>(pageId);
        let pageName = page.name();

        for (let i = 0; i < searchConfig.groups.length; i++) {
            let group = searchConfig.groups[i];
            if (group.name === pageName) {
                return group;
            }
        }
        let newGroup = Object.assign({}, sourceGroup, {
            name: pageName,
            items: []
        });
        searchConfig.groups.push(newGroup);
        return newGroup;
    }

    private onCategoryClicked(category) {
        this.setState({ activeCategory: category, lastScrolledCategory: category });
    }
    private onScrolledToCategory(category) {
        this.setState({ activeCategory: category, lastScrolledCategory: null });
    }
}

export default Toolbox.registerStore(new SearchSymbolsStore());