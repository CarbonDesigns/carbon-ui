import * as React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import { FormattedMessage } from 'react-intl';
import bem from "../utils/commonUtils";
import VirtualCollection from "../shared/collections/VirtualCollection";
import ToolboxMasonry from "./ToolboxMasonry";
import { LayoutAction } from "../layout/LayoutActions";
import { util } from "carbon-core";
import { isRetina } from "../utils/domUtil";
import { CellSize } from "../shared/collections/CollectionDefs";
import { SpriteStencil, ToolboxGroup, ToolboxConfig } from "./LibraryDefs";
import styled, { css } from "styled-components";
import theme from "../theme";

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
    collection: VirtualCollection;

    constructor(props: SpriteViewProps) {
        super(props);

        this.onScroll = util.debounce(this.onScroll, 100);
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate(prevProps, prevState);

        if (this.props.configVersion !== this.lastConfigVersion) {
            this.collection.reset();
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
                this.collection.suspend();
                return;
            case "Layout_StopResizing":
                this.collection.resume();
                return;
            case "Layout_PanelsResized":
                if (action.panels.indexOf("library") !== -1) {
                    this.collection.reset();
                }
                return;
        }
    }

    onClicked = (e) => {
        var stencilId = e.currentTarget.dataset.stencilId;
        if (stencilId !== this.props.changedId) {
            dispatchAction({ type: "Stencils_Clicked", e: { ctrlKey: e.ctrlKey, metaKey: e.metaKey, currentTarget: e.currentTarget }, stencil: { ...e.currentTarget.dataset } });
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
        return <div className="group__name">
            <FormattedMessage id={g.name} defaultMessage={g.name} />
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
        if (x.spriteSize && x.spriteSize.width) {
            sw = x.spriteSize.width;
        }
        if (x.spriteSize && x.spriteSize.height) {
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

        // var cn = bem("stencil", null, {
        //     modified: modified,
        //     bordered: this.props.borders
        // });

        return <div key={g.name + x.id}
            className="stencil"
            data-stencil-type={this.props.templateType}
            data-stencil-id={x.id}
            data-page-id={x.pageId}
            title={x.title}
            onClick={this.onClicked}>
            <div className="stencil__image" style={imageStyle}>
            </div>
            {modification_badge}
        </div>;
    }

    render() {
        if (!this.props.config) {
            return null;
        }

        let cellCount = this.calculateCellCount();
        return <SpriteViewContainer className="sprite-view">
            <VirtualCollection
                ref={x=>this.collection = x}
                cellCount={cellCount}
                cellRenderer={this.renderCell}
                cellsMeasurer={this.measureCells}
                scrollToCell={this.calculateScrollToCell(this.props.scrollToCategory)}
                overscanCount={this.props.overscanCount}
                onScroll={this.onScroll}/>
        </SpriteViewContainer>
    }
}

const SpriteViewContainer = styled.div`
    width:100%;
    height:100%;
    top:0;
    bottom:0;
    left:0;
    right:0;
    position:absolute;
    .group__name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: ${theme.margin1};
        flex-basis: 100%;
        font:${theme.default_font};
        color:${theme.text_color};
    }

    .stencil {
        position:relative;
        cursor:pointer;
        background-color:${theme.stencil_background};
        width:100%;
        height:100%;
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        border-radius:3px;

        &__image{
            background-repeat: no-repeat;
            flex: 0 0 auto;
        }

        i {
            display: block;
            color: black;
            font-style: normal;
            background-repeat: no-repeat;
        }

        &.image-holder{
            .image{
                background: no-repeat center center;
            }
        }

        &_icon {
            padding: 4px;
            align-items: stretch;
        }

        &_icon__holder {
            flex: auto;
            background-size: contain;
            background-position: center center;
        }

        &_userImage {
            width:100%;
            height:100%;
            i {
                width:100%;
                height:100%;
                background-position: center center;
            }
        }

        &_data {
            width: 100px;
            height: 80px;
            overflow: hidden;
        }
    }
/* .sidebar &.smart-child {
    &:before {
        .bef;
        .size(0);
        @c : #8dd217;
        @s : 4px;
        border-top    :@s solid @c;
        border-right  :@s solid @c;
        border-bottom :@s solid transparent;
        border-left   :@s solid transparent;
        top  : 0;
        right: 0;
    }
}


&__modification-indicator {
    .clip;
    .op0;
    @size: 2.4rem;

    .size(@size);

    .abs;
    bottom: -4px;
    right: 0;
    z-index: 2;
    .flexcenter;
    .rounded();
    .scale(.5);
    .bgc(rgba(228, 177, 4, 0.93));
}

&&_modified  &__modification-indicator {
    bottom: -2px;
    .trn2;
    .op1;
    .scale(1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
}


&&_modified{
    box-shadow: inset 0 0 0 10000px fadeout(@bg1_topbar, 40%);
    .trn2;
    overflow: visible;
    cursor: auto;
}
&&_modified > i {
    .trn2;
    .op80;
}

&&_bordered {
    border-width: 0 1px 1px 0;
    border-style: solid;
    border-color: @bg4_panel_body;
}


.panel[data-mode="narrow"] & {
    @w : 100% / 6;
    @m : 0;

    &.w2  {@s : 2; width: (((@w + @m) * @s) - @m);}
    &.w4  {@s : 4; width: (((@w + @m) * @s) - @m);}
    &.w6  {@s : 6; width: (((@w + @m) * @s) - @m);}
    &.w8  {@s : 6; width: (((@w + @m) * @s) - @m);}
    &.w10 {@s : 6; width: (((@w + @m) * @s) - @m);}
}


.panel[data-mode="widest"]  & {
    @w : 100% / 10;
    @m : 0;

    &.w2  {@s : 2;  width: (((@w + @m) * @s) - @m);}
    &.w4  {@s : 4;  width: (((@w + @m) * @s) - @m);}
    &.w6  {@s : 4;  width: (((@w + @m) * @s) - @m);}
    &.w8  {@s : 6; width: (((@w + @m) * @s) - @m);}
    &.w10 {@s : 10; width: (((@w + @m) * @s) - @m);}
}


.library-page__content.disabled &{
    cursor: not-allowed;
} */
`