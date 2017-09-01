import React from "react";
import ReactDom from "react-dom";
import { StoreComponent, dispatchAction } from "../../CarbonFlux";
import dataSearchStore, { DataSearchStoreState } from "./DataSearchStore";
import CatalogView from "./CatalogView";
import Search from "../../shared/Search";
import { domUtil } from "carbon-core";
import LessVars from "../../styles/LessVars";

export default class DataSearch extends StoreComponent<{}, DataSearchStoreState> {
    refs: {
        page: HTMLElement;
        search: Search;
    }

    constructor(props) {
        super(props, dataSearchStore);
    }

    componentDidMount() {
        super.componentDidMount();

        var page = ReactDom.findDOMNode(this.refs.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        domUtil.onCssTransitionEnd(page, () => this.refs.search.focus(), LessVars.tabTransitionTime);
    }

    private onSearch = (q) => {
        dispatchAction({ type: "Data_Search", q });
    }

    render() {
        return <div ref="page">
            <div className="library-page__header">
                <Search query={this.state.query} onQuery={this.onSearch} placeholder="@data.find" ref="search" />
            </div>

            {this.renderView()}
        </div>;
    }

    private renderView() {
        if (!this.state.config) {
            return null;
        }
        return <CatalogView
            config={this.state.config}
            templateType={dataSearchStore.storeType} />;
    }
}