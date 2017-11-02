import React from 'react';
import {Component, listenTo} from "../../../CarbonFlux";
import EditableList from "../../../shared/EditableList";
import {richApp} from "../../../RichApp";
import {FormattedMessage} from "react-intl";
import StringEditor from "../StringEditor";
import DropdownEditor from "../DropdownEditor";
import { PropertyMetadata, Symbol, Artboard, ArtboardState, model } from "carbon-core";
import Immutable from "immutable";
import EditorComponent from "../EditorComponent";
import propertyStore from "../../PropertyStore";

import {GuiInlineLabel, GuiDropDown, GuiButton} from "../../../shared/ui/GuiComponents";
import AddButton from "../../../shared/ui/AddButton";
// import bem from '../../../utils/commonUtils';

type StateList = new (props) => EditableList<ArtboardState>;
const StateList = EditableList as StateList;

class StateItem extends Component<any, any> {
    _selectState = ()=>{
        this.props.artboard.state(this.props.s.name);
    }

    render(){
        return <div className="state-editor-item" onClick={this._selectState}><span>{this.props.s.name}</span></div>;
    }
}

export default class CustomPropertiesEditor extends EditorComponent<any, any, any> {
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
        var stateBoard = model.createStateboard();
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
                //PropertyMetadata.replaceForNamedType(this.props.e.first().name(), Symbol, this.buildMetadata(newValue));
                return;
            }
        }
    }

    _onRename=(newName, state: ArtboardState)=>{
        this.state.artboard._recorder.renameState(state.id, newName);
        this.setState({version:this.state.version +1});
    }

    _onDelete=(state: ArtboardState)=>{
        this.state.artboard._recorder.removeStateById(state.id);
        this.setState({version:this.state.version +1});
    }

    _canDelete(state: ArtboardState){
        return state.id !== 'default';
    }

    private stateId(state: ArtboardState) {
        return state.id;
    }

    private stateName(state: ArtboardState) {
        return state.name;
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
                <StateList data={states} idGetter={this.stateId} nameGetter={this.stateName}
                    onRename={this._onRename}
                    onDelete={this._onDelete}
                    canDelete={this._canDelete}
                    scrolling={false}
                />
                {this._renderAddNewButton()}
            </div>
        );
    }

}

