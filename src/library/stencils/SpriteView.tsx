import React from "react";
import ReactDom from "react-dom";
import { Component, listenTo, dispatchAction, handles } from "../../CarbonFlux";
import { richApp } from "../../RichApp";
import StencilsActions from "./StencilsActions";
import { FormattedHTMLMessage, defineMessages, FormattedMessage } from 'react-intl';
import bem from "../../utils/commonUtils";
import VirtualGroupedList from "../../shared/collections/VirtualGroupedList";
import VirtualCollection, { CellSize } from "../../shared/collections/VirtualCollection";
import ToolboxMasonry from "../ToolboxMasonry";
import LayoutActions from "../../layout/LayoutActions";
import { util } from "carbon-core";

const CategoryHeight = 36;

export default class SpriteView extends Component<any, any>{
    private masonry: ToolboxMasonry = new ToolboxMasonry(CategoryHeight, x => x.spriteMap[2], x => x.spriteMap[3]);
    private measureCache: CellSize[];

    refs: {
        collection: VirtualCollection;
    }

    constructor(props) {
        super(props);

        this.onScroll = util.debounce(this.onScroll, 100);
    }

    canHandleActions() {
        return true;
    }

    @handles(LayoutActions.resizePanel)
    onResizePanel() {
        this.refs.collection.reset();
    }

    componentWillUnmoumt() {
        super.componentWillUnmount();
        this.measureCache = null;
    }

    onClicked = (e) => {
        var templateId = e.currentTarget.dataset.templateId;
        var templateType = e.currentTarget.dataset.templateType;
        var sourceId = e.currentTarget.dataset.sourceId;
        if (templateId !== this.props.changedId) {
            dispatchAction({ type: "Stencils_Clicked", e, ...e.currentTarget.dataset });
        }
    };

    isRetina() {
        if (window.matchMedia) {
            var mq = window.matchMedia("only screen and (-moz-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            if (mq && mq.matches) {
                return true;
            }
        }
        return false;
    }

    private measureCells = (collectionWidth: number) => {
        this.measureCache = this.masonry.measure(this.props.config, collectionWidth, this.props.columnWidth);
        return this.measureCache;
    }

    private calculateCellCount() {
        let count = 0;
        let groups = this.props.config.groups;
        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            count += group.items.length + 1;
        }
        return count;
    }

    private calculateScrollToCell(category) {
        if (!category) {
            return -1;
        }

        let count = 0;
        let groups = this.props.config.groups;
        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            if (group === category) {
                return count;
            }

            count += group.items.length + 1;
        }

        return -1;
    }

    private onScroll = (params) => {
        if (!this.measureCache) {
            return;
        }

        let count = 0;
        let groups = this.props.config.groups;
        let activeCategory = null;

        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            let cell = this.measureCache[count];

            if (cell.y + cell.height >= params.scrollTop + params.clientHeight) {
                break;
            }

            activeCategory = group;
            count += group.items.length + 1;
        }

        if (activeCategory) {
            this.props.onScrolledToCategory(activeCategory);
        }
    }

    private renderCell = (index: number) => {
        let current = 0;
        let groups = this.props.config.groups;
        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            if (index === current) {
                return this.renderCategory(group);
            }
            if (index <= current + group.items.length) {
                return this.renderItem(group.items[index - current - 1], group);
            }
            current += group.items.length + 1;
        }
        return null;
    }

    private renderCategory = (g) => {
        return <div className="stencils-group__name">
            <strong><FormattedMessage id={g.name} defaultMessage={g.name} /></strong>
        </div>;
    }

    private renderItem = (x, g) => {
        var containerStyle = {};
        if (x.style) {
            extend(containerStyle, x.style);
        }
        var spriteMap = x.spriteMap;
        var spriteUrl;

        if (this.isRetina()) {
            spriteUrl = (x.spriteUrl2x || g.spriteUrl2x || x.spriteUrl || g.spriteUrl);
        } else {
            spriteUrl = (x.spriteUrl || g.spriteUrl);
        }

        var width = spriteMap[2];
        var height = spriteMap[3];

        var imageStyle: any = {
            backgroundImage: 'url(' + spriteUrl + ')',
            width: width,
            height: height,
            overflow: 'hidden'
        };

        if (g.size) {
            imageStyle.backgroundSize = g.size.width + 'px ' + g.size.height + "px";
        }
        if (spriteMap[0] || spriteMap[1]) {
            imageStyle.backgroundPosition = -spriteMap[0] + 'px ' + -spriteMap[1] + 'px';
        }

        var modified = x.id === this.props.changedId;
        var modification_badge = modified ? <div className="stencil__modification-indicator"><i className="ico--refresh" /></div> : null;

        var cn = bem("stencil", null, {
            modified: modified
        });

        return <div key={g.name + x.id}
            className={cn}
            data-template-id={x.id}
            data-template-type={x.type}
            data-template-pid={x.pageId}
            data-template-aid={x.artboardId}
            data-template-width={x.realWidth}
            data-template-height={x.realHeight}
            data-source-id={this.props.sourceId}
            title={x.title}
            style={containerStyle}
            onClick={this.onClicked}>
            <div className={bem("stencil", "image", null, x.imageClass)} style={imageStyle}>
            </div>
            {modification_badge}
        </div>;
    }

    render() {
        if (!this.props.config) {
            return null;
        }

        let cellCount = this.calculateCellCount();

        return <VirtualCollection
            ref="collection"
            cellCount={cellCount}
            cellRenderer={this.renderCell}
            cellsMeasurer={this.measureCells}
            scrollToCell={this.calculateScrollToCell(this.props.scrollToCategory)}
            onScroll={this.onScroll} />
    }
}
