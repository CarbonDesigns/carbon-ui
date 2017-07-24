import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Selection, Environment, Invalidate, app, IArtboardPage } from "carbon-core";
import { Component, dispatch } from "../CarbonFlux";
import LayersActions from './LayersActions';
import bem from "../utils/commonUtils";
import { LayerNode } from "./LayersStore";
import LayersDragController from "./LayersDragController";

function b(a, b?, c?) { return bem('layer', a, b, c) }

interface LayerItemProps extends ISimpleReactElementProps {
    layer: LayerNode;
    index: number;
    selected: boolean;
    expanded: boolean;
    ancestorSelected: boolean;
    dragController: LayersDragController;
    onHide: (node: LayerNode, selected: boolean) => void;
    onLock: (node: LayerNode, selected: boolean) => void;
}

export default class LayerItem extends Component<LayerItemProps, any> {
    [x: string]: any;
    refs: any;

    componentDidMount() {
        super.componentDidMount();
        this.listening_to = null;
        this.bodyElement = ReactDOM.findDOMNode(this.refs['layer_body']);
    }

    _toggleVisible = (ev) => {
        ev.stopPropagation();
        this.props.onHide(this.props.layer, this.props.selected);
    };

    _toggleLock = (ev) => {
        ev.stopPropagation();
        this.props.onLock(this.props.layer, this.props.selected);
    };

    _addToSelection = (ev) => {
        ev.stopPropagation();

        if (this.props.ancestorSelected) {
            return false;
        }

        var element = this._findSelectionTarget();
        if (!element || !this.props.layer.canSelect) {
            return;
        }
        var selected = Selection.isElementSelected(element);

        if (selected) {
            Selection.selectionMode("remove");
        } else {
            Selection.selectionMode("add");
        }

        Selection.makeSelection([element]);
        Selection.selectionMode("new");
    };


    _selectElement = (ev) => {
        var element = this._findSelectionTarget();
        ev.stopPropagation();
        if (!element || !this.props.layer.canSelect) {
            return;
        }
        var selected = Selection.isElementSelected(element);

        if (ev.ctrlKey || ev.metaKey || ev.shiftKey) {
            if (selected) {
                Selection.selectionMode("remove");
            }
            else {
                if (!this.props.ancestorSelected) {
                    Selection.selectionMode("add");
                }

            }
        }

        Selection.makeSelection([element]);
        Selection.selectionMode("new");
    };

    _updateHighlighter() {
        if (this._mouseInside) {
            Environment.view._highlightTarget = this._findSelectionTarget();
        } else {
            delete Environment.view._highlightTarget;
        }
        Invalidate.requestInteractionOnly();
    }

    _findSelectionTarget() {
        var element = this.props.layer.element;
        if (this.props.layer.repeater) {
            element = this.props.layer.repeater.findSelectionTarget(element);
        }
        return element;
    }

    _toggleExpand = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        dispatch(LayersActions.toggleExpand(this.props.layer.id));
        return false;
    };

    _onTitleDoubleClick = (ev) => {
        return this._execute('rename', ev);
    };

    _onIconDoubleClick = (ev) => {
        return this._execute('activate', ev);
    }

    _execute(what, ev) {
        this._stopWaiting();

        switch (what) {
            case 'rename':
                this.context.startRenamingLayer(this);
                break;

            case 'activate':
                (app.activePage as IArtboardPage).setActiveArtboardById(this.props.id);
                var artboard = app.activePage.getActiveArtboard();
                if(artboard) {
                    Environment.view.ensureScale([artboard]);
                    Environment.view.ensureVisible([artboard]);
                }
                break;
        }
        ev.preventDefault();
    }

    render() {
        var layer = this.props.layer;

        let layerClassNames = b(null, {
            "lock-0": !layer.locked,
            "lock-1": layer.locked,
            "vis-0": !layer.visible,
            "vis-1": layer.visible,
            "selected": this.props.selected,
            "ancestorSelected": this.props.ancestorSelected
        });

        var body_mods = {
            collapsed: !this.props.expanded,
            "lock-0": !layer.locked,
            "lock-1": layer.locked,
            "vis-0": !layer.visible,
            "vis-1": layer.visible,
            selected: this.props.selected,
            "is-container": (layer.type === 'group' || layer.type === 'page' || layer.type === 'artboard'),
            'has-children': layer.hasChildren,
            // 'is-single'   : !ps.hasChildren
        };
        body_mods["indent-" + layer.indent] = true;
        body_mods["type-" + layer.type] = true;


        var colors_border_style: React.CSSProperties = {
            borderColor: layer.borderColor || 'transparent',
            backgroundColor: layer.backgroundColor || 'transparent'
        };
        if (layer.textColor
            && colors_border_style.borderColor === 'transparent'
            && colors_border_style.backgroundColor === 'transparent'
        ) {
            colors_border_style.borderColor = null;
            colors_border_style.backgroundColor = 'rgba(180,180,180,0.2)';
            colors_border_style.border = '1px dotted rgba(180,180,180,0.4)';
        }


        var colors = (<div className={b('colors-square')} style={colors_border_style}>
            {layer.textColor && <b className={b('colors-text-top')} style={{ backgroundColor: layer.textColor }} />}
            {layer.textColor && <b className={b('colors-text-bottom')} style={{ backgroundColor: layer.textColor }} />}
        </div>);

        var layer_body = (<section
            className={b('body', body_mods)}
            ref="layer_body"
        >
            <div className={b('left-icons')}>
                <VisibleButton onClick={this._toggleVisible} />
                <LockButton onClick={this._toggleLock} />
            </div>

            <div className={b('desc')}>
                <div className={b('indent')} onClick={this._toggleExpand}>
                    {!!layer.hasChildren &&
                        <i className={b("arrow")} />
                    }
                </div>
                <div className={b('title')}
                    onDoubleClick={this._onIconDoubleClick} >
                    <i className={b('icon', null, `type-icon_${layer.type}`)}
                    />
                    <div onDoubleClick={this._onTitleDoubleClick}
                        className={b('name')}>{layer.name}</div>
                </div>
            </div>

            <div className={b('right-icons')}>
                <div className={b('colors')}>
                    {colors}
                </div>
                <SelectCheckbox
                    onClick={this._addToSelection}
                    canSelect={layer.canSelect}
                />
            </div>

        </section>);

        return (
            <div ref="item"
                data-index={this.props.index}
                className={layerClassNames}
                onMouseMove={this.props.dragController.onDropMove}
                onMouseLeave={this.props.dragController.onDragLeave}
                onMouseUp={this.props.dragController.onDrop}
                onClick={this._selectElement}
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
    return <div className="layer__selection" onClick={props.onClick}><i className="layer__selection-icon" /></div>;
};