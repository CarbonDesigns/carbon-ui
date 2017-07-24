import { Range, Map, List, fromJS, Record } from 'immutable';
import { handles, CarbonStore } from "../CarbonFlux";
import CarbonActions from "../CarbonActions";
import LayersActions from "./LayersActions";
import { app, NullPage, Environment, Brush, PrimitiveType, Types, RepeatContainer, ILayer, LayerTypes, IUIElement, IRepeatContainer } from "carbon-core";
import { iconType } from "../utils/appUtils";

type IdMap = { [id: string]: boolean };

export type LayerNode = {
    indent: number;
    id: string;
    element: IUIElement;
    name: string;
    borderColor: string;
    backgroundColor: string;
    textColor: string;
    visible: boolean;
    locked: boolean;
    canSelect: boolean;
    type: string;
    hasChildren: boolean;
    repeater?: IRepeatContainer;
}

export type LayersStoreState = {
    layers: LayerNode[];
    expanded: IdMap;
    selected: IdMap;
    collapsed: IdMap,
    isIsolation: boolean;
    version: number;
    topLevel?: boolean;
}

class LayersStore extends CarbonStore<LayersStoreState> {
    constructor() {
        super();
        this.state = { layers: [], expanded: {}, selected: {}, collapsed: {}, isIsolation: false, version: 0, topLevel:true }
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
            } else {
                topLevel = true;
                elements = app.activePage.children;
            }
        }

        //first and last elements are paddings for virtual list, need to handle it better
        let layers = [null];
        for (let i = elements.length - 1; i >= 0; --i) {
            this.addLayerToList(layers, expandedMap, elements[i], 0, !topLevel);
        }
        layers.push(null);

        this.setState({ layers: layers });
    }

    addLayerToList(layers: LayerNode[], expandedMap: IdMap, element, indent, recursive = true, nodeMutator = null) {
        let elementId = element.id();
        let node: LayerNode = {
            indent: indent,
            id: elementId,
            element: element,
            name: element.displayName(),
            borderColor: this._displayColor(element.stroke(), null),
            backgroundColor: this._displayColor(element.fill(), null),
            textColor: (element.props.font) ? element.props.font.color : null,
            visible: element.visible(),
            locked: element.locked(),
            canSelect: element.canSelect() || element.runtimeProps.selectFromLayersPanel,
            type: iconType(element),
            hasChildren: element.children && element.children.length && recursive
        };

        if (nodeMutator) {
            nodeMutator(node);
        }

        layers.push(node);
        if (!node.hasChildren) {
            return;
        }

        if (element.t === Types.RepeatContainer && element.children.length) {
            let cell = element.children[0];
            for (let i = cell.children.length - 1; i >= 0; --i) {
                let r = this.addLayerToList(layers, expandedMap, cell.children[i], indent + 1, true, n => {
                    n.repeater = element;
                });
            }
        }
        else if (element.children && expandedMap[node.id]) {
            for (let i = element.children.length - 1; i >= 0; --i) {
                this.addLayerToList(layers, expandedMap, element.children[i], indent + 1, true, nodeMutator);
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

    _visitLayers(layers, callback) {
        for (let i = 0; i < layers.length; ++i) {
            let layer = layers[i];
            if (callback(layer) === false) {
                return false;
            }
            if (layer.childLayers) {
                if (this._visitLayers(layer.childLayers, callback) === false) {
                    return false;
                }
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

            this._visitLayers(layers, (layer) => {
                if (layer.id === elementId) {
                    if (props.hasOwnProperty("name") || props.hasOwnProperty("flags")) { layer.name = layer.element.displayName(); }
                    if (props.hasOwnProperty("stroke")) { layer.borderColor = this._displayColor(props.stroke, 'black'); }
                    if (props.hasOwnProperty("fill")) { layer.backgroundColor = this._displayColor(props.fill, 'white'); }
                    if (props.hasOwnProperty("visible")) { layer.visible = props.visible; }
                    if (props.hasOwnProperty("locked")) { layer.locked = props.locked; }
                    result = true;

                    return false;
                }
            })
        }

        return result;
    }

    @handles(LayersActions.toggleExpand)
    onToggleExpand({ elementId }) {
        let expanded = this.state.expanded;

        if (expanded[elementId]) {
            delete expanded[elementId];
        }
        else {
            expanded[elementId] = true;
        }

        this.setState({ expanded });
        this.refreshLayersTree(expanded);// TODO: check if we need to optimize it
    }

    static uidForItem(item) {
        return item.id();
    }

    @handles(CarbonActions.elementSelected)
    onElementSelected({ selection }) {
        let selected = {};
        let expanded = this.state.expanded;
        let needsRefresh = false;
        selection.each(item => {
            let element = item;
            let repeater = RepeatContainer.tryFindRepeaterParent(element);
            if (repeater) {
                element = repeater.findMasterCounterpart(element);
            }
            selected[LayersStore.uidForItem(element)] = true;

            let current = element.parent();
            while (current) {
                if (!expanded.hasOwnProperty(current.id())) {
                    needsRefresh = true;
                }
                expanded[current.id()] = true;
                current = current.parent();
            }
        });

        this.setState({ selected, expanded });
        if (needsRefresh) {
            this.refreshLayersTree();
        }
    }

    @handles(CarbonActions.appChanged)
    onAppChanged({ primitives }) {
        let activePageId = app.activePage.id();
        let refreshState = false;

        let propChanges = [];
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
            refreshState = this._updateProps(elementId, p.props);
            if (refreshState) {
                break;
            }
        }

        if (refreshState) {
            this.setState({ version: this.state.version + 1 });
        }
    }


    @handles(CarbonActions.loaded)
    onLoaded() {
        this.refreshLayersTree();
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
        this.refreshLayersTree();
    }

    @handles(CarbonActions.activeLayerChanged)
    onActiveLayerChanged({ layer }) {
        let l = layer as ILayer;
        if (l.type === LayerTypes.Isolation) {
            this.setState({ isIsolation: true });
            this.refreshLayersTree();
        }
        else if (this.state.isIsolation) {
            this.setState({ isIsolation: false });
            this.refreshLayersTree();
        }
    }
}

export default new LayersStore();