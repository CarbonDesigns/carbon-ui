import React from "react";
import ReactDom from "react-dom";
import cx from "classnames";
import IconsList from "./IconsList";
import { Component, handles, dispatch, StoreComponent, dispatchAction } from "../../CarbonFlux";
import Search from "../../shared/Search";
import {domUtil} from "carbon-core";
import IconsActions from './IconsActions';
import iconFinderStore, { IconFinderStoreState } from "./IconFinderStore";
import InfiniteGrid from "../../shared/InfiniteGrid";

const IconSize = 40;

export default class IconFinder extends StoreComponent<{}, IconFinderStoreState> {
    refs: {
        search: Search;
        page: HTMLElement;
        grid: InfiniteGrid<any>;
    }

    constructor(props) {
        super(props, iconFinderStore);
    }

    componentDidMount(){
        super.componentDidMount();
        var page = ReactDom.findDOMNode(this.refs.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        domUtil.onCssTransitionEnd(page, () => this.refs.search.focus(), 800);
    }

    private onLoadMore = (start, stop) => {
        return iconFinderStore.runQuery(start, stop);
    }

    private onSearch = term => {
        dispatch(IconsActions.webSearch(term));
        this.refs.grid.reset();
    }

    private onClicked = (e) => {
        var templateId = e.currentTarget.dataset.templateId;
        dispatchAction({ type: "Stencils_Clicked", e, templateType: "icon", templateId });
    }

    private renderItem = i => {
        var iconStyle = {
            backgroundImage: "url(" + i.url + ")"
        };
        return <div className="stencil stencil_icon"
            title={i.name}
            key={i.name}
            data-template-id={i.name}
            onClick={this.onClicked}>
            <i className="stencil_icon__holder" style={iconStyle}/>
            {this.renderPrice(i)}
        </div>;
    }

    private renderPrice(i) {
        if (i.premium) {
            return <a className="price ext-link"><span>$</span></a>;
        }
        return null;
    }

    render(){
        return <div ref="page">
            <div className="library-page__content">
                <div className="filter">
                    <Search query={this.state.term} onQuery={this.onSearch} placeholder="@icons.find" ref="search" className="search-container"/>
                </div>
                <section className="stencils-group" ref="container">
                    {this._renderList()}
                </section>
            </div>
        </div>;
    }

    _renderList(){
        if (this.state.message){
            return <span className={cx("message", {error: this.state.error})}>{this.state.message}</span>
        }

        return <InfiniteGrid className="list"
            cellHeight={IconSize}
            cellWidth={IconSize}
            cellRenderer={this.renderItem}
            loadMore={this.onLoadMore}
            ref="grid"/>
    }
}
