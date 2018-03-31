import * as React from "react";
import * as ReactDom from "react-dom";
import { Component, listenTo, dispatchAction, handles } from "../CarbonFlux";
import { richApp } from "../RichApp";
import { FormattedMessage, defineMessages } from 'react-intl';
import bem from "../utils/commonUtils";
import VirtualCollection from "../shared/collections/VirtualCollection";
import ToolboxMasonry from "./ToolboxMasonry";
import LayoutActions, { LayoutAction } from "../layout/LayoutActions";
import { util } from "carbon-core";
import { isRetina } from "../utils/domUtil";
import { CellSize } from "../shared/collections/CollectionDefs";
import { SpriteStencil, ToolboxGroup, ToolboxConfig } from "./LibraryDefs";

const CategoryHeight = 36;

interface SpriteViewProps extends ISimpleReactElementProps {
    templateType: string;
    config: ToolboxConfig<SpriteStencil>;
    configVersion: number;
    columnWidth: number;
    onScrolledToCategory?: (category) => void;
    scrollToCategory?: any;
    changedId?: string | null;
    overscanCount?: number;
    sourceId?: string;
    borders?: boolean;
    keepAspectRatio?: boolean;
    reverse?: boolean;
}

export default class SpriteView extends Component<SpriteViewProps>{
    private masonry: ToolboxMasonry = new ToolboxMasonry(CategoryHeight, x => x.spriteMap.width, x => x.spriteMap.height);
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

    componentWillUnmount() {
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
        var stencilId = e.currentTarget.dataset.stencilId;
        if (stencilId !== this.props.changedId) {
            dispatchAction({ type: "Stencils_Clicked", e: {ctrlKey: e.ctrlKey, metaKey: e.metaKey, currentTarget: e.currentTarget}, stencil: {...e.currentTarget.dataset} });
        }
    };

    private measureCells = (collectionWidth: number) => {
        this.measureCache = this.masonry.measure(this.props.config, collectionWidth, this.props.columnWidth, this.props.keepAspectRatio, this.props.reverse);
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

        if (activeCategory && this.props.onScrolledToCategory) {
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
                let indexInGroup = index - current - 1;
                if (this.props.reverse) {
                    indexInGroup = group.items.length - indexInGroup - 1;
                }
                return this.renderItem(group.items[indexInGroup], group);
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

    private renderItem = (x: SpriteStencil, g: ToolboxGroup<SpriteStencil>) => {
        var spriteUrl;

        if (isRetina) {
            spriteUrl = x.spriteUrl2x || x.spriteUrl;
        }
        else {
            spriteUrl = x.spriteUrl;
        }

        var width = x.spriteMap.width;
        var height = x.spriteMap.height;

        var sw = width;
        var sh = height;
        if(x.spriteSize && x.spriteSize.width) {
            sw = x.spriteSize.width;
        }
        if(x.spriteSize && x.spriteSize.height) {
            sh = x.spriteSize.height;
        }

        var imageStyle: React.CSSProperties = {
            backgroundImage: spriteUrl,
            backgroundSize: sw + 'px ' + sh + "px",
            backgroundPosition: -x.spriteMap.x + 'px ' + -x.spriteMap.y + 'px',
            width: width,
            height: height,
            overflow: 'hidden'
        };

        var modified = x.id === this.props.changedId;
        var modification_badge = modified ? <div className="stencil__modification-indicator"><i className="ico-refresh" /></div> : null;

        var cn = bem("stencil", null, {
            modified: modified,
            bordered: this.props.borders
        });

        return <div key={g.name + x.id}
            className={cn}
            data-stencil-type={this.props.templateType}
            data-stencil-id={x.id}
            data-page-id={x.pageId}
            title={x.title}
            onClick={this.onClicked}>
            <div className={bem("stencil", "image")} style={imageStyle}>
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
