import * as React from "react";
import * as ReactDom from "react-dom";
import { Component, listenTo, dispatchAction, StoreComponent } from "../../CarbonFlux";
import Search from "../../shared/Search";
import ScrollContainer from "../../shared/ScrollContainer";
import SpriteView from "../SpriteView";
import searchImagesStore, { SearchImagesStoreState } from "./SearchImagesStore";
import Navigatable from "../../shared/Navigatable";
import bem from "../../utils/commonUtils";
import { SymbolsOverscanCount, SymbolsColumnWidth, IconsOverscanCount, IconSize } from "../LibraryDefs";
import LessVars from "../../styles/LessVars";
import { Markup, MarkupLine } from "../../shared/ui/Markup";
import { FormattedMessage } from "react-intl";
import { GuiButton } from "../../shared/ui/GuiComponents";
import VirtualList from "../../shared/collections/VirtualList";
import { UserImageStencil } from "./UserImagesStore";
import { UserImage, getUserImageHeight } from "./UserImage";
import { onCssTransitionEnd } from "../../utils/domUtil";
import styled from "styled-components";
import theme from "../../theme";

type ImageList = new (props) => VirtualList<UserImageStencil>;
const ImageList = VirtualList as ImageList;

export default class SearchImages extends StoreComponent<{}, SearchImagesStoreState>{
    page: HTMLElement;

    refs: {
        search: Search;
    }

    constructor(props) {
        super(props, searchImagesStore);
    }

    componentDidMount() {
        super.componentDidMount();

        var page = ReactDom.findDOMNode(this.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        onCssTransitionEnd(page, () => this.refs.search.focus(), LessVars.tabTransitionTime);
    }

    private onSearch = (q) => {
        dispatchAction({ type: "Images_Search", q });
    }

    private onUnsplashSearch = () => {
        dispatchAction({ type: "Library_Tab", area: "images", tabId: "3" });
        dispatchAction({ type: "Images_UnsplashSearch", q: this.state.query });
    }

    private onClicked = (e) => {
        dispatchAction({ type: "Stencils_Clicked", e: {ctrlKey: e.ctrlKey, metaKey: e.metaKey, currentTarget: e.currentTarget}, stencil: { ...e.currentTarget.dataset } });
    }

    render() {
        let noResults = this.state.images && !this.state.images.length && this.state.query;

        return <SearchImagesContainer innerRef={x=>this.page = x}>
            <div className="library-page__header">
                <Search query={this.state.query} onQuery={this.onSearch} placeholder="@images.find" ref="search" />
            </div>

            {this.state.error ? this.renderError() : noResults ? this.renderNoResults() : this.renderResults()}
        </SearchImagesContainer>;
    }

    private renderNoResults() {
        return <Markup>
            <MarkupLine center>
                <FormattedMessage tagName="p" id="@images.noneFoundSearch" />
            </MarkupLine>
            <MarkupLine center>
                <GuiButton caption="@images.searchUnsplash" mods="hover-white" onClick={this.onUnsplashSearch} />
            </MarkupLine>
        </Markup>;
    }

    private renderError() {
        if (this.state.error) {
            return <Markup>
                <MarkupLine>
                    <FormattedMessage tagName="p" id="@userImages.error" />
                </MarkupLine>
            </Markup>;
        }
        return null;
    }

    private renderItem = (stencil: UserImageStencil) => {
        return <UserImage stencilType={searchImagesStore.storeType} stencil={stencil} onClicked={this.onClicked} />;
    }

    private renderResults() {
        return <div className="library-page__content">
            <div className="user-images__list">
                <ImageList ref="list" data={this.state.images}
                    rowHeight={getUserImageHeight}
                    rowRenderer={this.renderItem}
                    reverse={true} />
            </div>
        </div>;
    }
}


const SearchImagesContainer = styled.div`
    font:${theme.default_font};
    color:${theme.text_color};
`;