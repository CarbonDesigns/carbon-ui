import React from "react";
import ReactDom from "react-dom";
import { Component, listenTo, dispatchAction, handles } from "../../CarbonFlux";
import { richApp } from "../../RichApp";
import StencilsActions from "./StencilsActions";
import { FormattedHTMLMessage, defineMessages, FormattedMessage } from 'react-intl';
import bem from "../../utils/commonUtils";
import VirtualCollection from "../../shared/collections/VirtualCollection";
import ToolboxMasonry from "../ToolboxMasonry";
import LayoutActions, { LayoutAction } from "../../layout/LayoutActions";
import { util } from "carbon-core";
import { isRetina } from "../../utils/domUtil";
import { CellSize } from "../../shared/collections/CollectionDefs";

const CategoryHeight = 36;

interface SpriteViewProps extends ISimpleReactElementProps {
    templateType: string;
    config: any;
    configVersion: number;
    columnWidth: number;
    onScrolledToCategory?: (category) => void;
    scrollToCategory?: any;
    changedId?: string | null;
    overscanCount?: number;
    sourceId?: string;
    borders?: boolean;
    keepAspectRatio?: boolean;
}

export default class SpriteView extends Component<SpriteViewProps>{
    private masonry: ToolboxMasonry = new ToolboxMasonry(CategoryHeight, x => x.spriteMap[2], x => x.spriteMap[3]);
    private measureCache: CellSize[];
    private lastConfigVersion = 0;

    refs: {
        collection: VirtualCollection;
    }

    constructor(props: SpriteViewProps) {
        super(props);

        this.onScroll = util.debounce(this.onScroll, 100);
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate(prevProps, prevState);

        if (this.props.configVersion !== this.lastConfigVersion) {
            this.refs.collection.reset();
        }
    }

    componentWillUnmoumt() {
        super.componentWillUnmount();
        this.measureCache = null;
    }

    canHandleActions() {
        return true;
    }

    onAction(action: LayoutAction) {
        switch (action.type) {
            case "Layout_StartResizing":
                this.refs.collection.suspend();
                return;
            case "Layout_StopResizing":
                this.refs.collection.resume();
                return;
            case "Layout_PanelsResized":
                if (action.panels.indexOf("library") !== -1) {
                    this.refs.collection.reset();
                }
                return;
        }
    }

    onClicked = (e) => {
        var templateId = e.currentTarget.dataset.templateId;
        var sourceId = e.currentTarget.dataset.sourceId;
        if (templateId !== this.props.changedId) {
            dispatchAction({ type: "Stencils_Clicked", e, ...e.currentTarget.dataset });
        }
    };

    private measureCells = (collectionWidth: number) => {
        this.measureCache = this.masonry.measure(this.props.config, collectionWidth, this.props.columnWidth, this.props.keepAspectRatio);
        this.lastConfigVersion = this.props.configVersion;
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

        if (isRetina) {
            spriteUrl = (x.spriteUrl2x || g.spriteUrl2x || x.spriteUrl || g.spriteUrl);
        } else {
            spriteUrl = (x.spriteUrl || g.spriteUrl);
        }

        var width = spriteMap[2];
        var height = spriteMap[3];

        var imageStyle: any = {
            backgroundImage: spriteUrl,
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
            modified: modified,
            bordered: this.props.borders
        });

        return <div key={g.name + x.id}
            className={cn}
            data-template-id={x.id}
            data-template-type={this.props.templateType}
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
            overscanCount={this.props.overscanCount}
            onScroll={this.onScroll}
            />
    }
}
