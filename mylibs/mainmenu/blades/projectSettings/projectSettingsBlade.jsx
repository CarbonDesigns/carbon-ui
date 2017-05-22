import React from "react";
import {app, backend, ShareProxy, PageExporter} from "carbon-core";
import {Component} from "../../../CarbonFlux";
import {FormattedMessage} from "react-intl"
import {GuiButton, GuiButtonStack, GuiInput} from "../../../shared/ui/GuiComponents";
import {MarkupLine}  from "../../../shared/ui/Markup";
import {BladeBody}  from "../BladePage";
import EditAvatarBlade  from "./EditAvatarBlade";

var AVATAR_URL = '/target/res/avas/project-ava.jpg';

export default class ProjectSettingsBlade extends Component {
    constructor() {
        super();
        this.state = {
            projectName : "Test Carbo Project"
        }
    }

    // onKeyDown=(e)=>{
    //     if(e.keyCode === 13) {
    //         this.props.onComplete && this.props.onComplete(this.getValue(), e);
    //     }
    // }
    // onBlur=(e)=>{
    //     this.props.onComplete && this.props.onComplete(this.getValue(), e);
    // }
    // onChange = e => {
    //     var value = e.target.value;
    //     if(this.props.onChange){
    //         this.props.onChange(value);
    //         return;
    //     }
    //
    //     this.updateState(value);
    //     this.previewValue(value);
    //     this.setValueByCommandDelayed(value);
    // };

    _onChange = (ev) => {
        var value = ev.target.value;
        this.setState({projectName: value})
    };

    _save = () => {
        console.log('save', this.context.bladeContainer);
        this.context.bladeContainer.close(1);
    };


    _openAvatarEditor = (ev) => {
        console.log('_openAvatarEditor', this.context.bladeContainer);
        // this.context.bladeContainer.close(1);
        this.context.bladeContainer.addChildBlade(`blade_edit-project-avatar`, EditAvatarBlade, "Edit project avatar", {foo: 'bar'});
    };

    _clearAvatar = (ev) => {
        console.log('_clearAvatar', this.context.bladeContainer);
    };



    render() {


        return <BladeBody>
            <MarkupLine className="project-settings__avatar">
                <figure className="project-settings__avatar-image"
                    style={{ backgroundImage: "url('" + AVATAR_URL + "')" }}
                />
                <GuiButtonStack className="project-settings__avatar-controls">
                    <GuiButton
                        mods="hover-success"
                        // className="project-settings__avatar-edit-button"
                        // defaultMessage="edit avatar"
                        // caption="translate me"
                        icon="edit"
                        onClick={this._openAvatarEditor}
                    />
                    <GuiButton
                        mods="hover-cancel"
                        // className="project-settings__avatar-edit-button"
                        // defaultMessage="edit avatar"
                        // caption="translate me"
                        icon="trash"
                        onClick={this._clearAvatar}
                    />
                </GuiButtonStack>
            </MarkupLine>

            <MarkupLine mods="space">
                <GuiInput value={this.state.projectName} onChange={this._onChange} caption="Project name" defaultMessage="Project name"/>
            </MarkupLine>

            <MarkupLine>
                <GuiButton mods="submit" onClick={this._save} caption="btn.saveprojectsettings" defaultMessage="Save" icon={true} />
            </MarkupLine>
        </BladeBody>
    }
}

// MainMenuBlade.contextTypes = {bladeContainer: React.PropTypes.any};



ProjectSettingsBlade.contextTypes = {
    currentBladeId: React.PropTypes.number,
    bladeContainer: React.PropTypes.any
};
