import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Selection, Environment, Invalidate, app, IArtboardPage, Brush, Text, IText, workspace, Artboard } from "carbon-core";
import { Component, dispatch, dispatchAction } from "../CarbonFlux";
import LayersActions from './LayersActions';
import bem from "../utils/commonUtils";
import { LayerNode } from "./LayersStore";
import dragController from "./LayersDragController";
import layersStore from "./LayersStore";
import EnterInput from "../shared/EnterInput";

function b(a, b?, c?) { return bem('layer', a, b, c) }

interface LayerItemProps extends ISimpleReactElementProps {
    layer: LayerNode;
    version: number;
    index: number;
    selected: boolean;
    expanded: boolean;
    ancestorSelected: boolean;
    onHide: (node: LayerNode, selected: boolean) => void;
    onLock: (node: LayerNode, selected: boolean) => void;
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
        Environment.view._highlightTarget = LayerItem.findSelectionTarget(node);
        Invalidate.requestInteractionOnly();
    }
    private static onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
        if (!dragController.onDragLeave(e)) {
            delete Environment.view._highlightTarget;
            Invalidate.requestInteractionOnly();
        }
    }

    private onTitleDoubleClick = (ev) => {
        this.setState({ editing: true });
    }

    private onIconDoubleClick = (ev) => {
        if (this.props.layer.element instanceof Artboard) {
            var artboard = this.props.layer.element;
            (app.activePage as IArtboardPage).setActiveArtboardById(artboard.id());
            if (artboard) {
                Environment.view.ensureScale([artboard]);
                Environment.view.ensureCentered([artboard]);
                Selection.clearSelection();
                app.actionManager.invoke("pointerTool");
            }
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

        Selection.makeSelection([element], mode);
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
            return <EnterInput className={b("input")}
                defaultValue={this.props.layer.element.name()}
                onValueEntered={value => {
                    this.props.layer.element.name(value);
                    this.setState({editing: false});
                }}
                autoFocus/>
        }
        return <div onDoubleClick={this.onTitleDoubleClick} className={b('name')}>
            {this.props.layer.element.displayName()}
        </div>;
    }

    render() {
        var layer = this.props.layer;
        let locked = layer.element.locked();
        let visible = layer.element.visible();

        let layerClassNames = b(null, {
            "lock-0": !locked,
            "lock-1": locked,
            "vis-0": !visible,
            "vis-1": visible,
            "selected": this.props.selected,
            "ancestorSelected": this.props.ancestorSelected
        });

        var body_mods = {
            collapsed: !this.props.expanded,
            "lock-0": !locked,
            "lock-1": locked,
            "vis-0": !visible,
            "vis-1": visible,
            selected: this.props.selected,
            "is-container": (layer.type === 'group' || layer.type === 'page' || layer.type === 'artboard'),
            'has-children': layer.hasChildren,
            // 'is-single'   : !ps.hasChildren
        };
        body_mods["indent-" + layer.indent] = true;
        body_mods["type-" + layer.type] = true;

        var colorsCss: React.CSSProperties = {};
        if (layer.element instanceof Text) {
            colorsCss.backgroundColor = (layer.element as IText).props.font.color;
            colorsCss.borderColor = colorsCss.backgroundColor;
        }
        else {
            colorsCss.borderColor = this.displayColor(layer.element.stroke(), 'transparent');
            colorsCss.backgroundColor = this.displayColor(layer.element.fill(), 'transparent');
        }

        var layer_body = (<section
            className={b('body', body_mods)}
            ref="layer_body"
        >
            <div className={b('left-icons')}>
                <VisibleButton onClick={this.onToggleVisible} />
                <LockButton onClick={this.onToggleLock} />
            </div>

            <div className={b('desc')}>
                <div className={b('indent')} onClick={this.onToggleExpand} data-index={this.props.index}>
                    {!!layer.hasChildren && <i className={b("arrow")} />}
                </div>
                <div className={b('title')} >
                    <i className={b('icon', null, `type-icon_${layer.type}`)} onDoubleClick={this.onIconDoubleClick}/>
                    {this.renderTitle()}
                </div>
            </div>

            <div className={b('right-icons')}>
                <div className={b('colors')}>
                    <div className={b('colors-square')} style={colorsCss}></div>
                </div>
                <SelectCheckbox
                    onClick={LayerItem.addToSelection}
                    canSelect={layer.canSelect}
                    index={this.props.index}
                />
            </div>

        </section>);

        return (
            <div ref="item"
                data-index={this.props.index}
                className={layerClassNames}
                onMouseMove={dragController.onDropMove}
                onMouseEnter={LayerItem.onMouseEnter}
                onMouseLeave={LayerItem.onMouseLeave}
                onMouseUp={dragController.onDrop}
                onClick={this.selectElement}
            >
                {layer_body}
            </div>
        );
    }
}

var LockButton = (props) => {
    return <div className="layer__lock" onClick={props.onClick}><i className="layer__lock-icon" /></div>;
};

var VisibleButton = (props) => {
    return <div className="layer__vis" onClick={props.onClick}><i className="layer__vis-icon" /></div>;
};

var SelectCheckbox = (props) => {
    if (!props.canSelect) { return <div className="layer__selection"></div>; }
    return <div className="layer__selection" onClick={props.onClick} data-index={props.index}><i className="layer__selection-icon" /></div>;
};