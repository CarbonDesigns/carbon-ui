import { app, IApp } from "carbon-core";
import CarbonActions, { CarbonAction } from '../../CarbonActions';
import { handles, CarbonStore } from "../../CarbonFlux";
import Toolbox from "../Toolbox";
import { IToolboxStore, StencilInfo, Stencil, ToolboxConfig, DataStencil, ToolboxGroup } from "../LibraryDefs";
import { DataAction } from "./DataActions";
import dataStore from "./DataStore"
import customCatalogStore from "./CustomCatalogStore"

export interface DataSearchStoreState {
    config: ToolboxConfig<DataStencil>;
    query: string;
}

class DataSearchStore extends CarbonStore<DataSearchStoreState> implements IToolboxStore {
    storeType = "dataSearch";

    findStencil(info: StencilInfo) {
        let stencil = dataStore.findStencil(info)
        if (stencil) {
            return stencil;
        }
        stencil = customCatalogStore.findStencil(info)
        if (stencil) {
            return stencil;
        }
        return null;
    }
    createElement(stencil: Stencil, info: StencilInfo) {
        let found = dataStore.findStencil(info);
        if (found) {
            return dataStore.createElement(stencil);
        }
        found = customCatalogStore.findStencil(info);
        if (found) {
            return customCatalogStore.createElement(stencil);
        }
        return null;
    }

    elementAdded() {
        app.dataManager.generateForSelection();
    }

    onAction(action: DataAction) {
        switch (action.type) {
            case "Data_Search":
                this.search(action.q);
                return;
        }
    }

    private search(q) {
        let group: ToolboxGroup<DataStencil> = {
            name: "Search results",
            items: []
        };
        let r = new RegExp(q, "gi");

        if (customCatalogStore.state.config) {
            this.searchInConfig(r, customCatalogStore.state.config, group.items);
        }
        this.searchInConfig(r, dataStore.state.config, group.items);

        this.setState({
            config: { groups: [group], id: "searchConfig" },
            query: q
        });
    }

    private searchInConfig(r: RegExp, config: ToolboxConfig<DataStencil>, result: DataStencil[]) {
        for (var j = 0; j < config.groups.length; j++) {
            var group = config.groups[j];
            for (var k = 0; k < group.items.length; k++) {
                var stencil = group.items[k];
                r.lastIndex = 0;
                if (r.test(stencil.title)) {
                    result.push(stencil);
                }
            }
        }
    }
}
export default Toolbox.registerStore(new DataSearchStore());