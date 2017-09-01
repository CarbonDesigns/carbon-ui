import React from "react";
import { Component, StoreComponent, dispatchAction } from "../../CarbonFlux";
import SpriteView from "../SpriteView";
import { richApp } from "../../RichApp";
import recentImagesStore, { RecentImagesStoreState, ImageType, RecentImage } from "./RecentImagesStore";
import { SymbolsOverscanCount, SymbolsColumnWidth, IconsOverscanCount, IconSize, ImageLandscapeHeight, ImagePortraitHeight } from "../LibraryDefs";
import VirtualList from "../../shared/collections/VirtualList";
import { UnsplashStencil } from "./UnsplashStore";
import { getUserImageHeight, UserImage } from "./UserImage";
import { getUnsplashImageHeight, UnsplashImage } from "./UnsplashImage";

type RecentList = new (props) => VirtualList<RecentImage>;
const RecentList = VirtualList as RecentList;

export default class RecentImages extends StoreComponent<{}, RecentImagesStoreState>{
    refs: {
        list: VirtualList<RecentImage>;
    }

    constructor(props) {
        super(props, recentImagesStore);
    }

    componentDidUpdate(prevProps: Readonly<RecentImagesStoreState>, prevState: Readonly<RecentImagesStoreState>) {
        if (prevState.configVersion !== this.state.configVersion) {
            if (this.refs.list) {
                this.refs.list.reset();
            }
        }
    }

    private onClicked = (e) => {
        dispatchAction({ type: "Stencils_Clicked", e: {ctrlKey: e.ctrlKey, metaKey: e.metaKey, currentTarget: e.currentTarget}, stencil: { ...e.currentTarget.dataset } });
    }

    private getItemHeight = (stencil: RecentImage) => {
        if (stencil.imageType.type === "user") {
            return getUserImageHeight(stencil.imageType.stencil);
        }
        return getUnsplashImageHeight(stencil.imageType.stencil);
    }

    private renderItem = (stencil: RecentImage) => {
        if (stencil.imageType.type === "user") {
            return <UserImage stencilType={recentImagesStore.storeType} stencil={stencil.imageType.stencil} onClicked={this.onClicked}/>;
        }
        return <UnsplashImage stencilType={recentImagesStore.storeType} stencil={stencil.imageType.stencil} onClicked={this.onClicked}/>;
    }

    render() {
        return <div className="library-page__content">
            <div className="user-images__list">
                <RecentList ref="list" data={this.state.images}
                    rowHeight={this.getItemHeight}
                    rowRenderer={this.renderItem}
                    reverse={true} />
            </div>
        </div>;
    }
}