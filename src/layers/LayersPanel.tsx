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
import LayerItem from "./LayerItem";
import layersStore, { LayerNode, LayersStoreState } from "./LayersStore";
import dragController from "./LayersDragController";

type VirtualLayersList = new (props) => VirtualList<LayerNode>;
const VirtualLayersList = VirtualList as VirtualLayersList;

// TODO: inherited visibility and lock style
function b(a, b?, c?) { return bem('layer', a, b, c) }

export default class LayersPanel extends StoreComponent<{}, LayersStoreState> {
    refs: {
        panel: Panel;
        list: VirtualList<LayerNode>;
    }

    constructor(props) {
        super(props, layersStore);
    }

    componentDidMount() {
        super.componentDidMount();
        dragController.attach();
    }

    componentWillUnmout() {
        super.componentWillUnmount();
        dragController.detach();
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

    private onLock = (node: LayerNode, selected: boolean) => {
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

    private onHide = (node: LayerNode, selected: boolean) => {
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

    private renderLayer = (layer: LayerNode, index: number) => {
        if (index === 0 || index === this.state.layers.length - 1) {
            return this.renderLayerPadding();
        }
        var children = null;
        var selected = !!this.state.selected[layer.id];
        var expanded = this.state.expanded[layer.id];

        return <LayerItem layer={layer} index={index} version={layer.version}
            selected={selected}
            expanded={expanded}
            ancestorSelected={layersStore.isAncestorSelected(layer)}
            onLock={this.onLock}
            onHide={this.onHide} />
    }
    /**
     * Renders a special padding element so that overlays between layers are not clipped in the beginning and in the end.
     */
    private renderLayerPadding = () => {
        return <div className="layer__padding" />;
    }
    private getRowHeight = (node, index: number) => {
        if (index === 0 || index === this.state.layers.length - 1) {
            return LessVars.layerOverlayHeight / 2;
        }
        return LessVars.layerItemHeight;
    }

    goBack = () => {
        (app.activePage as IArtboardPage).setActiveArtboard(null);
        var artboards = app.activePage.children;
        Environment.view.ensureScale(artboards);
        Environment.view.ensureVisible(artboards);
    }

    private renderBackButton() {
        if (!app.activePage) {
            return null;
        }

        var artboard = app.activePage.getActiveArtboard();
        if (!artboard) {
            return null;
        }

        return <MarkupLine className="layers-back__button">
            <div onClick={this.goBack}><u>← {artboard.name()} </u></div>
        </MarkupLine>;
    }

    render() {
        return <Panel ref="panel" header="Layers" id="layers_panel">
            {this.renderBackButton()}

            <div className={bem("layers-panel", "layers-list", null, "panel__stretcher")} data-mode="airy">
                <VirtualLayersList className="layers__container"
                    ref="list"
                    data={this.state.layers}
                    rowHeight={this.getRowHeight}
                    rowRenderer={this.renderLayer}
                    scrollToRow={this.state.scrollToLayer} />
            </div>
        </Panel>;
    }
}