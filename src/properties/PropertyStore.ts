import { handles, CarbonStore, dispatch, dispatchAction } from "../CarbonFlux";
import Immutable from "immutable";
import CarbonActions, { CarbonAction } from "../CarbonActions";
import { PropertyAction, PropertiesTab } from "./PropertyActions";
import { PropertyTracker, app, NullPage, Selection, CompositeElement, PropertyMetadata, ChangeMode } from "carbon-core";

interface IPropertyStoreState {
    groups?: Immutable.List<any>;
    initialized?: boolean;
    nameProperty?: any;
    lockedProperty?: any;
    valueMap?: object;
    visibilityMap: { [name: string]: boolean };
    descriptorMap?: object;
    pathMap?: object;
    selection?: any;
    tabId: PropertiesTab;
}

class PropertyStore extends CarbonStore<IPropertyStoreState> {
    private app: any;
    private _emptySelection = new CompositeElement();

    constructor(dispatcher) {
        super(dispatcher);
        this.state = {
            groups: Immutable.List(),
            initialized: false,
            nameProperty: null,
            lockedProperty: null,
            valueMap: {},
            visibilityMap: {},
            descriptorMap: {},
            pathMap: {},
            selection: null,
            tabId: "1"
        };
    }

    getPropertyValue(propertyName) {
        return this.state.valueMap[propertyName];
    }

    onAction(action: PropertyAction | CarbonAction) {
        super.onAction(action);

        switch (action.type) {
            case "Carbon_PropertiesRequested":
                this.onPropertiesRequested(action.composite);
                return;
            case "Properties_ChangeTab":
                this.setState({ tabId: action.tabId });
                return;
            case "Properties_Changed":
                this.onChanged(action.changes);
                return;
            case "Properties_ChangedExternally":
                this.onChangedExternally(action.changes);
                return;
            case "Properties_Preview":
                this.previewProperty(action.changes);
                return;
            case "Properties_Patched":
                this.onPatched(action.patchType, action.propertyName, action.value);
                return;
            case "Properties_PatchPreview":
                this.previewPatchProperty(action.patchType, action.propertyName, action.value);
                return;
        }
    }

    getPropertyOptions(propertyName) {
        let descriptor = this.state.descriptorMap[propertyName];
        if (!descriptor) {
            return {}
        }
        let options = descriptor.options;
        if (options) {
            return options;
        }
        return {};
    }

    @handles(CarbonActions.loaded)
    onLoaded({ app }) {
        this.app = app;
        PropertyTracker.propertyChanged.bind(this, this._onPropsChanged);
        this.onPropertiesRequested(this._emptySelection);
    }

    @handles(CarbonActions.pageChanged)
    onPageChanged({ newPage }) {
        if (!(newPage === NullPage)) {
            this.onPropertiesRequested(this._emptySelection);
        }
    }

    onPropertiesRequested(selection) {
        if (selection.count() === 0) {
            selection = this._emptySelection;
        }

        var groups = selection.createPropertyGroups();

        var newState: Partial<IPropertyStoreState> = { selection: selection, initialized: true, descriptorMap: {}, valueMap: {}, pathMap: {}, visibilityMap: {}, tabId: "1" };
        newState.nameProperty = this._createPropertyMetadata(newState, "name");
        newState.lockedProperty = this._createPropertyMetadata(newState, "locked");
        this._setGroups(newState, groups);
        newState.groups = this._updateVisibility(newState);

        this.setState(newState);
    }

    onChanged(changes) {
        this.state.selection.updateDisplayProps(changes);
    }

    onPatched(changeType, propertyName, value) {
        this.state.selection.patchDisplayProps(this.state.selection.elements, propertyName, changeType, value);
    }

    previewPatchProperty(changeType, propertyName, value) {
        this.state.selection.previewPatchDisplayProps(this.state.selection.elements, propertyName, changeType, value);
    }

    onChangedExternally(changes) {
        this._updateState(changes);
    }

    previewProperty(changes) {
        this.state.selection.previewDisplayProps(changes);
    }

    _onPropsChanged(element, newProps) {
        if (element === this.state.selection) {
            var dispatcher = this.getDispatcher();
            if (dispatcher.isDispatching()) {
                this._updateState(newProps);
            }
            else {
                dispatchAction({type: "Properties_ChangedExternally", changes: newProps });
            }
        }
    }

    _updateState(newProps) {
        var groups = this._updateValues(newProps, this.state);
        this.state.groups = groups;
        groups = this._updateVisibility(this.state);

        var newState: Partial<IPropertyStoreState> = { groups: groups };
        if (newProps.hasOwnProperty("name")) {
            newState.nameProperty = this.state.nameProperty.set("value", newProps.name);
        }
        if (newProps.hasOwnProperty("locked")) {
            newState.lockedProperty = this.state.lockedProperty.set("value", newProps.locked);
        }
        this.setState(newState);
    }

    _updateValues(changes, state = this.state) {
        var groups = state.groups;
        var affectedProperties = this.state.selection.getAffectedDisplayProperties(changes);

        var mutators = [];
        for (let i = 0; i < affectedProperties.length; ++i) {
            let propertyName = affectedProperties[i]
            var path = state.pathMap[propertyName];
            var descriptor = state.descriptorMap[propertyName];
            if (path && descriptor) {
                var value = this.state.selection.getDisplayPropValue(propertyName, descriptor);
                mutators.push(path, value);

                this.state.valueMap[propertyName] = value;
            }
        }

        if (mutators.length) {
            groups = state.groups.withMutations(groups => {
                for (let i = 0; i < mutators.length; i += 2) {
                    var path = mutators[i];
                    var value = mutators[i + 1];
                    groups.updateIn(path, p => p.set("value", value));
                }
            });
        }

        return groups;
    }

    _updateVisibility(state) {
        var mutators = null;
        var groups = state.groups;
        state.visibilityMap = state.selection && state.selection.prepareDisplayPropsVisibility();
        if (state.visibilityMap) {
            for (let propertyName in state.visibilityMap) {
                var path = state.pathMap[propertyName];
                if (path) {
                    mutators = mutators || [];
                    mutators.push(path, state.visibilityMap[propertyName]);
                }
            }
        }

        if (mutators) {
            groups = state.groups.withMutations(groups => {
                for (let i = 0; i < mutators.length; i += 2) {
                    var path = mutators[i];
                    var value = mutators[i + 1];
                    groups.updateIn(path, p => p.set("visible", value));
                }
            });
        }

        return groups;
    }

    _setGroups(state, groupDefinitions) {
        state.groups = Immutable.List().withMutations(groups => {
            for (var i = 0; i < groupDefinitions.length; i++) {
                var definition = groupDefinitions[i];
                var properties = Immutable.List().withMutations(props => {
                    for (var j = 0; j < definition.properties.length; j++) {
                        var propertyName = definition.properties[j];
                        var property = this._createPropertyMetadata(state, propertyName, i, j);
                        if (property) {
                            props.push(property);
                        }
                    }
                });

                var group = Immutable.Map(Object.assign({}, definition, { properties }));
                groups.push(group);
            }
        });
    }

    _createPropertyMetadata(state, propertyName, groupIndex?, propIndex?): object | null {
        var descriptor = state.selection.findPropertyDescriptor(propertyName);
        var metadata = null;

        if (descriptor) {
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
}

export default new PropertyStore(null);
