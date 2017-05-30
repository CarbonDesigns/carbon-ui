import React from "react";
import cx from 'classnames';
import {FormattedMessage} from 'react-intl';
import {app, PropertyTracker} from "carbon-core";
import CarbonActions from '../../CarbonActions';
import {GuiButton, GuiInput, GuiCheckbox} from "../../shared/ui/GuiComponents";
import {handles, listenTo, Component} from "../../CarbonFlux";
import CatalogView from "./CatalogView";
import Toolbox from "../Toolbox";
import customCatalogStore from "./CustomCatalogStore";

export default class CustomProviders extends Component{
    constructor(props){
        super(props);
        this.state = {editing: false, config: []};
    }

    @listenTo(customCatalogStore)
    _storeChanged(){
        this.setState({config: customCatalogStore.state.config});
    }

    _addCatalog = () => {
        this.setState({
            editing: true
        });
    };

    _saveCatalog = () => {
        var text = this.refs["text"].value;
        var name = this.refs["name"].value;
        app.dataManager.createCustomProvider(app, name, text);
        this.setState({editing: false});
    };

    _cancelEditing = () => {
        this.setState({
            editing: false
        });
    };

    render(){
        if (this.state.editing){
            return this._renderEdit();
        }
        return <div>
            <GuiButton mods={["full", "hover-success"]} onClick={this._addCatalog} caption="button.addDataset" defaultMessage="Add dataset" bold/>
            <CatalogView config={this.state.config}/>
        </div>;
    }

    _renderEdit(){
        return <div className="form form_flex">
            <div className="form__line form__line-dataset">
                <GuiInput ref="name" type="text" placeholder="Dataset name" autoFocus/>
                <GuiCheckbox label="csv"/>
            </div>
            <div className="form__line form__line-fill">
                <GuiInput ref="text" type="textarea" placeholder="Enter one item per line. Press Cmd+Enter to save."/>
            </div>

            <div className="form__submit">
                <GuiButton mods={["hover-success"]} onClick={this._saveCatalog}   caption="button.save" defaultMessage="Save" bold/>
                <GuiButton mods={["hover-cancel"]}  onClick={this._cancelEditing} caption="button.cancel" defaultMessage="Cancel" bold/>
            </div>
        </div>;
    }
}