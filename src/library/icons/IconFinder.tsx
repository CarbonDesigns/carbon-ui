import * as React from "react";
import * as ReactDom from "react-dom";
import * as cx from "classnames";
import { StoreComponent, dispatchAction } from "../../CarbonFlux";
import Search from "../../shared/Search";
import iconFinderStore, { IconFinderStoreState } from "./IconFinderStore";
import InfiniteGrid from "../../shared/collections/InfiniteGrid";
import { Markup, MarkupLine } from "../../shared/ui/Markup";
import { FormattedMessage } from "react-intl";
import { onCssTransitionEnd } from "../../utils/domUtil";
import styled from "styled-components";
import theme from "../../theme";

const IconSize = 40;

export default class IconFinder extends StoreComponent<{}, IconFinderStoreState> {
    page: HTMLElement;
    refs: {
        grid: InfiniteGrid<any>;
    }

    constructor(props) {
        super(props, iconFinderStore);
    }

    componentDidMount() {
        super.componentDidMount();
    }

    private onLoadMore = (start, stop) => {
        return iconFinderStore.runQuery(start, stop);
    }

    public onSearch = term => {
        dispatchAction({ type: "Icons_WebSearch", q: term });
        this.refs.grid.reset();
    }

    private onClicked = (e) => {
        dispatchAction({ type: "Stencils_Clicked", e: {ctrlKey: e.ctrlKey, metaKey: e.metaKey, currentTarget: e.currentTarget}, stencil: { ...e.currentTarget.dataset } });
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
        return <div className="stencil icon"
            title={i.name}
            key={i.name}
            data-stencil-type={iconFinderStore.storeType}
            data-stencil-id={i.id}
            onClick={this.onClicked}>
            <div className="icon_background">
            <i className="icon__holder" style={iconStyle} />
            {this.renderPrice(i)}
            </div>
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
        return <IconFinderContainer innerRef={x=>this.page=x}>
                {this.renderError()}
                {this.renderList()}
        </IconFinderContainer>;
    }
}

const IconFinderContainer = styled.div`
    position:absolute;
    display:flex;
    top:0;
    bottom:0;
    left:0;
    right:0;
    width:100%;
    height:100%;

    .list {
        width:100%;
        height:100%;
    }

    .stencil {
        position:relative;
        cursor:pointer;
        width:100%;
        height:100%;
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding:1px;

        i {
            display: block;
            color: black;
            font-style: normal;
            background-repeat: no-repeat;
        }

        .icon {
            align-items: stretch;
        }

        .icon__holder {
            flex: auto;
            background-size: contain;
            background-position: center center;
        }

        .icon_background {
            width:100%;
            height:100%;
            padding: 4px;
            background-color:${theme.stencil_background};
            border-radius:3px;
            align-items: stretch;
            display:flex;
        }
    }
`;
