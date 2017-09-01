import React from "react";
import { Component, StoreComponent } from "../../CarbonFlux";
import SpriteView from "../SpriteView";
import { richApp } from "../../RichApp";
import recentSymbolsStore, { RecentSymbolsStoreState } from "./RecentSymbolsStore";
import { SymbolsOverscanCount, SymbolsColumnWidth } from "../LibraryDefs";

export default class RecentSymbols extends StoreComponent<{}, RecentSymbolsStoreState>{
    constructor(props) {
        super(props, recentSymbolsStore);
    }

    render() {
        return <div>
            <div className="library-page__content">
                <SpriteView
                    config={this.state.recentConfig}
                    configVersion={this.state.configVersion}
                    overscanCount={SymbolsOverscanCount}
                    columnWidth={SymbolsColumnWidth}
                    borders={true}
                    reverse={true}
                    templateType={recentSymbolsStore.storeType} />
            </div>
        </div>;
    }
}