import React from "react";
import ReactDom from "react-dom";
import { Component, listenTo, dispatchAction, StoreComponent } from "../../CarbonFlux";
import Search from "../../shared/Search";
import ScrollContainer from "../../shared/ScrollContainer";
import SpriteView from "../SpriteView";
import { domUtil } from "carbon-core";
import searchSymbolsStore, { SearchSymbolsStoreState } from "./SearchSymbolsStore";
import symbolsStore from "./SymbolsStore";
import Navigatable from "../../shared/Navigatable";
import bem from "../../utils/commonUtils";
import { SymbolsOverscanCount, SymbolsColumnWidth } from "../LibraryDefs";
import LessVars from "../../styles/LessVars";
import { Markup, MarkupLine } from "../../shared/ui/Markup";
import { FormattedMessage } from "react-intl";
import { GuiButton } from "../../shared/ui/GuiComponents";

export default class SearchSymbols extends StoreComponent<{}, SearchSymbolsStoreState>{
    refs: {
        page: HTMLElement;
        search: Search;
    }

    constructor(props) {
        super(props, searchSymbolsStore);
    }

    componentDidMount() {
        super.componentDidMount();

        var page = ReactDom.findDOMNode(this.refs.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        domUtil.onCssTransitionEnd(page, () => this.refs.search.focus(), LessVars.tabTransitionTime);
    }

    private onSearch = (q) => {
        dispatchAction({ type: "Symbols_Search", q });
    }

    private onAddMore = () => {
        dispatchAction({ type: "Dialog_Show", dialogType: "ImportResourceDialog", args: { tags: "symbols", query: this.state.query } });
    }

    private onCategoryChanged = category => {
        dispatchAction({ "type": "SymbolsSearch_ClickedCategory", category });
    }
    private onScrolledToCategory = category => {
        dispatchAction({ "type": "SymbolsSearch_ScrolledToCategory", category });
    }

    render() {
        let noResults = this.state.searchConfig && !this.state.searchConfig.groups.length && this.state.query;

        return <div ref="page">
            <div className="library-page__header">
                <Search query={this.state.query} onQuery={this.onSearch} placeholder="@symbols.find" ref="search" />
            </div>

            {noResults ? this.renderNoResults() : this.renderResults()}
        </div>;
    }

    private renderNoResults() {
        return <Markup>
            <MarkupLine mods="center">
                <FormattedMessage tagName="p" id="@symbols.noneFoundSearch" />
            </MarkupLine>
            <MarkupLine mods="center">
                <GuiButton caption="@symbols.searchOnline" mods="hover-white" onClick={this.onAddMore} />
            </MarkupLine>
        </Markup>;
    }

    private renderResults() {
        return <Navigatable className={bem("library-page", "content")}
            activeCategory={this.state.activeCategory}
            onCategoryChanged={this.onCategoryChanged}
            config={this.state.searchConfig}>

            <SpriteView
                config={this.state.searchConfig}
                configVersion={this.state.configVersion}
                scrollToCategory={this.state.lastScrolledCategory}
                onScrolledToCategory={this.onScrolledToCategory}
                overscanCount={SymbolsOverscanCount}
                columnWidth={SymbolsColumnWidth}
                borders={true}
                templateType={searchSymbolsStore.storeType} />
        </Navigatable>;
    }
}
