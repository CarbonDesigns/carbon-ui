import * as React from "react";
import * as ReactDom from "react-dom";
import { StoreComponent, dispatchAction } from "../../CarbonFlux";
import Search from "../../shared/Search";
import unsplashStore, { UnsplashStoreState, UnsplashStencil } from "./UnsplashStore";
import InfiniteList from "../../shared/collections/InfiniteList";
import { ImageLandscapeHeight } from "../LibraryDefs";
import { MarkupLine, Markup } from "../../shared/ui/Markup";
import { FormattedMessage } from "react-intl";
import { getUnsplashImageHeight, UnsplashImage } from "./UnsplashImage";
import styled from "styled-components";
import theme from "../../theme";

type UnsplashList = new (props) => InfiniteList<UnsplashStencil>;
const UnsplashList = InfiniteList as UnsplashList;

export default class Unsplash extends StoreComponent<{}, UnsplashStoreState>{
    page: HTMLElement;

    refs: {
        search: Search;
        list: InfiniteList<any>;
    }

    constructor(props) {
        super(props, unsplashStore);
    }

    componentDidMount() {
        super.componentDidMount();
        var page = ReactDom.findDOMNode(this.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        // onCssTransitionEnd(page, () => this.refs.search.focus(), 800);
    }

    private onLoadMore = (start, stop) => {
        return unsplashStore.runQuery(start, stop);
    }

    public onSearch = term => {
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
        return <UnsplashContainer innerRef={p=>this.page = p} className="unsplash">
            <div className="library-page__content">
                <section className="fill">
                    {this.renderError()}
                    {this.renderList()}
                </section>
            </div>
        </UnsplashContainer>;
    }
}

const UnsplashContainer = styled.div`
    .unsplash__holder {
        position:relative;;
        width:100%;
        height:100%;
        border-radius: 3px;
        padding:0 ${theme.margin1} ${theme.margin2} ${theme.margin1};
        overflow:hidden;
    }

    .unsplash__image {
        width:100%;
        height:100%;
        background-size: cover;
        display:inline-block;
        border-radius: 3px;
    }

    .unsplash__credits {
        right: 0;
        background: rgba(0, 0, 0, .5);
        position: absolute;
        bottom: ${theme.margin2};
        right:${theme.margin1};
        text-decoration: none;
        color: #EEE;
        padding: 2px 4px;
        cursor:pointer;
    }
`;
