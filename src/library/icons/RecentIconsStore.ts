import { app, Symbol } from "carbon-core";
import { CarbonStore } from "../../CarbonFlux";
import { ToolboxConfig, SpriteStencil, StencilInfo, SpriteStencilInfo } from "../LibraryDefs";
import internalIconsStore from "./InternalIconsStore";
import searchIconsStore from "./SearchIconsStore";
import Toolbox from "../Toolbox";
import { StencilsAction } from "../StencilsActions";

export type RecentIconsStoreState = {
    recentConfig: ToolboxConfig<SpriteStencil>;
    configVersion: number;
}

class RecentIconsStore extends CarbonStore<RecentIconsStoreState> {
    storeType = "recentIcons";

    constructor() {
        super();
        this.state = {
            recentConfig: {
                id: "recent",
                groups: [
                    {
                        name: "@icons.recent",
                        items: []
                    }
                ]
            },
            configVersion: 0
        };
    }

    findStencil(info: SpriteStencilInfo) {
        return this.state.recentConfig.groups[0].items.find(x => x.id === info.stencilId && x.pageId === info.pageId);
    }

    createElement(stencil: SpriteStencil) {
        return internalIconsStore.createElement(stencil);
    }

    elementAdded() {
    }

    onAction(action: StencilsAction) {
        switch (action.type) {
            case "Stencils_Added":
                if (action.stencilType === internalIconsStore.storeType || action.stencilType === searchIconsStore.storeType) {
                    let items = this.state.recentConfig.groups[0].items;
                    let spriteStencil = action.stencil as SpriteStencil;
                    let index = items.findIndex(x => x.id === spriteStencil.id && x.pageId === spriteStencil.pageId);

                    if (index !== -1) {
                        items.splice(index, 1);
                    }
                    items.push(spriteStencil);

                    this.setState({
                        configVersion: ++this.state.configVersion
                    });
                }
                return;
        }
    }
}

export default Toolbox.registerStore(new RecentIconsStore());