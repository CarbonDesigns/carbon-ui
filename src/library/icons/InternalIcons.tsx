import React from "react";
import SpriteView from "../stencils/SpriteView";
import Dropdown from "../../shared/Dropdown";
import Navigatable from "../../shared/Navigatable";
import { Component, listenTo, Dispatcher, StoreComponent, dispatchAction } from "../../CarbonFlux";
import { richApp } from "../../RichApp";
import AppActions from '../../RichAppActions';
import IconsActions from "./IconsActions";
import { FormattedMessage } from "react-intl";
// import StencilsActions from "./StencilsActions";
import { app, NullPage, IPage } from "carbon-core";
import InternalIconsStore, { InternalIconsStoreState } from "./InternalIconsStore";
import { GuiButton } from "../../shared/ui/GuiComponents";
import bem from '../../utils/commonUtils';

export default class InternalIcons extends StoreComponent<any, InternalIconsStoreState> {
    refs: {
        spriteView: SpriteView;
    };

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

    _renderRefresher() {
        return null;
        // var visible = this.state.dirtyConfig;
        // var cn = bem("stencils-refresher", null, { hidden: !visible });
        // return <div className={cn} onClick={visible ? this._refreshLibrary : null}>
        //     <GuiButton onClick={visible ? this._refreshLibrary : null}
        //         mods={['small', 'hover-white']}
        //         icon="refresh"
        //         caption="refresh.toolbox"
        //         defaultMessage="Refresh" />
        // </div>
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

            {this._renderRefresher()}

            <SpriteView config={config}
                changedId={this.state.changedId}
                scrollToCategory={this.state.lastScrolledCategory}
                onScrolledToCategory={this.onScrolledToCategory}
                columnWidth={40}
                ref="spriteView" />
        </Navigatable>;
    }
}
