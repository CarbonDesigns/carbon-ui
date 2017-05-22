import React from 'react';
import {Component, listenTo} from "../../../CarbonFlux";
import EditableList from "../../../shared/EditableList";
import {richApp} from "../../../RichApp";
import {FormattedMessage} from "react-intl";
import StringEditor from "../StringEditor";
import DropdownEditor from "../DropdownEditor";
import {PropertyMetadata, ArtboardTemplateControl, Artboard, StateBoard} from "carbon-core";
import Immutable from "immutable";
import EditorComponent from "../EditorComponent";
import propertyStore from "../../PropertyStore";
import AddButton from '../AddButton';

import {GuiInlineLabel, GuiDropDown, GuiButton} from "../../../shared/ui/GuiComponents";
// import bem from '../../../utils/commonUtils';


class StateItem extends Component<any, any> {
    _selectState = ()=>{
        this.props.artboard.state(this.props.s.name);
    }

    render(){
        return <div className="state-editor-item" onClick={this._selectState}><span>{this.props.s.name}</span></div>;
    }
}

export default class CustomPropertiesEditor extends EditorComponent<any, any> {
    @listenTo(propertyStore)
    onChange(){

        var artboard =propertyStore.state.selection?propertyStore.state.selection.first():null;
        if (!(artboard instanceof  Artboard)){
            artboard = null;
        }
        this.setState({
            artboard: artboard,
            version: this.state.version +1
        });
    }
    constructor(props) {
        super(props);
        var artboard = this.props.e.first();
        this.state = {artboard: artboard, editState:null, version: 1};
    }

    _renderAddNewButton() {
        if (this.state.newProperty) {
            return null;
        }

        return <AddButton onClick={this._addNewState} caption="button.addNewState" defaultMessage="Add state"/>

        // return <GuiButton onClick={this._addNewState}
        //                   mods={['simple', 'small']}
        //                   caption="button.addNewState"
        //                   defaultMessage="Add state"/>
        // return <div className="button-big-property" onClick={this._addNewState}><FormattedMessage id="button.addNewState"
        //                                                                 defaultMessage="Add state"/></div>;
    }

    _addNewState = ()=> {
        var newState = this.state.artboard.addState("New state " + this.state.artboard._recorder.statesCount());
        var stateBoard = new StateBoard();
        stateBoard.setProps({
            stateId:newState.id
        });

        this.state.artboard.linkNewStateBoard(stateBoard);
        this.setState({editState:newState});
    }

    _onChange = (newItem, oldItem)=> {
        var value = this.props.p.get("value");
        for (var i = 0; i < value.length; ++i) {
            if (value[i] === oldItem) {
                var newValue = value.slice();
                newValue[i] = newItem;
                this.setValueByCommand(newValue);
                this.setState({newProperty: false});
                //this.buildMetadata is undefined
                //PropertyMetadata.replaceForNamedType(this.props.e.first().name(), ArtboardTemplateControl, this.buildMetadata(newValue));
                return;
            }
        }
    }

    _onRename=(newName, item)=>{
        this.state.artboard._recorder.renameState(item.id, newName);
        this.setState({version:this.state.version +1});
    }

    _onDelete=(item)=>{
        this.state.artboard._recorder.removeStateById(item.id);
        this.setState({version:this.state.version +1});
    }

    _canDelete(item){
        return item.id !== 'default';
    }

    render() {
        if(!this.state.artboard){
            return null;
        }
        var states = this.state.artboard.getStates();
        if(!states){
            return null;
        }
        return (
            <div key={"state_editor_"+this.state.artboard.id()} className="state-editor">
                <EditableList
                    items={states.slice()}
                    onRename={this._onRename}
                    onDelete={this._onDelete}
                    canDelete={this._canDelete}
                />
                {this._renderAddNewButton()}
            </div>
        );
    }

}

