import { CarbonLabel, StoreComponent, listenTo } from '../CarbonFlux';
import * as React from "react";
import * as ReactDom from "react-dom";
import * as PropTypes from "prop-types";
import Panel from '../layout/Panel'
import { richApp } from '../RichApp';
import * as cx from "classnames";
import VirtualList from "../shared/collections/VirtualList";
import LessVars from "../styles/LessVars";
import ScrollContainer from "../shared/ScrollContainer";
import { app, Invalidate, Selection, Environment, IArtboardPage, LayerType, IIsolationLayer } from "carbon-core";
import { say } from "../shared/Utils";
import { MarkupLine } from "../shared/ui/Markup";
import LayerItem from "./LayerItem";
import layersStore, { LayerNode, LayersStoreState } from "./LayersStore";
import dragController from "./LayersDragController";
import BackButton from "../shared/ui/BackButton";
import icons from "../theme-icons";
import styled from "styled-components";
import theme from '../theme';

type VirtualLayersList = new (props) => VirtualList<LayerNode>;
const VirtualLayersList = VirtualList as VirtualLayersList;


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

    private onCode = (node: LayerNode, selected: boolean) => {
        if (!selected) {
            node.element.useInCode = !node.element.useInCode;
            return;
        }
        if (!node.element.useInCode) {
            Selection.useInCode(true);
        }
        else {
            Selection.useInCode(false);
        }
    };

    private onHide = (node: LayerNode, selected: boolean) => {
        if (!selected) {
            node.element.visible = (!node.element.visible);
            return;
        }
        if (!node.element.visible) {
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
            onCode={this.onCode}
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
        let isolationLayer = Environment.view.getLayer(LayerType.Isolation) as IIsolationLayer;
        if (isolationLayer.isActive) {
            app.actionManager.invoke("cancel");
        }
        else {
            Selection.clearSelection();
            (app.activePage as IArtboardPage).setActiveArtboard(null);
            var artboards = app.activePage.children;
            Environment.view.ensureScale(artboards);
            Environment.view.ensureCentered(artboards);
        }
    }

    private renderBackButton() {
        if (!app.activePage) {
            return null;
        }

        let name = "";

        var isolationLayer: any = null;

        if (Environment.view) {
            isolationLayer = Environment.view.getLayer(LayerType.Isolation) as IIsolationLayer;
        }

        if (isolationLayer && isolationLayer.isActive) {
            name = isolationLayer.getOwner().name;
        } else {
            var artboard = app.activePage.getActiveArtboard();
            if (artboard) {
                name = artboard.name;
            } else {
                return;
            }
        }

        return <PageHeaderContainer>
            <BackButton onClick={this.goBack} caption={name} translate={false} />
        </PageHeaderContainer>;
    }

    render() {
        let { children, ...rest } = this.props;
        return <Panel ref="panel" header="Layers" icon={icons.p_layers} id="layers_panel" {...rest}>
            {this.renderBackButton()}

            <PanelContent>
                <VirtualLayersList className="layers__container"
                    ref="list"
                    data={this.state.layers}
                    rowHeight={this.getRowHeight}
                    rowRenderer={this.renderLayer}
                    scrollToRow={this.state.scrollToLayer}
                    useTranslate3d={true} />
            </PanelContent>
        </Panel>;
    }
}

const PanelContent = styled.div`
    flex: auto;
    display: flex;
`;

const PageHeaderContainer = styled.div`
    height:29px;
    background-color: ${theme.layer_page_background};
    color: ${theme.text_color};
    font: ${theme.default_font};
    display:flex;
    align-items:center;
    padding-left: 16px;
`;