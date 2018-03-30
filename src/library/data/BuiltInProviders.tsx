import * as React from "react";
import { StoreComponent, dispatchAction } from "../../CarbonFlux";
import dataStore, { DataStoreState } from "./DataStore";
import Navigatable from "../../shared/Navigatable";
import CatalogView from "./CatalogView";

export default class BuiltInProviders extends StoreComponent<{}, DataStoreState> {
    constructor(props) {
        super(props, dataStore);

    }

    private onCategoryChanged = category => {
        dispatchAction({ "type": "Data_ClickedCategory", category });
    }
    private onScrolledToCategory = category => {
        dispatchAction({ "type": "Data_ScrolledToCategory", category });
    }

    render() {
        if (!this.state.config) {
            return null;
        }
        return <Navigatable config={this.state.config}
            activeCategory={this.state.activeCategory}
            onCategoryChanged={this.onCategoryChanged}>
            <CatalogView
                config={this.state.config} templateType={dataStore.storeType}
                scrollToCategory={this.state.lastScrolledCategory}
                onScrolledToCategory={this.onScrolledToCategory}/>
        </Navigatable>;
    }
}