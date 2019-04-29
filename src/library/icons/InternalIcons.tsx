import * as React from "react";
import SpriteView from "../SpriteView";
import Navigatable from "../../shared/Navigatable";
import { Component, listenTo, Dispatcher, StoreComponent, dispatchAction } from "../../CarbonFlux";
import { richApp } from "../../RichApp";
import AppActions from '../../RichAppActions';
import IconsActions from "./IconsActions";
import { FormattedMessage } from "react-intl";
import InternalIconsStore, { InternalIconsStoreState } from "./InternalIconsStore";
import Refresher from "../Refresher";
import { IconsOverscanCount, IconSize } from "../LibraryDefs";
import { Markup, MarkupLine } from "../../shared/ui/Markup";
import styled from "styled-components";
import theme from "../../theme";
import MainButton from "../../components/MainButton";

const ImportButton = styled(MainButton)<any>`
    padding: 10px 20px;
    height: 36px;
`;

const EmptyMessage = styled(MarkupLine).attrs({ center: true })`
    font:${theme.text_normal};
    color:${theme.text_color};
`;

export default class InternalIcons extends StoreComponent<any, InternalIconsStoreState> {
    constructor(props) {
        super(props, InternalIconsStore);
    }

    private onRefreshLibrary = () => {
        dispatchAction({ type: "Icons_Refresh" });
    }

    private onAddMore = () => {
        dispatchAction({ type: "Dialog_Show", dialogType: "ImportResourceDialog", args: { tags: "icons" } });
    }

    private onCategoryChanged = category => {
        dispatchAction({ "type": "Icons_ClickedCategory", category });
    }
    private onScrolledToCategory = category => {
        dispatchAction({ "type": "Icons_ScrolledToCategory", category });
    }

    render() {
        var config = this.state.config;
        if (!config || !config.groups.length) {
            if (this.state.dirtyConfig) {
                return <Refresher visible={this.state.dirtyConfig} onClick={this.onRefreshLibrary} loading={!!this.state.operation}/>;
            }

            return <Markup>
                <EmptyMessage center>
                    <FormattedMessage tagName="p" id="@icons.noneFound"/>
                </EmptyMessage>
                <MarkupLine center>
                    <ImportButton label="@icons.import" onClick={this.onAddMore} />
                </MarkupLine>
            </Markup>;
        }

        return <InternalIconsContainer>
            <NavigatableContent className="_navigatable"
                activeCategory={this.state.activeCategory}
                onCategoryChanged={this.onCategoryChanged}
                config={config}>

                <Refresher visible={this.state.dirtyConfig} onClick={this.onRefreshLibrary} loading={!!this.state.operation}/>

                <SpriteView config={config} configVersion={this.state.configVersion}
                    changedId={this.state.changedId}
                    scrollToCategory={this.state.lastScrolledCategory}
                    onScrolledToCategory={this.onScrolledToCategory}
                    overscanCount={IconsOverscanCount}
                    columnWidth={IconSize}
                    keepAspectRatio={true}
                    templateType={InternalIconsStore.storeType}/>
            </NavigatableContent>
        </InternalIconsContainer>;
    }
}

const NavigatableContent = styled(Navigatable)<any>`
    width: 100%;
    padding: 0 0;
    bottom: 0;
    top:0;
    display: flex;
    flex-direction: column;
    overflow:hidden;
`;

const InternalIconsContainer = styled.div`
    font:${theme.default_font};
    color:${theme.text_color};
    position:absolute;
    display:flex;
    top:0;
    bottom:0;
    left:0;
    right:0;
    width:100%;
    height:100%;

    i {
        display:inline-block;
    }
`;