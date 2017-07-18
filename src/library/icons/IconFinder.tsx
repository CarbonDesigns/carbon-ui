import React from "react";
import ReactDom from "react-dom";
import cx from "classnames";
import IconsList from "./IconsList";
import { Component, handles, dispatch, StoreComponent, dispatchAction } from "../../CarbonFlux";
import Search from "../../shared/Search";
import { domUtil } from "carbon-core";
import IconsActions from './IconsActions';
import iconFinderStore, { IconFinderStoreState, IconFinderStore } from "./IconFinderStore";
import InfiniteGrid from "../../shared/collections/InfiniteGrid";
import { Markup, MarkupLine } from "../../shared/ui/Markup";
import { FormattedMessage } from "react-intl";

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

    componentDidMount() {
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
        var templateType = e.currentTarget.dataset.templateType;
        var templateId = e.currentTarget.dataset.templateId;
        dispatchAction({ type: "Stencils_Clicked", e, templateType, templateId });
    }

    private renderError() {
        if (this.state.error) {
            return <Markup>
                <MarkupLine>
                    <FormattedMessage tagName="p" id="@iconfinder.error" />
                </MarkupLine>
            </Markup>;
        }
        return null;
    }

    private renderList() {
        return <InfiniteGrid className="list"
            cellHeight={IconSize}
            cellWidth={IconSize}
            cellRenderer={this.renderItem}
            noContentRenderer={this.renderNoContent}
            loadMore={this.onLoadMore}
            ref="grid" />
    }

    private renderItem = i => {
        var iconStyle = {
            backgroundImage: "url(" + i.url + ")"
        };
        return <div className="stencil stencil_icon"
            title={i.name}
            key={i.name}
            data-template-type={IconFinderStore.StoreType}
            data-template-id={i.id}
            onClick={this.onClicked}>
            <i className="stencil_icon__holder" style={iconStyle} />
            {this.renderPrice(i)}
        </div>;
    }

    private renderPrice(i) {
        if (i.premium) {
            return <a className="price ext-link"><span>$</span></a>;
        }
        return null;
    }

    private renderNoContent = () => {
        return <Markup>
            <MarkupLine>
                <FormattedMessage tagName="p" id="@empty" />
            </MarkupLine>
        </Markup>;
    }

    render() {
        return <div ref="page">
            <div className="library-page__content">
                <div className="filter">
                    <Search query={this.state.term} onQuery={this.onSearch} placeholder="@icons.find" ref="search" className="search-container" />
                </div>
                <section className="fill" ref="container">
                    {this.renderError()}
                    {this.renderList()}
                </section>
            </div>
        </div>;
    }
}
