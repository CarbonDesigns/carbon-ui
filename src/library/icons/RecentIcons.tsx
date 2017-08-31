import React from "react";
import { Component, StoreComponent } from "../../CarbonFlux";
import SpriteView from "../SpriteView";
import { richApp } from "../../RichApp";
import recentIconsStore, { RecentIconsStoreState } from "./RecentIconsStore";
import { SymbolsOverscanCount, SymbolsColumnWidth, IconsOverscanCount, IconSize } from "../LibraryDefs";

export default class RecentIcons extends StoreComponent<{}, RecentIconsStoreState>{
    constructor(props) {
        super(props, recentIconsStore);
    }

    render() {
        return <div>
            <div className="library-page__content">
                <SpriteView config={this.state.recentConfig} configVersion={this.state.configVersion}
                    overscanCount={IconsOverscanCount}
                    columnWidth={IconSize}
                    keepAspectRatio={true}
                    templateType={recentIconsStore.storeType} />
            </div>
        </div>;
    }
}