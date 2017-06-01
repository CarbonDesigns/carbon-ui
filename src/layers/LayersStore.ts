import { Range, Map, List, fromJS, Record } from 'immutable';
import { handles, CarbonStore } from "../CarbonFlux";
import CarbonActions from "../CarbonActions";
import LayersActions from "./LayersActions";
import { app, NullPage, Environment, Brush, PrimitiveType, Types, RepeatContainer, ILayer, LayerTypes } from "carbon-core";
import { iconType } from "../utils/appUtils";

type IdMap = { [id: string]: boolean };

interface ILayersStoreState {
    layers: any[];
    expanded: IdMap;
    selected: IdMap;
    collapsed: IdMap,
    isIsolation: boolean;
    version: number;
}

export default class LayersStore extends CarbonStore<ILayersStoreState> {
    constructor(props) {
        super(props);
        this.state = { layers: [], expanded: {}, selected: {}, collapsed: {}, isIsolation: false, version: 0 }
    }

    refreshLayersTree() {
        let that = this;
        let page_elements;
        if (Environment.view.isolationLayer && Environment.view.isolationLayer.isActive) {
            page_elements = Environment.view.isolationLayer.children;
        }
        else {
            page_elements = app.activePage.children;
        }
        let r, page_element, layers2 = [];
        for (let i = page_elements.length - 1; i >= 0; --i) {
            page_element = page_elements[i];
            layers2.push(that.mapLayersTreeForItem(page_element, 0));
        }
        this.setState({ layers: layers2 });
    }

    /**
     *
     * @param page_element
     * @param indent
     * @returns {{indent: *, id: *, uid: *, element: *, name: *, borderColor: *, backgroundColor: *, visible: *, locked: *, canSelect: *, type: *, expanded: boolean, hasChildren: (boolean|*)}}
     */
    mapLayersTreeForItem(element, indent, nodeMutator = null) {
        let that = this;

        let elementId = element.id();
        let node: any = {
            indent: indent,
            id: elementId,
            uid: elementId,
            element: element,
            name: element.displayName(),
            borderColor: this._displayColor(element.stroke(), null),
            backgroundColor: this._displayColor(element.fill(), null),
            textColor: (element.props.font) ? element.props.font.color : null,
            visible: element.visible(),
            locked: element.locked(),
            canSelect: element.canSelect() || element.runtimeProps.selectFromLayersPanel,
            type: iconType(element),
            expanded: this.state.expanded[elementId],
            hasChildren: element.children && element.children.length
        };

        if (nodeMutator) {
            nodeMutator(node);
        }

        if (!node.hasChildren) {
            return node;
        }

        node.childLayers = [];

        if (element.t === Types.RepeatContainer && element.children.length) {
            let cell = element.children[0];
            for (let i = cell.children.length - 1; i >= 0; --i) {
                let r = that.mapLayersTreeForItem(cell.children[i], indent + 1, n => {
                    n.repeater = element;
                });
                node.childLayers.push(r);
            }
        }
        else if (element.children) {
            for (let i = element.children.length - 1; i >= 0; --i) {
                let r = that.mapLayersTreeForItem(element.children[i], indent + 1, nodeMutator);
                node.childLayers.push(r);
            }
        }

        return node;
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
        ) {
            let layers = this.state.layers;

            this._visitLayers(layers, (layer) => {
                if (layer.id === elementId) {
                    if (props.hasOwnProperty("name")) { layer.name = props.name; }
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
        this.refreshLayersTree();// TODO: check if we need to optimize it
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
        let that = this;
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
            that.refreshLayersTree();
            return;
        }

        for (let i = 0; i < propChanges.length; i++) {
            let p = propChanges[i];
            let elementId = p.path[p.path.length - 1];
            refreshState = that._updateProps(elementId, p.props) || refreshState;
        }

        if (refreshState) {
            this.setState({ version: (this.state.version || 0) + 1 });
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
