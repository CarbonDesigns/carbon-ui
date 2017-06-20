import { Component, listenTo } from '../CarbonFlux';
import React from 'react';
import ReactDOM from 'react-dom';
//import {FormattedHTMLMessage} from 'react-intl';
//import {msg} from '../intl/store';
import Panel from '../layout/Panel'
import { richApp } from '../RichApp';
import cx from 'classnames';
import LayersActions from './LayersActions';
import ScrollContainer from "../shared/ScrollContainer";
import { app, Invalidate, Selection, Environment} from "carbon-core";
import { node_offset, say } from "../shared/Utils";
import bem from "bem";
import FlyoutPopupSpawner from "../shared/FlyoutPopup";

import EnterInput from "../shared/EnterInput";
import { GuiButton, GuiInput, GuiButtonedInput } from "../shared/ui/GuiComponents";


// TODO: inherited visibility and lock style
function b(a, b, c) { return bem('layer', a, b, c) }


function prevent(ev) { ev.stopPropagation(); ev.preventDefault(); return false }

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

class LayersHighlight extends Component {
    constructor() {
        super();
        this.state = {
            highlight_top: 0,
            highlight_mode: 'none'
        };
    }

    _setModeAndPosition = (highlight_top, highlight_mode) => {
        this.setState({ highlight_top, highlight_mode });
    };

    render() {
        var highlight_style = {
            top: this.state.highlight_top
        };
        var mode = !this.props.dragging_mode ? 'none' : this.state.highlight_mode;
        var cn = bem("layers-panel__highlight", null, mode);

        return <div className={cn} style={highlight_style}></div>;
    }
}

class LayerRenamer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            layer_name: this.props.layer_name,
        };
    }

    componentDidMount(props, state) {
        super.componentDidMount(props, state);
        this.input_el = ReactDOM.findDOMNode(this.refs['rename_input_wrapper'].refs['input']);
        this.refs['rename_input_wrapper'].refs['input'].focus();
    }

    _onSaveRenameClick = (ev) => { this.props.save(this.props.layer, this.input_el.value); };

    _onCancelRenameClick = (ev) => { this.props.cancel() };


    _onKeyDown = (ev) => {
        if (ev.key === "Escape") {
            this.props.cancel();
            return prevent(ev);
        }
        if (ev.key === "Enter") {
            this.props.save(this.props.layer, this.input_el.value);
            return prevent(ev);
        }

        ev.stopPropagation();
    };

    _stopPropagation(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }

    render() {
        return <div className="layers-panel__rename"
            onClick={this._stopPropagation}
            onMouseDown={this._stopPropagation}
            onKeyDown={this.onKeyDown}
        >
            { /* <p className="layers-panel__rename-intro">{say("Rename layer")}</p> */}

            <GuiButtonedInput>
                <GuiInput
                    ref="rename_input_wrapper"
                    className="layers-panel__rename-input"
                    onKeyDown={this._onKeyDown}
                    defaultValue={this.state.layer_name}
                // onBlur={this._onCancelRenameClick}
                />
                <GuiButton onClick={this._onSaveRenameClick} mods={["hover-success", "square"]} className="layers-panel__rename-save" icon="ok-white" />
                <GuiButton onClick={this._onCancelRenameClick} mods={["hover-cancel", "square"]} className="layers-panel__rename-cancel" icon="cancel" />
            </GuiButtonedInput>
        </div>
    }
}



class LayerItem extends Component {

    componentDidMount(props, state) {
        super.componentDidMount(props, state);
        this.listening_to = null;
        this.bodyElement = ReactDOM.findDOMNode(this.refs['layer_body']);
    }

    _toggleVisible = (ev) => {
        ev.stopPropagation();
        this.props.onHide(this);
    };

    _toggleLock = (ev) => {
        ev.stopPropagation();
        this.props.onLock(this);
    };

    _addToSelection = (ev) => {
        ev.stopPropagation();

        if (this.props.inheritedlySelected) {
            return false
        }

        var element = this._findSelectionTarget();
        if (!element || !this.props.canSelect) {
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
        if (!element || !this.props.canSelect) {
            return;
        }
        var selected = Selection.isElementSelected(element);

        if (ev.ctrlKey || ev.metaKey || ev.shiftKey) {
            if (selected) {
                Selection.selectionMode("remove");
            }
            else {
                if (!this.props.inheritedlySelected) {
                    Selection.selectionMode("add");
                }

            }
        }

        Selection.makeSelection([element]);
        Selection.selectionMode("new");
    };



    _updateHighlighter() {
        if (this._mouseInside && this.props.element.getBoundaryRectGlobal) {
            Environment.view._highlightTarget = this._findSelectionTarget();
        } else {
            delete Environment.view._highlightTarget;
        }
        Invalidate.requestInteractionOnly();
    }

    _findSelectionTarget(){
        var element = this.props.element;
        if (this.props.repeater){
            element = this.props.repeater.findSelectionTarget(element);
        }
        return element;
    }

    _scrollIntoView() {
        this.refs.item.scrollIntoViewIfNeeded();
    }

    _toggleExpand = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        richApp.dispatch(LayersActions.toggleExpand(this.props.uid));
        return false;
    };


    _resolve_OnMouseOver_LayerZone(part) {
        return (ev) => {
            if (!this.props.dragging_mode) {
                return null
            }
            ev.stopPropagation();
            this.context.dragOver(this, part, ev);
        }
    }


    _resolve_OnMouseUp_LayerZone(part) {
        return (ev) => {
            if (!this.props.dragging_mode) {
                return null
            }
            this.context.dragEnd();
            prevent(ev);
            this._executeLayerReordering(this, part, ev);
        }
    }

    _executeLayerReordering(that, part, ev) {
        let targets = Selection.selectedElements();
        if(!targets || !targets.length) {
            return;
        }

        Selection.makeSelection([]);

        if (part === 'first') {
            for(let i = 0; i < targets.length ; ++i)
            {
                let target = targets[i];
                let gm = target.globalViewMatrix();
                target.setTransform(gm);
                app.activePage.add(target);
            }
        }
        else if (part === 'last') {
            for(let i = targets.length - 1; i >= 0 ; --i)
            {
                let target = targets[i];
                let gm = target.globalViewMatrix();
                target.setTransform(gm);
                app.activePage.insert(target, 0);
            }
        }
        else {
            var element = this.props.element;
            if (element) {
                if (part === 'mid') {
                    targets.forEach((target, i)=>{
                        let gm = target.globalViewMatrix();
                        target.setTransform(element.globalViewMatrixInverted().appended(gm));
                        element.add(target);
                    })

                    element.performArrange();
                } else {
                    let parent = element.parent();
                    targets.forEach(a=>{
                        let gm = a.globalViewMatrix();
                        // set transform before removal, otherwise undo will not work
                        a.setTransform(parent.globalViewMatrixInverted().appended(gm));
                        a.parent().remove(a);
                    });

                    // index must be retrieved after removal of all elements
                    let index = element.index();

                    if(part === 'top') {
                        index ++;
                    }

                    for(let i = targets.length - 1; i >=0; --i) {
                        parent.insert(targets[i], index);
                    }

                    parent.performArrange();
                }
            }
        }
        Selection.makeSelection(targets);
    };

    _onLayerMouseDown = (ev) => {
        this._startWaiting(ev);
        return prevent(ev);
    };


    _onLayerMouseUp = (ev) => {
        if (this.listening_to) {
            return this._execute('selection', ev);
        }
    };

    _onTitleDoubleClick = (ev) => {
        return this._execute('rename', ev);
    };

    _onLayerBodyMouseLeave = (ev) => {
        if (this.listening_to) {
            return this._execute('start dragging', ev);
        }
    };

    _onLayerBodyMouseEnter = (ev) => {

    };


    _onLayerMouseLeave = (ev) => {
        this._mouseInside = false;
        this._updateHighlighter();
    };

    _onLayerMouseEnter = (ev) => {
        this._mouseInside = true;
        this._updateHighlighter();
    };


    _execute(what, ev) {
        this._stopWaiting();

        switch (what) {
            case 'start dragging':
                // if (!this.props.selected && this.props.canSelect) {
                //     this._selectElement(ev);
                // }
                this._startDragging();
                break;

            case 'selection':
                // if (!this.props.selected && this.props.canSelect) {
                //     this._selectElement(ev);
                // }
                break;

            case 'rename':
                this.context.startRenamingLayer(this);
                break;
        }
        return prevent(ev);
    }


    _startWaiting(ev) {
        if (!this.props.selected && this.props.canSelect) {
            this._selectElement(ev);
        }

        this.listening_to = this.props.uid;

        // on this Layer mouse up - select element
        // on doubleClick - rename
        // on Layer MouseLeave - start dragging

        // on panel MouseLeave - drop
        // on alttab - drop


        document.body.addEventListener("mouseup", this._stopWaiting);
        window.addEventListener('blur', this._stopWaiting);
        //todo what to do with click
    };

    _stopWaiting = (ev) => {
        this.listening_to = null;
        document.body.removeEventListener("mouseup", this._stopWaiting);
        window.removeEventListener("blur", this._stopDragging);
    };

    _startDragging = () => {
        this.context.dragStart();
        document.body.addEventListener("mouseup", this._documentBodyMouseUp);
        window.addEventListener('blur', this._stopDragging);
    };

    _documentBodyMouseUp = (ev) => {
        var $target = $(ev.target);
        var hit_on_hover_zone = $target.closest('.layer__hover-zone').length === 0 && $target.closest('.layers-panel__hover-zone').length == 0
        if (!hit_on_hover_zone) {
            this._removeDraggingListeners();
            // and leave mouse up further
        }
        else {
            this._stopDragging(ev);
        }
    };


    _removeDraggingListeners = () => {
        document.body.removeEventListener("mouseup", this._documentBodyMouseUp);
        window.removeEventListener('blur', this._stopDragging);
    };

    _stopDragging = (ev) => {
        this.context.dragEnd();
        prevent(ev);
        this._removeDraggingListeners();
        return false;
    };


    _renderHoverZone(zone) {
        var className = (zone === 'first' || zone === 'last')
            ? bem('layers-panel', 'hover-zone', zone)
            : b('hover-zone', zone);

        return <div
            key={zone}
            ref={zone}
            className={className}
            onMouseUp={this._resolve_OnMouseUp_LayerZone(zone)}
            onMouseEnter={this._resolve_OnMouseOver_LayerZone(zone)}
        ></div>
    };



    render() {
        var layer = this.props;

        if (layer.first_placeholder === true)
            return this._renderHoverZone('first');

        if (layer.last_placeholder === true)
            return this._renderHoverZone('last');

        var hovers_overlay = (<div className={b('overlay')}>
            {this._renderHoverZone('top')}
            {this._renderHoverZone('bottom')}
            {this._renderHoverZone('mid')}
            {this._renderHoverZone('none')}
        </div>);


        let layerClassNames = b(null, {
            "lock-0": !layer.locked,
            "lock-1": layer.locked,
            "vis-0": !layer.visible,
            "vis-1": layer.visible,
            "selected": layer.selected
        });

        var children;
        if (this.props.children != null) {
            children = (<div className={b('children', { collapsed: !layer.expanded })}>{this.props.children}</div>);
        }

        var body_mods = {
            collapsed: !layer.expanded,
            "lock-0": !layer.locked,
            "lock-1": layer.locked,
            "vis-0": !layer.visible,
            "vis-1": layer.visible,
            selected: layer.selected,
            "is-container": (layer.type === 'group' || layer.type === 'page' || layer.type === 'artboard'),
            'has-children': layer.hasChildren,
            // 'is-single'   : !ps.hasChildren
        };
        body_mods["indent-" + layer.indent] = true;
        body_mods["type-" + layer.type] = true;


        var colors_border_style = {
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
            onMouseUp={this._onLayerMouseUp}
            onMouseLeave={this._onLayerBodyMouseLeave}
            onMouseEnter={this._onLayerBodyMouseEnter}
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
                    onMouseDown={this._onLayerMouseDown}
                    onDoubleClick={this._onTitleDoubleClick}
                >
                    <i className={b('icon', null, `type-icon_${layer.type}`)} />
                    <div className={b('name')}>{layer.name}</div>
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

            {hovers_overlay}
        </section>);


        return (
            <div ref="item"
                className={layerClassNames}
                // onClick={this._selectElement}
                onMouseLeave={this._onLayerMouseLeave}
                onMouseEnter={this._onLayerMouseEnter}
            >
                {layer_body}
                {children}
            </div>
        );
    }

    static contextTypes = {
        startRenamingLayer: React.PropTypes.func,
        dragStart: React.PropTypes.func,
        dragOver: React.PropTypes.func,
        dragEnd: React.PropTypes.func
    };
}



class LayersPanel extends Component {
    constructor() {
        super();
        this.state = {
            data: richApp.layersStore.state,

            renaming_layer: null,

            dragging_mode: false,
            dragging_inside: true,
            highlight_top: false,
            highlight_mode: 'none' //none / between / into
        };
        this.layer_ind = 0;
        this.flat_layers = [];

        this.SCROLL_STEP = 45;
        this.DEFAULT_SCROLL_HOVER_ZONE = 50;

    }

    @listenTo(richApp.layersStore)
    onChange() {
        // fixme Can only update a mounted or mounting component.
        // This usually means you called setState() on an unmounted component.
        // This is a no-op. Please check the code for the LayersPanel component.
        this.setState({ data: richApp.layersStore.state });
    }

    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if (!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        this.refs.panel.updateSizeClasses();
    }

    _onLock = item => {
        if (!item.props.selected) {
            item.props.element.locked(!item.props.element.locked());
            return;
        }
        if (!item.props.element.locked()) {
            Selection.lock();
        }
        else {
            Selection.unlock();
        }
    };

    _onHide = item => {
        if (!item.props.selected) {
            item.props.element.visible(!item.props.element.visible());
            return;
        }
        if (!item.props.element.visible()) {
            Selection.show();
        }
        else {
            Selection.hide();
        }
    };

    componentDidUpdate(props, state) {
        super.componentDidUpdate(props, state);
        var keys = Object.keys(this.state.data.selected);
        if (keys.length) {
            var e = this.refs["e" + keys[0]];
            if (e) {
                e._scrollIntoView();
            }
        }
    }

    componentDidMount(props, state) {
        super.componentDidMount(props, state);
        this.scrollPaneElement = ReactDOM.findDOMNode(this.refs['scroll_container'].refs['scrollPane']);
        this.scrollBoxElement = ReactDOM.findDOMNode(this.refs['scroll_container'].refs['scrollBox']);
        this.list_padding = parseInt($(ReactDOM.findDOMNode(this.refs['list'])).css('paddingTop'));
    }


    startRenamingLayer = (layer) => {
        this.setState({ renaming_layer: layer.props.uid });

        var ref = layer.refs.item;
        var el = ReactDOM.findDOMNode(ref);
        this.refs['popup'].openForTarget(el, { layer: layer.props, layer_name: layer.props.element.name() });
    };

    _cancelRenamingLayer = () => {
        this.refs['popup'].close();
    };

    _saveRenamingLayer = (layer, new_name) => {
        layer.element.setProps({name:new_name});
        this.refs['popup'].close();
    };

    _toggleDragMode = () => {
        this.setState({ dragging_mode: !this.state.dragging_mode });
    };

    _dragStart = () => {
        if (!this.state.dragging_mode)
            this.setState({ dragging_mode: true });
    };
    _dragEnd = () => {
        if (this.state.dragging_mode)
            this.setState({ dragging_mode: false });
    };

    dragOver = (layer, part, ev) => {
        if (!this.state.dragging_mode)
            return false;

        // Calculating highlight
        var highlight_top, highlight_mode;

        switch (part) {
            case 'top': highlight_mode = 'between-top'; break;
            case 'bottom': highlight_mode = 'between-bottom'; break;
            case 'mid': highlight_mode = 'into'; break;
            case 'none':
            case 'first':
            case 'last': highlight_mode = part; break;
            default: highlight_mode = 'none';
        }

        var box = this.scrollPaneElement;
        var box_rect = box.getBoundingClientRect();

        if (part === 'first') {
            highlight_top = 0 + this.list_padding;
        }
        else if (part === 'last') {
            highlight_top = this.scrollBoxElement.getBoundingClientRect().height - box.scrollTop + this.list_padding - this.list_padding;
        }
        else {
            //if it's in layer
            var el = ReactDOM.findDOMNode(layer.refs.item);
            var el_rect = el.getBoundingClientRect();
            highlight_top = el_rect.top - box_rect.top + this.list_padding; //var highlight_top = node_offset(el, box).top + this.props.shiftTop;
        }

        //setting highlight
        this.refs.highlight._setModeAndPosition(highlight_top, highlight_mode);


        // Checking if need to scroll
        var SCROLL_HOVER_ZONE = Math.min(this.DEFAULT_SCROLL_HOVER_ZONE, box_rect.height * .30);

        var mouse_from_top = ev.pageY - box_rect.top;
        var mouse_from_bottom = box_rect.height - mouse_from_top;

        var scroll_ratio = 1;

        if (mouse_from_bottom < SCROLL_HOVER_ZONE) {
            var left_to_scroll = box.scrollHeight - box_rect.height;
            if (box.scrollTop < left_to_scroll) {
                if (mouse_from_top < SCROLL_HOVER_ZONE / 3 && SCROLL_HOVER_ZONE > 10) {
                    scroll_ratio = 2; // if too close to the edge, but zone size >= 10
                }
                this._scrollDown(scroll_ratio);
            }
        }
        else if (mouse_from_top < SCROLL_HOVER_ZONE) {
            if (box.scrollTop > 0) {
                if (mouse_from_bottom < SCROLL_HOVER_ZONE / 3 && SCROLL_HOVER_ZONE > 10) {
                    scroll_ratio = 2;
                }
                this._scrollUp(scroll_ratio);
            }
        }
    };

    _scrollUp = (scroll_ratio = 1) => {
        this.scrollPaneElement.scrollBy(0, -this.SCROLL_STEP * scroll_ratio);
    };
    _scrollDown = (scroll_ratio = 1) => {
        this.scrollPaneElement.scrollBy(0, this.SCROLL_STEP * scroll_ratio);
    };

    _dragOutside = (ev) => {
        if (this.state.dragging_mode && this.state.dragging_inside == true) {
            this.setState({ dragging_inside: false });
        }
    };

    _dragInside = (ev) => {
        if (this.state.dragging_mode && this.state.dragging_inside == false) {
            this.setState({ dragging_inside: true });
        }
    };

    _renderBranch = (list_of_nodes, parent_is_selected) => {
        return list_of_nodes.map((layer) => this._renderLayer(layer, parent_is_selected));
    };

    _renderLayer = (layer, parent_is_selected) => {
        var children = null;
        var layer_is_selected = !!this.state.data.selected[layer.uid];
        var layer_is_collapsed = !this.state.data.expanded[layer.uid];

        var ind = this.layer_ind;
        this.flat_layers.push(layer);

        this.layer_ind++;

        if (layer.childLayers) {
            children = this._renderBranch(layer.childLayers, layer_is_selected || parent_is_selected)
        }

        return React.createElement(LayerItem, extend({}, layer, {
            key: "layer__" + layer.uid,
            ref: "e" + layer.uid,
            collapsed: layer_is_collapsed,
            selected: layer_is_selected,
            inheritedlySelected: parent_is_selected,
            dragging_mode: this.state.dragging_mode,
            layer_index: ind,
            onLock: this._onLock,
            onHide: this._onHide,
        }), children);

    };

    _renderAllLayers() {
        this.layer_ind = 0;
        this.flat_layers = [];
        // function also has side effects - rendering list of flat layers.
        var layers_list = this._renderBranch(this.state.data.layers);
        // this.layers_amount = layers_list.length;

        return layers_list;
    };


    render() {
        var layers_list = this._renderAllLayers();
        var we_are_dragging_several_layers = Selection.count() > 1;

        var list_modes = {
            dragging: this.state.dragging_mode,
            "not-dragging": !this.state.dragging_mode,

            "dragging-inside": this.state.dragging_inside && this.state.dragging_mode,
            "dragging-outside": !this.state.dragging_inside && this.state.dragging_mode,

            "dragging-multi": we_are_dragging_several_layers,
        };


        var rename_popup_spawner = (<FlyoutPopupSpawner
            ref="popup"
            position={{ disableAutoClose: true, targetHorizontal: 'left', targetVertical: 'top' }}
            drawContent={(content_props) =>
                <LayerRenamer
                    layer = {content_props.layer}
                    layer_name={content_props.layer_name}
                    save={this._saveRenamingLayer}
                    cancel={this._cancelRenamingLayer}
                />
            }
        />);

        return (
            <Panel {...this.props} ref="panel" header="Layers" id="layers-panel">
                <div className="layers-panel__layer-filters" onClick={this._toggleDragMode}></div>

                <div
                    className={bem("layers-panel", "layers-list", list_modes, "panel__stretcher")}
                    data-mode="airy"
                    onMouseLeave={this.state.dragging_mode ? this._dragOutside : null}
                    onMouseEnter={this.state.dragging_mode ? this._dragInside : null}
                    ref="list"
                >
                    {rename_popup_spawner}
                    <ScrollContainer
                        className="layers-panel__layers-container  thin dark vertical"
                        boxClassName="layers-panel__layers-box"
                        ref="scroll_container"
                    >
                        {layers_list}
                        <LayerItem first_placeholder={true} dragging_mode={this.state.dragging_mode} />
                        <LayerItem last_placeholder={true} dragging_mode={this.state.dragging_mode} />
                    </ScrollContainer>

                    {this.state.dragging_mode &&  //react renders with delay
                        <LayersHighlight ref="highlight" dragging_mode={this.state.dragging_mode} />}
                </div>
            </Panel>
        );
    }

    getChildContext() {
        return {
            dragStart: this._dragStart,
            dragOutside: this._dragOutside,
            dragInside: this._dragInside,
            dragOver: this.dragOver,
            dragEnd: this._dragEnd,
            startRenamingLayer: this.startRenamingLayer,
        };
    }

    static childContextTypes = {
        dragStart: React.PropTypes.func,
        dragOutside: React.PropTypes.func,
        dragInside: React.PropTypes.func,
        dragOver: React.PropTypes.func,
        dragEnd: React.PropTypes.func,
        startRenamingLayer: React.PropTypes.func,
    };
}

export default LayersPanel;
