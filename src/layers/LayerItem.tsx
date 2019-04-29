import * as React from "react";
import * as ReactDom from "react-dom";
import * as PropTypes from "prop-types";
import * as cx from "classnames";
import { Selection, Invalidate, app, IArtboardPage, Brush, Text, IText, Artboard, Types } from "carbon-core";
import { Component, dispatch, dispatchAction } from "../CarbonFlux";
import { LayerNode } from "./LayersStore";
import dragController from "./LayersDragController";
import layersStore from "./LayersStore";
import EnterInput from "../shared/EnterInput";
import styled from "styled-components";
import theme from "../theme";
import icons from "../theme-icons";
import IconButton from "../components/IconButton";
import Icon from "../components/Icon";


interface LayerItemProps extends ISimpleReactElementProps {
    layer: LayerNode;
    version: number;
    index: number;
    selected: boolean;
    expanded: boolean;
    useInCode: boolean;
    ancestorSelected: boolean;
    onHide: (node: LayerNode, selected: boolean) => void;
    onLock: (node: LayerNode, selected: boolean) => void;
    onCode: (node: LayerNode, selected: boolean) => void;
}

type LayerItemState = {
    editing?: boolean;
}

export default class LayerItem extends Component<LayerItemProps, LayerItemState> {
    static DefaultState = {};

    constructor(props) {
        super(props);
        this.state = LayerItem.DefaultState;
    }

    private onToggleVisible = (ev) => {
        ev.stopPropagation();
        this.props.onHide(this.props.layer, this.props.selected);
    }

    private onToggleCode = (ev) => {
        ev.stopPropagation();
        this.props.onCode(this.props.layer, this.props.selected);
    }

    private onToggleLock = (ev) => {
        ev.stopPropagation();
        this.props.onLock(this.props.layer, this.props.selected);
    }

    private onToggleExpand = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        dispatchAction({ type: "Layers_toggleExpand", index: parseInt(ev.currentTarget.dataset.index) });
        return false;
    }

    private static onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
        let node = layersStore.getLayerNodeFromEvent(e);
        app.actionManager.invoke("highlightTarget", LayerItem.findSelectionTarget(node));
    }
    private static onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
        if (!dragController.onDragLeave(e)) {
            app.actionManager.invoke("highlightTarget", null);
        }
    }

    private onTitleDoubleClick = (ev) => {
        this.setState({ editing: true });
    }

    private onIconDoubleClick = (ev) => {
        if (this.props.layer.element instanceof Artboard) {
            var artboard = this.props.layer.element;
            this.activateArtboard(artboard);
        }
    }

    private activateArtboard(artboard) {
        app.actionManager.invoke("setActiveArtboardById", artboard.id);
        if (artboard) {
            app.actionManager.invoke("ensureScaleAndCentered", [artboard]);
            Selection.clearSelection();
            app.actionManager.invoke("pointerTool");
        }

    }

    static addToSelection = (ev) => {
        ev.stopPropagation();

        var layer = layersStore.getLayerNodeFromEvent(ev);

        if (layersStore.isAncestorSelected(layer)) {
            return false;
        }

        var element = LayerItem.findSelectionTarget(layer);
        if (!element || !layer.canSelect) {
            return;
        }
        var selected = Selection.isElementSelected(element);

        Selection.makeSelection([element], "toggle");
    }

    private selectElement = (ev) => {
        let node = layersStore.getLayerNodeFromEvent(ev);
        ev.stopPropagation();

        var element = LayerItem.findSelectionTarget(node);
        if (!element || !this.props.layer.canSelect) {
            return;
        }

        let keys = { ctrlKey: ev.ctrlKey || ev.metaKey, altKey: ev.altKey, shiftKey: ev.shiftKey };
        var selected = Selection.isElementSelected(element);

        let mode = Selection.getSelectionMode(keys, true);

        if (element instanceof Artboard) {
            this.activateArtboard(element);
        } else {
            Selection.makeSelection([element], mode);
        }
    }

    private static findSelectionTarget(node: LayerNode) {
        var element = node.element;
        if (node.repeater) {
            element = node.repeater.findSelectionTarget(element);
        }
        return element;
    }

    private displayColor(brush: Brush, defaultColor) {
        if (brush) {
            let style = Brush.toCss(brush);
            if (style.backgroundColor) {
                return style.backgroundColor;
            }
        }

        return defaultColor;
    }

    private renderTitle() {
        if (this.state.editing) {
            return <EnterInput
                value={this.props.layer.element.name}
                onValueEntered={value => {
                    this.props.layer.element.name = (value);
                    this.setState({ editing: false });
                }}
                autoFocus />
        }
        return <span onDoubleClick={this.onTitleDoubleClick}>
            {this.props.layer.element.displayName()}
        </span>;
    }

    private renderCollapser() {
        var layer = this.props.layer;
        if (!layer.hasChildren) {
            return null;
        }
        return <IconButton
            icon={this.props.expanded ? icons.layer_expanded : icons.layer_collapsed}
            width={10}
            height={10}
            className="collapser"
            data-index={this.props.index}
            onClick={this.onToggleExpand} />
    }

    private renderIcon() {
        var layer = this.props.layer;
        if (!layer.hasChildren) {
            return <IconContainer className="_icon">
                <Icon icon={icons["l_" + layer.type]}/>
            </IconContainer>
        }

        return <IconContainer className="_icon">
                <Icon icon={this.props.expanded ? icons.l_group_open : icons.l_group_closed}/>
             </IconContainer>
    }

    render() {
        var layer = this.props.layer;
        let locked = layer.element.locked();
        let visible = layer.element.visible;
        let useInCode = this.props.useInCode;

        return (
            <LayerContainer ref="item"
                data-index={this.props.index}
                onMouseMove={dragController.onDropMove}
                onMouseEnter={LayerItem.onMouseEnter}
                onMouseLeave={LayerItem.onMouseLeave}
                onMouseUp={dragController.onDrop}
                onClick={this.selectElement}
                indent={layer.indent}
                className={cx("layer", { selected: this.props.selected, artboard: layer.type == "page" })}
            >
                {this.renderCollapser()}
                {this.renderIcon()}
                <LayerCaption>{this.renderTitle()}</LayerCaption>
                <ActionButtons className="layerButtons">
                    <IconButton className={cx("layerButton", { active: !visible })} icon={icons.layer_visible} width={16} height={16} onClick={this.onToggleVisible} title="@hide/show" />
                    <IconButton className={cx("layerButton", { active: locked })} icon={icons.layer_lock} width={16} height={16} onClick={this.onToggleLock} title="@lock/unlock" />
                    <IconButton className={cx("layerButton", { active: useInCode })} icon={icons.layer_code} width={16} height={16} onClick={this.onToggleCode} title="@useInCode" />
                </ActionButtons>
            </LayerContainer>
        );
    }
}

const ActionButtons = styled.div`
    display:flex;
    align-self:flex-end;
    height:100%;
    align-items:center;
    padding-right:4px;
`;

const layer_height = 36;

const IconContainer = styled.div`
    width: 16px;
    height: 15px;
    margin-left: 8px;
    display:flex;
`;

const LayerContainer = styled.div<any>`
    display:flex;
    align-items:center;
    height:${layer_height}px;
    padding-left:${props => (props.indent + 1) * 16}px;
    border-radius:1px;
    cursor:pointer;
    position:relative;

    .layers__container_moving &:hover {
        background:none;
    }

    &:hover {
        background-color:${theme.layer_hover_background};
    }

    &.artboard::before {
        content: "";
        display:block;
        background-color: ${theme.layer_artboard_background};
        border-radius: 4px;
        position:absolute;
        top:4px;
        bottom:4px;
        left:8px;
        right:8px;
        z-index:-1;
    }

    &.selected {
        background-color: ${theme.layer_selection_background};
    }

    &:not(:hover) {
        & .layerButton:not(.active) {
            opacity:0;
        }
    }
`;

const LayerCaption = styled.div`
    font:${theme.default_font};
    color:${theme.text_color};
    padding-left: 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex:1;
    input {
        height:${layer_height}px;
        padding-left:8px;
    }
`;
