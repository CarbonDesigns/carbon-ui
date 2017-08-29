import React from "react";
import SpriteView from "../symbols/SpriteView";
import Dropdown from "../../shared/Dropdown";
import Navigatable from "../../shared/Navigatable";
import { Component, listenTo, Dispatcher, StoreComponent, dispatchAction } from "../../CarbonFlux";
import { richApp } from "../../RichApp";
import AppActions from '../../RichAppActions';
import IconsActions from "./IconsActions";
import { FormattedMessage } from "react-intl";
import { app, NullPage, IPage } from "carbon-core";
import InternalIconsStore, { InternalIconsStoreState } from "./InternalIconsStore";
import { GuiButton } from "../../shared/ui/GuiComponents";
import bem from '../../utils/commonUtils';
import Refresher from "../Refresher";

const OverscanCount = 20;
const IconSize = 40;

export default class InternalIcons extends StoreComponent<any, InternalIconsStoreState> {
    constructor(props) {
        super(props, InternalIconsStore);
    }

    private onRefreshLibrary = () => {
        dispatchAction({ type: "Icons_Refresh" });
    }

    private onAddMore = () => {
        dispatchAction({ type: "Dialog_Show", dialogType: "ImportResourceDialog" });
    }

    private onCategoryChanged = category => {
        dispatchAction({ "type": "Icons_ClickedCategory", category });
    }
    private onScrolledToCategory = category => {
        dispatchAction({ "type": "Icons_ScrolledToCategory", category });
    }

    render() {
        var config = this.state.config;
        if (!config) {
            return null;
        }

        return <Navigatable className={bem("library-page", "content")}
            activeCategory={this.state.activeCategory}
            onCategoryChanged={this.onCategoryChanged}
            config={config}>

            <Refresher visible={this.state.dirtyConfig} onClick={this.onRefreshLibrary}/>

            <SpriteView config={config} configVersion={this.state.configVersion}
                changedId={this.state.changedId}
                scrollToCategory={this.state.lastScrolledCategory}
                onScrolledToCategory={this.onScrolledToCategory}
                overscanCount={OverscanCount}
                columnWidth={IconSize}
                keepAspectRatio={true}
                templateType={InternalIconsStore.storeType}/>
        </Navigatable>;
    }
}
