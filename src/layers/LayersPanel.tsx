import { CarbonLabel, StoreComponent, listenTo } from '../CarbonFlux';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import Panel from '../layout/Panel'
import { richApp } from '../RichApp';
import cx from 'classnames';
import VirtualList from "../shared/collections/VirtualList";
import LessVars from "../styles/LessVars";
import ScrollContainer from "../shared/ScrollContainer";
import { app, Invalidate, Selection, Environment, IArtboardPage, domUtil } from "carbon-core";
import { say } from "../shared/Utils";
import bem from "bem";
import FlyoutPopupSpawner from "../shared/FlyoutPopup";
import { MarkupLine } from "../shared/ui/Markup";
import LayerItem from "./LayersItem";
import LayerRenamer from "./LayersRenamer";
import layersStore, { LayerNode, LayersStoreState } from "./LayersStore";
import DragController from "./LayersDragController";

type VirtualLayersList = new (props) => VirtualList<LayerNode>;
const VirtualLayersList = VirtualList as VirtualLayersList;

//strange webpack bug, scroll container import is removed
let tmp = LessVars.flyoutMaxHeight;

// TODO: inherited visibility and lock style
function b(a, b?, c?) { return bem('layer', a, b, c) }

export default class LayersPanel extends StoreComponent<{}, LayersStoreState> {
    [x: string]: any;
    private dragController: DragController = new DragController();
    refs: {
        panel: Panel;
        list: VirtualList<LayerNode>;
    }

    constructor(props) {
        super(props, layersStore);
    }

    componentDidUpdate(props, state) {
        super.componentDidUpdate(props, state);
        var keys = Object.keys(this.state.selected);
        if (keys.length) {
            var e = this.refs["e" + keys[0]];
            if (e) {
                e._scrollIntoView();
            }
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.dragController.setup();
    }

    componentWillUnmout() {
        super.componentWillUnmount();
        this.dragController.dispose();
    }

    componentWillUpdate(nextProps, nextState: Readonly<LayersStoreState>) {
        if (nextState.selected !== this.state.selected || nextState.expanded !== this.state.expanded
            || nextState.version !== this.state.version || nextState.layers !== this.state.layers
        ) {
            this.refs.list.reset(true);
        }
    }

    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if (!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        this.refs.panel.updateSizeClasses();
    }

    _onLock = (node: LayerNode, selected: boolean) => {
        if (!selected) {
            node.element.locked(!node.element.locked());
            return;
        }
        if (!node.element.locked()) {
            Selection.lock();
        }
        else {
            Selection.unlock();
        }
    };

    _onHide = (node: LayerNode, selected: boolean) => {
        if (!selected) {
            node.element.visible(!node.element.visible());
            return;
        }
        if (!node.element.visible()) {
            Selection.show();
        }
        else {
            Selection.hide();
        }
    };

    startRenamingLayer = (layer) => {
        this.setState({ renaming_layer: layer.props.uid });

        var ref = layer.refs.item;
        var el = ReactDOM.findDOMNode(ref);
        this.refs['popup'].openForTarget(el, { layer: layer.props, layer_name: layer.props.element.name() });
    }

    _cancelRenamingLayer = () => {
        this.refs['popup'].close();
    }

    _saveRenamingLayer = (layer, new_name) => {
        layer.element.setProps({ name: new_name });
        this.refs['popup'].close();
    }

    private renderLayer = (layer: LayerNode, index: number) => {
        if (index === 0 || index === this.state.layers.length - 1) {
            return this.renderLayerPadding();
        }
        var children = null;
        var selected = !!this.state.selected[layer.id];
        var expanded = this.state.expanded[layer.id];

        var ancestorSelected = false;
        if (!selected) {
            let parent = layer.element.parent();
            while (parent) {
                if (this.state.selected[parent.id()]) {
                    ancestorSelected = true;
                    break;
                }
                parent = parent.parent();
            }
        }

        return <LayerItem layer={layer} index={index}
            selected={selected}
            expanded={expanded}
            ancestorSelected={ancestorSelected}
            dragController={this.dragController}
            onLock={this._onLock}
            onHide={this._onHide} />
    }
    /**
     * Renders a special padding element so that overlays between layers are not clipped in the beginning and in the end.
     */
    private renderLayerPadding = () => {
        return <div className="layer__padding"/>;
    }
    private getRowHeight = (node, index: number) => {
        if (index === 0 || index === this.state.layers.length - 1) {
            return LessVars.layerOverlayHeight/2;
        }
        return LessVars.layerItemHeight;
    }

    goBack = () => {
        (app.activePage as IArtboardPage).setActiveArtboard(null);
        var artboards = app.activePage.children;
        Environment.view.ensureScale(artboards);
        Environment.view.ensureVisible(artboards);
    }

    renderBackButton() {
        if (!app.activePage) {
            return null;
        }

        var artboard = app.activePage.getActiveArtboard();
        if (!artboard) {
            return null;
        }


        return <MarkupLine className="layers-back__button">
            <div onClick={this.goBack}><u>← <CarbonLabel id={artboard.name()} /></u></div>
        </MarkupLine>;
    }

    render() {
        var rename_popup_spawner = (<FlyoutPopupSpawner
            ref="popup"
            position={{ disableAutoClose: true, targetHorizontal: 'left', targetVertical: 'top' }}
            drawContent={(content_props) =>
                <LayerRenamer
                    layer={content_props.layer}
                    layer_name={content_props.layer_name}
                    save={this._saveRenamingLayer}
                    cancel={this._cancelRenamingLayer}
                />
            }
        />);


        return (
            <Panel ref="panel" header="Layers" id="layers_panel">
                <div className="layers-panel__layer-filters" onClick={this._toggleDragMode}></div>

                {this.renderBackButton()}

                <div className={bem("layers-panel", "layers-list", null, "panel__stretcher")} data-mode="airy">
                    {rename_popup_spawner}
                    <VirtualLayersList className="layers__container"
                        ref="list"
                        data={this.state.layers}
                        rowHeight={this.getRowHeight}
                        rowRenderer={this.renderLayer}
                        scrollToRow={this.state.scrollToLayer}/>
                </div>
            </Panel>
        );
    }
}