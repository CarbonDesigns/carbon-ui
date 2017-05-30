import {handles, CarbonStore, dispatch} from "../CarbonFlux";
import Immutable from "immutable";
import CarbonActions from "../CarbonActions";
import PropertyActions from "./PropertyActions";

import {PropertyTracker, app, NullPage, Selection, CompositeElement, PropertyMetadata, ChangeMode} from "carbon-core";

interface IPropertyStoreState {
    groups?: Immutable.List<any>;
    initialized?:boolean;
    nameProperty?:any;
    lockedProperty?:any;
    valueMap?:object;
    visibilityMap: {[name: string]: boolean};
    descriptorMap?:object;
    pathMap?:object;
    selection?:any;
    origValues?:any[] | null;
}

class PropertyStore extends CarbonStore<IPropertyStoreState> {
    constructor(dispatcher){
        super(dispatcher);
        this.state={
            groups: Immutable.List(),
            initialized:false,
            nameProperty: null,
            lockedProperty: null,
            valueMap: {},
            visibilityMap: {},
            descriptorMap: {},
            pathMap: {},
            selection: null
        };
    }

    private app:any;
    private _emptySelection:any;
    private _timerId:any;

    hasProperty(propertyName){
        var exists = this.state.valueMap.hasOwnProperty(propertyName);
        if (exists && this.state.visibilityMap[propertyName] === false){
            exists = false;
        }
        return exists;
    }

    getPropertyValue(propertyName){
        return this.state.valueMap[propertyName];
    }

    @handles(CarbonActions.loaded)
    onLoaded({app}){
        this.app = app;
        this._initEmptySelection(app.activePage.getActiveArtboard());
        PropertyTracker.propertyChanged.bind(this, this._onPropsChanged);
        this.onElementSelected({selection: this._emptySelection});
    }

    @handles(CarbonActions.pageChanged)
    onPageChanged({newPage}){
        if (!(newPage === NullPage)){
            this._initEmptySelection(newPage.getActiveArtboard());
            this.onElementSelected({selection: this._emptySelection});
        }
    }

    @handles(CarbonActions.activeArtboardChanged)
    onActiveArtboardChanged({newArtboard}){
        this._initEmptySelection(newArtboard);

        //two events can happen one after another - artboard changed and new selection made on the new artboard
        //to avoid updating the panel twice, using a timeout
        this._timerId = setTimeout(() => dispatch(CarbonActions.elementSelected(this._emptySelection)), 50);
    }

    @handles(CarbonActions.elementSelected)
    onElementSelected({selection}){
        if (this._timerId){
            clearTimeout(this._timerId);
            this._timerId = 0;
        }

        if (selection.count() === 0){
            selection = this._emptySelection;
        }

        var groups = selection.createPropertyGroups();

        var newState:IPropertyStoreState = {selection: selection, initialized:true, descriptorMap: {}, valueMap: {}, pathMap: {}, visibilityMap: {}};
        newState.nameProperty = this._createPropertyMetadata(newState, "name");
        newState.lockedProperty = this._createPropertyMetadata(newState, "locked");
        this._setGroups(newState, groups);
        newState.groups = this._updateVisibility(newState);

        this.setState(newState);
    }

    @handles(PropertyActions.changed)
    onChanged({changes}){
        this.state.selection.updateDisplayProps(changes);
    }

    @handles(PropertyActions.patched)
    onPatched({changeType, propertyName, value}){
        for (var i = 0; i < this.state.selection.elements.length; i++){
            var element = this.state.selection.elements[i];
            //element.props might be changed by preview, but the command should have original values as oldProps
            if(this.state.origValues && this.state.origValues.length) {
                var origProps = this.state.origValues[i];
                Object.assign(element.props, origProps);
            }
            element.patchProps(changeType, propertyName, value, ChangeMode.Model);
        }
        this.state.origValues = [];
    }

    @handles(PropertyActions.cancelEdit)
    onCancelEdit(){
        for (var i = 0; i < this.state.selection.elements.length; i++){
            var element = this.state.selection.elements[i];
            if(this.state.origValues.length) {
                var origProps = this.state.origValues[i];
                Object.assign(element.props, origProps);
                element.invalidate();
            }
        }
        this.state.origValues = [];
    }

    @handles(PropertyActions.previewPatch)
    previewPatchProperty({changeType, propertyName, value}){
        var count = this.state.selection.count();
        for (var i = 0; i < count; i++){
            var element = this.state.selection.elementAt(i);
            if (!this.state.origValues[i]){
                this.state.origValues[i] = {[propertyName]:element.props[propertyName]};
            }

            element.patchProps(changeType, propertyName, value, ChangeMode.Root);
        }
    }

    @handles(PropertyActions.changedExternally)
    onChangedExternally({changes}){
        this._updateState(changes);
    }

    @handles(PropertyActions.preview)
    previewProperty({changes}){
        this.state.selection.previewDisplayProps(changes);
    }

    _onPropsChanged(element, newProps){
        if (element === this.state.selection){
            var dispatcher = this.getDispatcher();
            if (dispatcher.isDispatching()){
                this._updateState(newProps);
            }
            else{
                dispatch(PropertyActions.changedExternally(newProps))
            }
        }
    }

    _updateState(newProps){
        var groups = this._updateValues(newProps, this.state);
        this.state.groups = groups;
        groups = this._updateVisibility(this.state);

        var newState: Partial<IPropertyStoreState> = {groups: groups};
        if (newProps.hasOwnProperty("name")){
            newState.nameProperty = this.state.nameProperty.set("value", newProps.name);
        }
        if (newProps.hasOwnProperty("locked")){
            newState.lockedProperty = this.state.lockedProperty.set("value", newProps.locked);
        }
        this.setState(newState);
    }

    _updateValues(changes, state = this.state){
        var groups = state.groups;
        var affectedProperties = this.state.selection.getAffectedDisplayProperties(changes);

        var mutators = [];
        for (let i = 0; i < affectedProperties.length; ++i){
            let propertyName = affectedProperties[i]
            var path = state.pathMap[propertyName];
            var descriptor = state.descriptorMap[propertyName];
            if (path && descriptor){
                var value = this.state.selection.getDisplayPropValue(propertyName, descriptor);
                mutators.push(path, value);

                this.state.valueMap[propertyName] = value;
            }
        }

        if (mutators.length){
            groups = state.groups.withMutations(groups => {
                for (let i = 0; i < mutators.length; i+=2){
                    var path = mutators[i];
                    var value = mutators[i+1];
                    groups.updateIn(path, p => p.set("value", value));
                }
            });
        }

        return groups;
    }

    _updateVisibility(state){
        var mutators = null;
        var groups = state.groups;
        state.visibilityMap = state.selection && state.selection.prepareDisplayPropsVisibility();
        if (state.visibilityMap){
            for (let propertyName in state.visibilityMap){
                var path = state.pathMap[propertyName];
                if (path){
                    mutators = mutators || [];
                    mutators.push(path, state.visibilityMap[propertyName]);
                }
            }
        }

        if (mutators){
            groups = state.groups.withMutations(groups => {
                for (let i = 0; i < mutators.length; i+=2){
                    var path = mutators[i];
                    var value = mutators[i+1];
                    groups.updateIn(path, p => p.set("visible", value));
                }
            });
        }

        return groups;
    }

    _setGroups(state, groupDefinitions){
        state.groups = Immutable.List().withMutations(groups => {
            for (var i = 0; i < groupDefinitions.length; i++){
                var definition = groupDefinitions[i];
                var properties = Immutable.List().withMutations(props => {
                    for (var j = 0; j < definition.properties.length; j++) {
                        var propertyName = definition.properties[j];
                        var property = this._createPropertyMetadata(state, propertyName, i, j);
                        if(property) {
                            props.push(property);
                        }
                    }
                });

                var group = Immutable.Map(Object.assign({}, definition, {properties}));
                groups.push(group);
            }
        });
    }

    _createPropertyMetadata(state, propertyName, groupIndex?, propIndex?) : object | null {
        var descriptor = state.selection.findPropertyDescriptor(propertyName);
        var metadata = null;

        if (descriptor){
            var value = state.selection.getDisplayPropValue(propertyName, descriptor);

            metadata = Immutable.Map({
                visible: true,
                value: value,
                descriptor: descriptor,
                options: descriptor.options //TODO: remove when dynamic options are fixed
            });

            state.valueMap[propertyName] = value;
            state.pathMap[propertyName] = groupIndex === undefined ? null : [groupIndex, "properties", propIndex];
            state.descriptorMap[propertyName] = descriptor;
        }
        return metadata;
    }

    _initEmptySelection(artboard) : void {
        if (this._emptySelection){
            this._emptySelection.dispose();
        }
        this._emptySelection = new CompositeElement();
        if (artboard){
            this._emptySelection.register(artboard);
        }
    }
}

export default new PropertyStore(null);
