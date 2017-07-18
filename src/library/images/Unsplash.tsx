import React from "react";
import cx from "classnames";
import ReactDom from "react-dom";
import { Component, listenTo, dispatch, handles, StoreComponent, dispatchAction } from "../../CarbonFlux";
import Search from "../../shared/Search";
import { domUtil } from "carbon-core";
import ImagesActions from './ImagesActions';
import LayoutActions from '../../layout/LayoutActions';
import unsplashStore, { UnsplashStoreState, UnsplashStore, IUnsplashStencil } from "./UnsplashStore";
import InfiniteList from "../../shared/collections/InfiniteList";
import { PortraitHeight, LandscapeHeight } from "./ImageDefs";
import { MarkupLine, Markup } from "../../shared/ui/Markup";
import { FormattedMessage } from "react-intl";

type UnsplashList = new (props) => InfiniteList<IUnsplashStencil>;
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
        domUtil.onCssTransitionEnd(page, () => this.refs.search.focus(), 800);
    }

    private onLoadMore = (start, stop) => {
        return unsplashStore.runQuery(start, stop);
    }

    private onSearch = term => {
        dispatch(ImagesActions.webSearch(term));
        this.refs.list.reset();
    }

    private onClicked = (e) => {
        var templateType = e.currentTarget.dataset.templateType;
        var templateId = e.currentTarget.dataset.templateId;
        dispatchAction({ type: "Stencils_Clicked", e, templateType, templateId });
    }

    private getItemHeight(i: IUnsplashStencil) {
        if (i.thumbHeight) {
            return i.thumbHeight;
        }
        return i.portrait ? PortraitHeight : LandscapeHeight;
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
            rowHeight={this.getItemHeight}
            estimatedRowHeight={LandscapeHeight}
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

    private renderItem = (stencil: IUnsplashStencil) => {
        var imageStyle: any = {
            backgroundImage: 'url(' + stencil.thumbUrl + ')'
        };
        var image = <i className="unsplash__image" style={imageStyle} />;
        var credits = <a className="unsplash__credits" href={stencil.credits.link} target="_blank"><span>{stencil.credits.name}</span></a>;
        return <div
            key={stencil.id}
            className={cx("stencil unsplash__holder", { "unsplash__holder_portrait": stencil.portrait })}
            title={stencil.title}
            data-template-type={UnsplashStore.StoreType}
            data-template-id={stencil.id}
            onClick={this.onClicked}
        >
            {image}
            {credits}
        </div>;
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
