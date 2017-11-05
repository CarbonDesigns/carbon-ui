import { app, Symbol } from "carbon-core";
import { CarbonStore } from "../../CarbonFlux";
import { SymbolsAction } from "./SymbolsActions";
import { ToolboxConfig, SpriteStencil, StencilInfo, SpriteStencilInfo, SymbolStencil } from "../LibraryDefs";
import symbolsStore from "./SymbolsStore";
import searchSymbolsStore from "./SearchSymbolsStore";
import Toolbox from "../Toolbox";
import { StencilsAction } from "../StencilsActions";

export type RecentSymbolsStoreState = {
    recentConfig: ToolboxConfig<SpriteStencil>;
    configVersion: number;
}

class RecentSymbolsStore extends CarbonStore<RecentSymbolsStoreState> {
    storeType = "recentSymbols";

    constructor() {
        super();
        this.state = {
            recentConfig: {
                id: "recent",
                groups: [
                    {
                        name: "@symbols.recent",
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

    createElement(stencil: SymbolStencil) {
        return symbolsStore.createElement(stencil);
    }

    elementAdded() {
    }

    onAction(action: StencilsAction) {
        switch (action.type) {
            case "Stencils_Added":
                if (action.stencilType === symbolsStore.storeType || action.stencilType === searchSymbolsStore.storeType) {
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

export default Toolbox.registerStore(new RecentSymbolsStore());