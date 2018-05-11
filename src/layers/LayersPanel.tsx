import { CarbonLabel, StoreComponent, listenTo, dispatch } from '../CarbonFlux';
import * as React from "react";
import * as ReactDom from "react-dom";
import * as PropTypes from "prop-types";
import Panel from '../layout/Panel'
import { richApp } from '../RichApp';
import * as cx from "classnames";
import VirtualList from "../shared/collections/VirtualList";
import LessVars from "../styles/LessVars";
import ScrollContainer from "../shared/ScrollContainer";
import { app, Invalidate, Selection, Environment, IArtboardPage, LayerType, IIsolationLayer, IsolationContext } from "carbon-core";
import { say } from "../shared/Utils";
import { MarkupLine } from "../shared/ui/Markup";
import LayerItem from "./LayerItem";
import layersStore, { LayerNode, LayersStoreState } from "./LayersStore";
import dragController from "./LayersDragController";
import BackButton from "../shared/ui/BackButton";
import icons from "../theme-icons";
import styled, {css} from "styled-components";
import theme from '../theme';
import CarbonActions from '../CarbonActions';

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
        } else {
            if (!node.element.useInCode) {
                Selection.useInCode(true);
            }
            else {
                Selection.useInCode(false);
            }
        }
        dispatch({ type: "Carbon_Selection", composite: Selection.selectComposite() })
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
            useInCode={layer.element.useInCode}
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
        let isolationLayer = IsolationContext.isolationLayer as IIsolationLayer;
        if (isolationLayer && isolationLayer.isActive) {
            app.actionManager.invoke("cancel");
        }
        else {
            Selection.clearSelection();
            (app.activePage as IArtboardPage).setActiveArtboard(null);
            var artboards = app.activePage.children;
            app.actionManager.invoke("ensureScaleAndCentered", artboards);
        }
    }

    private renderBackButton() {
        if (!app.activePage) {
            return null;
        }

        let name = "";

        var isolationLayer = IsolationContext.isolationLayer as IIsolationLayer;

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

const overlay_height = 2;
const overlay_border = 1;

const layer_overlay = css`
    content: " ";
    display: block;
    border: ${overlay_border}px solid ${theme.accent};
    position: absolute;
    left: 0;
    height:${overlay_height}px;
    right: 0;
    z-index: 10;
`;

const PanelContent = styled.div`
    flex: auto;
    display: flex;

    & .layers__container_moving {
        &.single {
            /* .c-layer_drag_single(); */
        }
        &.single.into {
            /* .c-layer_drag_single_into(); */
        }
        &.multi {
            /* .c-layer_drag_multi(); */
        }
        &.multi.into {
            /* .c-layer_drag_multi_into(); */
        }

        .layer {
            &__dropAbove:after {
                ${layer_overlay};
                top: -${overlay_height/2}px;
            }
            &__dropBelow:before {
                ${layer_overlay};
                bottom: -${overlay_height/2}px;
            }
            &__dropInside {
                ${layer_overlay};
                outline: red ${overlay_border}px solid;
                outline-offset: -1px;
            }
        }

        .layer.selected {
            background: ${theme.layer_page_background};
        }

        .layer.selected{
            opacity:0.4;
        }
    }
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