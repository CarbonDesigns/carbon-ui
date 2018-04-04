import * as React from "react";
import * as cx from "classnames";
import * as ReactDom from "react-dom";
import { Component, listenTo, dispatch, handles, StoreComponent, dispatchAction } from "../../CarbonFlux";
import Search from "../../shared/Search";
import ImagesActions from './ImagesActions';
import LayoutActions from '../../layout/LayoutActions';
import unsplashStore, { UnsplashStoreState, UnsplashStore, UnsplashStencil } from "./UnsplashStore";
import InfiniteList from "../../shared/collections/InfiniteList";
import { ImagePortraitHeight, ImageLandscapeHeight } from "../LibraryDefs";
import { MarkupLine, Markup } from "../../shared/ui/Markup";
import { FormattedMessage } from "react-intl";
import { getUnsplashImageHeight, UnsplashImage } from "./UnsplashImage";
import { onCssTransitionEnd } from "../../utils/domUtil";

type UnsplashList = new (props) => InfiniteList<UnsplashStencil>;
const UnsplashList = InfiniteList as UnsplashList;

export default class Unsplash extends StoreComponent<{}, UnsplashStoreState>{
    refs: {
        page: HTMLElement;
        search: Search;
        list: InfiniteList<any>;
    }

    constructor(props) {
        super(props, unsplashStore);
    }

    componentDidMount() {
        super.componentDidMount();
        var page = ReactDom.findDOMNode(this.refs.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        onCssTransitionEnd(page, () => this.refs.search.focus(), 800);
    }

    private onLoadMore = (start, stop) => {
        return unsplashStore.runQuery(start, stop);
    }

    private onSearch = term => {
        dispatchAction({ type: "Images_UnsplashSearch", q: term });
        this.refs.list.reset();
    }

    private onClicked = (e) => {
        dispatchAction({ type: "Stencils_Clicked", e: {ctrlKey: e.ctrlKey, metaKey: e.metaKey, currentTarget: e.currentTarget}, stencil: { ...e.currentTarget.dataset } });
    }

    private renderError() {
        if (this.state.error) {
            return <Markup>
                <MarkupLine>
                    <FormattedMessage tagName="p" id="@unsplash.error" />
                </MarkupLine>
            </Markup>;
        }
        return null;
    }

    private renderList() {
        return <UnsplashList className="list" ref="list"
            rowHeight={getUnsplashImageHeight}
            estimatedRowHeight={ImageLandscapeHeight}
            rowRenderer={this.renderItem}
            noContentRenderer={this.renderNoContent}
            loadMore={this.onLoadMore} />;
    }

    private renderNoContent = () => {
        return <Markup>
            <MarkupLine>
                <FormattedMessage tagName="p" id="@empty" />
            </MarkupLine>
        </Markup>;
    }

    private renderItem = (stencil: UnsplashStencil) => {
        return <UnsplashImage stencilType={unsplashStore.storeType} stencil={stencil} onClicked={this.onClicked}/>
    };

    render() {
        return <div ref="page" className="unsplash">
            <div className="library-page__content">
                <div className="filter">
                    <Search query={this.state.term} onQuery={this.onSearch} placeholder="@images.find" ref="search" className="search-container" />
                </div>
                <section className="fill">
                    {this.renderError()}
                    {this.renderList()}
                </section>
            </div>
        </div>;
    }
}
