
import { StencilsAction } from "./StencilsActions";
import { handles, CarbonStore, dispatchAction } from "../../CarbonFlux";
import ToolboxConfiguration, { ToolboxConfig, ToolboxConfigGroup } from "../ToolboxConfiguration";
import { CarbonAction } from "../../CarbonActions";
import { app } from "carbon-core";

export type SearchStencilsStoreState = {
    searchConfig: ToolboxConfig;
    query: string;
    configVersion: number;
    activeCategory: any;
    lastScrolledCategory: any;
}

class SearchStencilsStore extends CarbonStore<SearchStencilsStoreState>{
    private loadingConfigs = false;
    private cachedConfigs: ToolboxConfig[] = [];

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

    onAction(action: StencilsAction | CarbonAction) {
        switch (action.type) {
            case "Stencils_Loaded":
                this.cachedConfigs.length = 0;
                return;
            case "Stencils_Search":
                this.search(action.q);
                return;
            case "StencilsSearch_ClickedCategory":
                this.onCategoryClicked(action.category);
                return;
            case "StencilsSearch_ScrolledToCategory":
                this.onScrolledToCategory(action.category);
                return;
        }
    }

    private ensureConfigsLoaded() {
        if (!this.cachedConfigs.length && !this.loadingConfigs) {
            this.loadingConfigs = true;

            let promises = app.pagesWithSymbols().map(x => ToolboxConfiguration.getConfigForPage(x));
            Promise.all<ToolboxConfig>(promises).then(configs => {
                this.cachedConfigs = configs;

                if (this.cachedConfigs.length && this.state.query) {
                    dispatchAction({ type: "Stencils_Search", q: this.state.query })
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
                    var template = group.items[k];
                    r.lastIndex = 0;
                    if (r.test(template.title)) {
                        var searchGroup = this.findOrCreateGroup(result, config, group);
                        searchGroup.items.push(template);
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

    private findOrCreateGroup(searchConfig: ToolboxConfig, sourceConfig: ToolboxConfig, sourceGroup: ToolboxConfigGroup) {
        for (let i = 0; i < searchConfig.groups.length; i++) {
            let group = searchConfig.groups[i];
            if (group.name === sourceConfig.name) {
                return group;
            }
        }
        let newGroup = Object.assign({}, sourceGroup, {
            name: sourceConfig.name,
            items: [],
            pageId: sourceConfig.pageId
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

export default new SearchStencilsStore();