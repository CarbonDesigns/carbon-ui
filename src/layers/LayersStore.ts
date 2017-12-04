import { Range, Map, List, fromJS, Record } from 'immutable';
import { handles, CarbonStore } from "../CarbonFlux";
import CarbonActions, { CarbonAction } from "../CarbonActions";
import LayersActions, { LayerAction } from "./LayersActions";
import { app, NullPage, Environment, Brush, PrimitiveType, Types, RepeatContainer, ILayer, LayerType, IUIElement, IRepeatContainer, RepeatCell, Primitive, SetPropsPrimitive } from "carbon-core";
import { iconType } from "../utils/appUtils";

type IdMap = { [id: string]: boolean };

export type LayerNode = {
    indent: number;
    id: string;
    element: IUIElement;
    canSelect: boolean;
    type: string;
    hasChildren: boolean;
    repeater?: IRepeatContainer;
    //consider changing to immutable instead of updating layer properties
    version: 0;
}

export type LayersStoreState = {
    layers: LayerNode[];
    expanded: IdMap;
    selected: IdMap;
    isIsolation: boolean;
    version: number;
    scrollToLayer?: number;
}

class LayersStore extends CarbonStore<LayersStoreState> {
    constructor() {
        super();
        this.state = { layers: [], expanded: {}, selected: {}, isIsolation: false, version: 0  }
    }

    refreshLayersTree(expandedMap: IdMap = this.state.expanded) {
        let elements;
        var topLevel = false;
        if (Environment.view.isolationLayer && Environment.view.isolationLayer.isActive) {
            elements = Environment.view.isolationLayer.children;
        }
        else {
            let artboard = app.activePage.getActiveArtboard();
            if (artboard) {
                elements = artboard.children;
            }
            else {
                elements = app.activePage.children;
            }
        }

        //first and last elements are paddings for virtual list, need to handle it better
        let layers = [null];
        for (let i = elements.length - 1; i >= 0; --i) {
            this.addLayerToList(layers, expandedMap, elements[i], 0);
        }
        layers.push(null);

        this.setState({ layers: layers });
    }

    addLayerToList(layers: LayerNode[], expandedMap: IdMap, element, indent, nodeMutator = null) {
        let elementId = element.id;
        let node: LayerNode = {
            indent: indent,
            id: elementId,
            element: element,
            canSelect: element.canSelect() || element.runtimeProps.selectFromLayersPanel,
            type: iconType(element),
            hasChildren: element.children && element.children.length,
            version: 0
        };

        if (nodeMutator) {
            nodeMutator(node);
        }

        layers.push(node);
        if (!node.hasChildren) {
            return;
        }

        if (element.t === Types.RepeatContainer && element.children.length && expandedMap[node.id]) {
            let cell = (element as IRepeatContainer).activeCell();
            for (let i = cell.children.length - 1; i >= 0; --i) {
                this.addLayerToList(layers, expandedMap, cell.children[i], indent + 1, n => {
                    n.repeater = element;
                });
            }
        }
        else if (element.children && expandedMap[node.id]) {
            for (let i = element.children.length - 1; i >= 0; --i) {
                this.addLayerToList(layers, expandedMap, element.children[i], indent + 1, nodeMutator);
            }
        }
    }

    _displayColor(brush, defaultColor) {
        if (brush) {
            let style = Brush.toCss(brush);
            if (style.backgroundColor) {
                return style.backgroundColor;
            }
        }

        return defaultColor;
    }

    _visitLayers(layers, callback: (node: LayerNode) => boolean | void) {
        for (let i = 0; i < layers.length; ++i) {
            let layer = layers[i];
            if (!layer) {
                continue;
            }
            if (callback(layer) === false) {
                return false;
            }
        }
    }

    _updateProps(elementId, props) {
        let result = false;

        if (props.hasOwnProperty("name")
            || props.hasOwnProperty("locked")
            || props.hasOwnProperty("visible")
            || props.hasOwnProperty("stroke")
            || props.hasOwnProperty("fill")
            || props.hasOwnProperty("flags")
        ) {
            let layers = this.state.layers;

            this._visitLayers(layers, (layer: LayerNode) => {
                if (layer.id === elementId) {
                    layer.version += 1;
                    result = true;

                    return false;
                }
            })
        }

        return result;
    }

    onAction(action: LayerAction | CarbonAction) {
        super.onAction(action);

        switch (action.type) {
            case "Carbon_Selection":
                this.onElementSelected(action.composite);
                return;
            case "Carbon_AppChanged":
                this.onAppChanged(action.primitives);
                return;
            case "Carbon_AppUpdated":
                this.refreshLayersTree();
                return;
            case "Layers_toggleExpand":
                this.onToggleExpand(action.index);
                return;
            case "Layers_dropped":
                //disable auto scrolling since layer could have been moved to a different page
                this.setState({ scrollToLayer: undefined });
                if (!this.state.expanded[action.targetId]) {
                    this.onToggleExpand(action.targetIndex);
                }
                return;
        }
    }

    onToggleExpand(index: number) {
        let node = this.state.layers[index];
        let elementId = node.id;
        let expanded = this.state.expanded;

        if (expanded[elementId]) {
            delete expanded[elementId];
        }
        else {
            expanded[elementId] = true;
        }

        this.setState({ expanded, scrollToLayer: undefined });
        this.refreshLayersTree(expanded);// TODO: check if we need to optimize it
    }

    onElementSelected(selection) {
        let selected = {};
        let expanded = this.state.expanded;
        let needsRefresh = false;
        selection.each(item => {
            let element = item;
            let repeater = RepeatContainer.tryFindRepeaterParent(element);
            if (repeater && this.state.layers.findIndex(x => x && x.element === element) === -1) {
                needsRefresh = true;
            }
            selected[element.id] = true;

            let current = element.parent;
            while (current) {
                if (!expanded.hasOwnProperty(current.id)) {
                    needsRefresh = true;
                }
                expanded[current.id] = true;
                current = current.parent;
            }
        });

        if (needsRefresh) {
            this.refreshLayersTree();
        }

        let scrollToLayer;
        if (selection.elements.length) {
            scrollToLayer = this.state.layers.findIndex(x => x && x.element === selection.elements[0]);
        }

        this.setState({ selected, expanded, scrollToLayer });
    }

    onAppChanged(primitives: Primitive[]) {
        let activePageId = app.activePage.id;
        let refreshState = false;

        let propChanges: SetPropsPrimitive[] = [];
        let hasTreeChanges = false;

        for (let i = 0; i < primitives.length; i++) {
            let primitive = primitives[i];
            if (primitive.path[0] === activePageId) {
                if (primitive.type === PrimitiveType.DataNodeAdd
                    || primitive.type === PrimitiveType.DataNodeChange
                    || primitive.type === PrimitiveType.DataNodeRemove
                    || primitive.type === PrimitiveType.DataNodeChangePosition) {
                    hasTreeChanges = true;
                    break;
                }
                else if (primitive.type === PrimitiveType.DataNodeSetProps) {
                    propChanges.push(primitive);
                }
            }
        }

        if (hasTreeChanges) {
            this.refreshLayersTree();
            return;
        }

        for (let i = 0; i < propChanges.length; i++) {
            let p = propChanges[i];
            let elementId = p.path[p.path.length - 1];
            refreshState = this._updateProps(elementId, p.props) || refreshState;
        }

        if (refreshState) {
            this.setState({ version: this.state.version + 1 });
        }
    }

    @handles(CarbonActions.pageChanged)
    onPageChnaged({ newPage }) {
        if (!app || newPage === NullPage) {
            this.setState({ layers: [], expanded: {} });
            return;
        }
        this.setState({ expanded: {} });
        this.refreshLayersTree();
    }

    @handles(CarbonActions.activeArtboardChanged)
    onActiveArtboardChanged({ newArtboard }) {
        let expandedMap = {};
        this.setState({ expanded: expandedMap });
        this.refreshLayersTree(expandedMap);
    }

    @handles(CarbonActions.activeLayerChanged)
    onActiveLayerChanged({ layer }) {
        let l = layer as ILayer;
        if (l.type === LayerType.Isolation) {
            this.setState({ isIsolation: true });
            this.refreshLayersTree();
        }
        else if (this.state.isIsolation) {
            this.setState({ isIsolation: false });
            this.refreshLayersTree();
        }
    }

    getLayerNodeFromEvent(event: React.MouseEvent<HTMLElement>) {
        let targetLayer = event.currentTarget;
        let layerIndex = parseInt(targetLayer.dataset.index);
        return this.state.layers[layerIndex];
    }

    isAncestorSelected(layer: LayerNode) {
        var selected = !!this.state.selected[layer.id];

        if (!selected) {
            let parent = layer.element.parent;
            while (parent) {
                if (this.state.selected[parent.id]) {
                    return true;
                }
                parent = parent.parent;
            }
        }

        return false;
    }
}

export default new LayersStore();