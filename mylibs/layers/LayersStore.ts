import {Range, Map, List, fromJS, Record} from 'immutable';
import {handles, CarbonStore} from "../CarbonFlux";
import CarbonActions from "../CarbonActions";
import LayersActions from "./LayersActions";
import { app, NullPage, Environment, Brush, PrimitiveType, Types, RepeatContainer, ILayer, LayerTypes } from "carbon-core";
import {iconType} from "../utils/appUtils";

type IdMap = {[id: string]: boolean};

interface ILayersStoreState {
    layers: any[];
    expanded: IdMap;
    selected: IdMap;
    collapsed: IdMap,
    isIsolation: boolean;
    version: number;
}

export default class LayersStore extends CarbonStore <ILayersStoreState> {
    constructor(props) {
        super(props);
        this.state = {layers:[], expanded:{}, selected:{}, collapsed:{}, isIsolation:false, version: 0}
    }

    refreshLayersTree(){
        var that = this;
        var page_elements;
        if(Environment.view.isolationLayer && Environment.view.isolationLayer.isActive) {
            page_elements = Environment.view.isolationLayer.children;
        }
        else {
            page_elements = app.activePage.children;
        }
        var r, page_element, layers2=[];
        for (var i = page_elements.length - 1; i >= 0; --i){
            page_element = page_elements[i];
            layers2.push( that.mapLayersTreeForItem(page_element, 0) );
        }
        this.setState({layers : layers2});
    }

    /**
     *
     * @param page_element
     * @param indent
     * @returns {{indent: *, id: *, uid: *, element: *, name: *, borderColor: *, backgroundColor: *, visible: *, locked: *, canSelect: *, type: *, expanded: boolean, hasChildren: (boolean|*)}}
     */
    mapLayersTreeForItem(element, indent, nodeMutator = null){
        var that = this;

        var elementId = element.id();
        var node:any = {
            indent          : indent,
            id              : elementId,
            uid             : elementId,
            element         : element,
            name            : element.displayName(),
            borderColor     : this._displayColor(element.stroke(), null),
            backgroundColor : this._displayColor(element.fill(), null),
            textColor       : (element.props.font != null)  ? element.props.font.color  : null,
            visible         : element.visible(),
            locked          : element.locked(),
            canSelect       : element.canSelect() || element.selectFromLayersPanel,
            type            : iconType(element),
            expanded        : this.state.expanded[elementId],
            hasChildren     : element.children && element.children.length
        };

        if (nodeMutator){
            nodeMutator(node);
        }

        if ( !node.hasChildren){
            return node;
        }

        node.childLayers = [];

        if (element.t === Types.RepeatContainer && element.children.length){
            var cell = element.children[0];
            for (var i = cell.children.length - 1; i >= 0; --i){
                var r = that.mapLayersTreeForItem(cell.children[i], indent + 1, n => {
                    n.repeater = element;
                });
                node.childLayers.push(r);
            }
        }
        else if (element.children) {
            for (var i = element.children.length - 1; i >= 0; --i){
                var r = that.mapLayersTreeForItem(element.children[i], indent + 1, nodeMutator);
                node.childLayers.push(r);
            }
        }
        return node;
    }

    _displayColor(brush, defaultColor) {
        if (brush) {
            var style = Brush.toCss(brush);
            if (style.backgroundColor) {
                return style.backgroundColor;
            }
        }

        return defaultColor;
    }

    _visitLayers(layers, callback){
        for (var i = 0; i < layers.length; ++i){
            var layer = layers[i];
            if (callback(layer) === false) {
                return false;
            }
            if (layer.childLayers){
                if (this._visitLayers(layer.childLayers, callback) === false){
                    return false;
                }
            }
        }
    }

    _updateProps(elementId, props) {
        var result = false;

        if (props.name    != null
         || props.locked  != null
         || props.visible != null
         || props.stroke  != null
         || props.fill    != null
        ) {
            var layers = this.state.layers;

            this._visitLayers(layers, (layer)=>{
                if (layer.id === elementId) {
                    if (props.name    != null)  layer.name = props.name;
                    if (props.stroke  != null)  layer.borderColor = this._displayColor(props.stroke, 'black');
                    if (props.fill    != null)  layer.backgroundColor = this._displayColor(props.fill, 'white');
                    if (props.visible != null)  layer.visible = props.visible;
                    if (props.locked  != null)  layer.locked = props.locked;
                    result = true;
                    return false;
                }
            })
        }
        return result;
    }

    @handles(LayersActions.toggleExpand)
    onToggleExpand({elementId}){
        var expanded = this.state.expanded;

        if (expanded[elementId]) {
            delete expanded[elementId];
        }
        else {
            expanded[elementId] = true;
        }

        this.setState({expanded});
        this.refreshLayersTree();// TODO: check if we need to optimize it
    }

    static uidForItem(item){
        return item.id();
    }

    @handles(CarbonActions.elementSelected)
    onElementSelected({selection}){
        var selected = {};
        var expanded = this.state.expanded;
        var needsRefresh = false;
        selection.each(item=>{
            var element = item;
            var repeater = RepeatContainer.tryFindRepeaterParent(element);
            if (repeater){
                element = repeater.findMasterCounterpart(element);
            }
            selected[LayersStore.uidForItem(element)] = true;

            var current = element.parent();
            while (current){
                if (!expanded.hasOwnProperty(current.id())){
                    needsRefresh = true;
                }
                expanded[current.id()] = true;
                current = current.parent();
            }
        });

        this.setState({selected, expanded});
        if (needsRefresh){
            this.refreshLayersTree();
        }
    }

    @handles(CarbonActions.appChanged)
    onAppChanged({primitives}){
        var that = this;
        var activePageId = app.activePage.id();
        var refreshState = false;

        var propChanges = [];
        var hasTreeChanges = false;

        for (let i = 0; i < primitives.length; i++){
            var primitive = primitives[i];
            if (primitive.path[0] === activePageId){
                if (primitive.type === PrimitiveType.DataNodeAdd
                    || primitive.type === PrimitiveType.DataNodeChange
                    || primitive.type === PrimitiveType.DataNodeRemove
                    || primitive.type === PrimitiveType.DataNodeChangePosition){
                    hasTreeChanges = true;
                    break;
                }
                else if (primitive.type === PrimitiveType.DataNodeSetProps){
                    propChanges.push(primitive);
                }
            }
        }

        if(hasTreeChanges) {
            that.refreshLayersTree();
            return;
        }

        for (let i = 0; i < propChanges.length; i++){
            var p = propChanges[i];
            var elementId = p.path[p.path.length - 1];
            refreshState = that._updateProps(elementId, p.props) || refreshState;
        }

        if(refreshState) {
            this.setState({version:(this.state.version||0)+1});
        }
    }


    @handles(CarbonActions.loaded)
    onLoaded() {
        this.refreshLayersTree();
    }

    @handles(CarbonActions.pageChanged)
    onPageChnaged({newPage}){
        if(!app || newPage === NullPage) {
            this.setState({layers:[], expanded:{}});
            return;
        }
        this.setState({expanded:{}});
        this.refreshLayersTree();
    }

    @handles(CarbonActions.activeLayerChanged)
    onActiveLayerChanged({layer}){
        var l = layer as ILayer;
        if (l.type === LayerTypes.Isolation){
            this.setState({isIsolation: true});
            this.refreshLayersTree();
        }
        else if (this.state.isIsolation) {
            this.setState({isIsolation: false});
            this.refreshLayersTree();
        }
    }
}
