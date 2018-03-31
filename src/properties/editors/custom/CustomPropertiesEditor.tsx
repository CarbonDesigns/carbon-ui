import * as React from "react";
import {Component, listenTo} from "../../../CarbonFlux";
import {richApp} from "../../../RichApp";
import {FormattedMessage} from "react-intl";
import StringEditor from "../StringEditor";
import DropdownEditor from "../DropdownEditor";
import {PropertyMetadata, Symbol} from "carbon-core";
import * as Immutable from "immutable";
import EditorComponent from "../EditorComponent";
import propertyStore from "../../PropertyStore";
import {GuiButton} from "../../../shared/ui/GuiComponents";
import AddButton from "../../../shared/ui/AddButton";

class CustomProperty extends Component<any, any> {
    constructor(props) {
        super(props);
        var p = this.props.p;
        this.state = {
            expanded: !!this.props.expanded,
            name: p.name,
            controlId: p.controlId,
            propertyName: p.propertyName
        }
    }

    _onNewNameChange = (value) => {
        this.setState({name: value});
    }

    _onControlChanged = (item) => {
        var {formatMessage} = this.context.intl;
        var props = PropertyMetadata.getCustomizableProperties(item.element.systemType()).map(p=> {
            return {value: p.name, name: formatMessage({id: p.property.displayName})}
        });
        this.setState({controlId: item.value, propertyName: "", properties: props});
    }

    nextAvailiableName(name) {
        var nameMap = {};
        var properties = this.props.p.get("value");
        var found = false;
        for (var i = 0; i < properties.length; ++i) {
            var n = properties[i].name;
            nameMap[n] = true;
            if (name === n) {
                found = true;
            }
        }
        if (!found) {
            return name;
        }

        var indexer = 1;
        var nameCandidate;
        do
        {
            found = false;
            nameCandidate = name + " " + indexer++;
            if (nameMap[nameCandidate]) {
                found = true;
            }

        } while (found);

        return nameCandidate;
    }

    _onPropertyChanged = (item) => {
        var name = this.state.name || this.nextAvailiableName(item.value);
        this.setState({propertyName: item.value, name: name});
    }

    _onAccept = ()=> {
        this.props.onCompleteEditing({
            name: this.state.name,
            controlId: this.state.controlId,
            propertyName: this.state.propertyName
        });
    }

    _onCancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        this.setState({expanded: !this.state.expanded});
    }

    _toggle = () => {
        this.setState({expanded: !this.state.expanded});
    }

    render() {
        var p = this.props.p;

        if (!this.state.expanded) {
            return (
                <div>
                    <div className="custom-property-item" onClick={this._toggle}>{p.name}</div>
                </div>
            )
        }

        var nameProp = Immutable.Map({
            descriptor: {
                name: "name",
                displayName: "name",
            },
            value: this.state.name,
            options: {
                noPreview: true
            }
        });

        var that = this;
        var controlProp = Immutable.Map({
            descriptor: {
                name: "control",
                displayName: "Element",
            },
            value: this.state.controlId,
            options: {
                items: function () {
                    return that.props.e.getChildControlList().map(e=> {
                        return {name: e.displayName(), value: e.id, element: e}
                    });
                }
            }
        });

        var propertyNameProp = Immutable.Map({
            descriptor: {
                name: "property",
                displayName: "Property",
            },
            value: this.state.propertyName,
            options: {
                items: this.state.properties
            }
        })

        return (
            <div style={{position:'relative'}}>
                <DropdownEditor p={controlProp} onValueChanged={this._onControlChanged}/>
                <DropdownEditor p={propertyNameProp} onValueChanged={this._onPropertyChanged}/>
                {/* <StringEditor p={nameProp} onChange={this._onNewNameChange}/> */}
                <div className="accept-changes">
                    <div className="bottom-right-controls">
                        <div className="button_accept" onClick={this._onAccept}></div>
                        <div className="button_cancel" onClick={this._onCancel}></div>
                    </div>
                </div>
            </div>
        );
    }
}

class CustomPropertiesEditor extends EditorComponent<any, any, any> {
    // @listenTo(propertyStore)
    // onChange(){
    //     this.setState({
    //         element: propertyStore.state.selection,
    //         groups: propertyStore.state.groups
    //     });
    // }
    constructor(props) {
        super(props);
        this.state = {newName: "", newControlId: "", newPropertyName: "", artboard: this.props.e.first()};
    }

    _addNewProperty = ()=> {
        this.setState({newProperty: true})
    }

    _renderAddNewButton() {
        if (this.state.newProperty) {
            return null;
        }

        return <AddButton onClick={this._addNewProperty} caption="button.addNewProperty" defaultMessage="New property"/>
        //return <GuiButton mods={["full", "hover-success"]} onClick={this._addNewProperty}   caption="button.addNewProperty" defaultMessage="New property" bold icon="plus"/>
    }

    _cancelAddNew = ()=> {
        this.setState({newProperty: false});
    }


    _addNew = (newItem)=> {
        var value = this.props.p.get("value");
        var newValue = value.slice();
        newValue.push(newItem);
        this.setValueByCommand(newValue);
        this.setState({newProperty: false});

    }

    _onChange = (newItem, oldItem)=> {
        var value = this.props.p.get("value");
        for (var i = 0; i < value.length; ++i) {
            if (value[i] === oldItem) {
                var newValue = value.slice();
                newValue[i] = newItem;
                this.setValueByCommand(newValue);
                this.setState({newProperty: false});
                return;
            }
        }
    }

    _renderNewProperty() {
        if (!this.state.newProperty) {
            return null;
        }

        return <CustomProperty p={this.props.p}
                               e={this.props.e.first()}
                               expanded={true}
                               key="new_property"
                               onCancel={this._cancelAddNew}
                               onCompleteEditing={this._addNew}/>
    }

    render() {
        if(!this.state.artboard){
            return <div></div>;
        }
        var customProperties = this.state.artboard.getCustomProperties();

        return (
            <div key={"prop_editor_"+this.state.artboard.id}>
                {customProperties.map(p=><CustomProperty p={p} key={p.name} e={this.props.e.first()}
                                                         onCompleteEditing={(item)=>{this._onChange(item, p)}}/>)}
                {this._renderNewProperty()}
                {this._renderAddNewButton()}
                <div style={{height:'100px'}}></div>
            </div>
        );
    }

}

export default CustomPropertiesEditor;
