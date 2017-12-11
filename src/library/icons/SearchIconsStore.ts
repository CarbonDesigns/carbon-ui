
import { handles, CarbonStore, dispatchAction } from "../../CarbonFlux";
import ToolboxConfiguration from "../ToolboxConfiguration";
import { CarbonAction } from "../../CarbonActions";
import { app, Symbol, IPage, ArtboardType, IArtboard, Artboard } from "carbon-core";
import { ToolboxConfig, SpriteStencil, ToolboxGroup, IToolboxStore, StencilInfo, SpriteStencilInfo } from "../LibraryDefs";
import Toolbox from "../Toolbox";
import internalIconsStore from "./InternalIconsStore";
import { IconsAction } from "./IconsActions";

export type SearchIconsStoreState = {
    searchConfig: ToolboxConfig<SpriteStencil>;
    query: string;
    configVersion: number;
    activeCategory: any;
    lastScrolledCategory: any;
}

class SearchIconsStore extends CarbonStore<SearchIconsStoreState> implements IToolboxStore {
    storeType = "searchIcons";

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
        return internalIconsStore.findStencil(info);
    }

    createElement(stencil: SpriteStencil) {
        return internalIconsStore.createElement(stencil);
    }

    elementAdded() { }

    onAction(action: IconsAction) {
        switch (action.type) {
            case "Icons_Search":
                this.search(action.q);
                return;
            case "IconsSearch_ClickedCategory":
                this.onCategoryClicked(action.category);
                return;
            case "IconsSearch_ScrolledToCategory":
                this.onScrolledToCategory(action.category);
                return;
        }
    }

    private search(q) {
        let result = { groups: [], id: "searchConfig" };

        let r = new RegExp(q, "gi");
        let config = internalIconsStore.getConfig();
        if (config) {
            for (var j = 0; j < config.groups.length; j++) {
                var group = config.groups[j];
                for (var k = 0; k < group.items.length; k++) {
                    var stencil = group.items[k];
                    r.lastIndex = 0;
                    if (r.test(stencil.title)) {
                        var searchGroup = this.findOrCreateGroup(result, config, group, stencil.pageId, stencil.id);
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

    private findOrCreateGroup(searchConfig: ToolboxConfig<SpriteStencil>, sourceConfig: ToolboxConfig<SpriteStencil>, sourceGroup: ToolboxGroup<SpriteStencil>, pageId: string, elementId: string) {
        let page = app.getImmediateChildById<IPage>(pageId);
        let element = page.findNodeByIdBreadthFirst(elementId);
        let artboard = element.findAncestorOfType<IArtboard>(Artboard);
        let artboardName = artboard.name;

        for (let i = 0; i < searchConfig.groups.length; i++) {
            let group = searchConfig.groups[i];
            if (group.name === artboardName) {
                return group;
            }
        }
        let newGroup = Object.assign({}, sourceGroup, {
            name: artboardName,
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

export default Toolbox.registerStore(new SearchIconsStore());