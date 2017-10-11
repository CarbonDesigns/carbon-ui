import React from "react";
import ReactDom from "react-dom";
import { Component, listenTo, dispatchAction, StoreComponent } from "../../CarbonFlux";
import Search from "../../shared/Search";
import ScrollContainer from "../../shared/ScrollContainer";
import SpriteView from "../SpriteView";
import searchIconsStore, { SearchIconsStoreState } from "./SearchIconsStore";
import Navigatable from "../../shared/Navigatable";
import bem from "../../utils/commonUtils";
import { IconsOverscanCount, IconSize } from "../LibraryDefs";
import LessVars from "../../styles/LessVars";
import { Markup, MarkupLine } from "../../shared/ui/Markup";
import { FormattedMessage } from "react-intl";
import { GuiButton } from "../../shared/ui/GuiComponents";
import { onCssTransitionEnd } from "../../utils/domUtil";

export default class SearchIcons extends StoreComponent<{}, SearchIconsStoreState>{
    refs: {
        page: HTMLElement;
        search: Search;
    }

    constructor(props) {
        super(props, searchIconsStore);
    }

    componentDidMount() {
        super.componentDidMount();

        var page = ReactDom.findDOMNode(this.refs.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        onCssTransitionEnd(page, () => this.refs.search.focus(), LessVars.tabTransitionTime);
    }

    private onSearch = (q) => {
        dispatchAction({ type: "Icons_Search", q });
    }

    private onGallerySearch = () => {
        dispatchAction({ type: "Dialog_Show", dialogType: "ImportResourceDialog", args: { tags: "icons", query: this.state.query } });
    }

    private onIconFinderSearch = () => {
        dispatchAction({ type: "Library_Tab", area: "icons", tabId: "3"});
        dispatchAction({ type: "Icons_WebSearch", q: this.state.query });
    }

    private onCategoryChanged = category => {
        dispatchAction({ "type": "IconsSearch_ClickedCategory", category });
    }
    private onScrolledToCategory = category => {
        dispatchAction({ "type": "IconsSearch_ScrolledToCategory", category });
    }

    render() {
        let noResults = this.state.searchConfig && !this.state.searchConfig.groups.length && this.state.query;

        return <div ref="page">
            <div className="library-page__header">
                <Search query={this.state.query} onQuery={this.onSearch} placeholder="@icons.find" ref="search" />
            </div>

            {noResults ? this.renderNoResults() : this.renderResults()}
        </div>;
    }

    private renderNoResults() {
        return <Markup>
            <MarkupLine mods="center">
                <FormattedMessage tagName="p" id="@icons.noneFoundSearch" />
            </MarkupLine>
            <MarkupLine mods={["center", "slim"]}>
                <GuiButton caption="@icons.searchOnline" mods="hover-white" onClick={this.onGallerySearch} />
            </MarkupLine>
            <MarkupLine mods="center">
                <FormattedMessage tagName="p" id="@icons.searchIconFinderMsg" />
            </MarkupLine>
            <MarkupLine mods={["center", "slim"]}>
                <GuiButton caption="@icons.searchIconFinder" mods="hover-white" onClick={this.onIconFinderSearch} />
            </MarkupLine>
        </Markup>;
    }

    private renderResults() {
        return <Navigatable className={bem("library-page", "content")}
            activeCategory={this.state.activeCategory}
            onCategoryChanged={this.onCategoryChanged}
            config={this.state.searchConfig}>

            <SpriteView config={this.state.searchConfig} configVersion={this.state.configVersion}
                scrollToCategory={this.state.lastScrolledCategory}
                onScrolledToCategory={this.onScrolledToCategory}
                overscanCount={IconsOverscanCount}
                columnWidth={IconSize}
                keepAspectRatio={true}
                templateType={searchIconsStore.storeType}/>
        </Navigatable>;
    }
}
