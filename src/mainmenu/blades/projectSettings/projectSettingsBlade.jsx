import React from "react";
import {app, backend, ShareProxy, PageExporter} from "carbon-core";
import {Component} from "../../../CarbonFlux";
import {FormattedMessage} from "react-intl"
import {GuiButton, GuiButtonStack, GuiInput, GuiTextArea} from "../../../shared/ui/GuiComponents";
import {FormHeading, FormLine, FormGroup}                 from "../../../shared/FormComponents"
import {MarkupLine}  from "../../../shared/ui/Markup";
import {BladeBody}  from "../BladePage";
import EditAvatarBlade  from "./EditAvatarBlade";
import Dropdown from "../../../shared/Dropdown";
import bem from '../../../utils/commonUtils';

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



    _renderSelected(ind) {
        return <p className={bem("publish", "pages-list-item", {selected: false})}>{ app.pages[ind].name() }</p>
    };



    _renderList() {

        return

    };



    render() {


        return <BladeBody>

            <MarkupLine>
                <div className="gui-input">
                    <p className={"gui-input__label"}>
                        <FormattedMessage id="translateme!" defaultMessage={"Выберите страницу для паблишинга:"} />
                    </p>

                    <Dropdown
                        className="drop_down_no-padding"
                        selectedItem={0}
                        onSelect={console.log} //fixme !
                        // renderSelected={this._renderSelected}
                    >
                        {app.pages.map((page, ind)=><p
                                key={"page_id" + page.id()}
                                className={bem("publish", "pages-list-item", { selected: (ind===0) })}>{page.name()}
                            </p>

                        )}
                    </Dropdown>

                </div>
            </MarkupLine>

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



            { /*  fixme вот это меняйте.   */  }
            <MarkupLine>
                <GuiTextArea value={this.state.projectName} onChange={this._onChange} caption="Resource description" defaultMessage="Resource description"/>
            </MarkupLine>
            <MarkupLine>
                <GuiInput value={this.state.projectName} onChange={this._onChange} caption="Tags" defaultMessage="Tags"/>
            </MarkupLine>

            <MarkupLine>
                <div className="gui-input">
                    <p className={"gui-input__label"}>
                        <FormattedMessage id="translateme!" defaultMessage={"Тип все дела"} />
                    </p>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={true} onChange={console.log} data-option="activeArtboard"/>
                        <i />
                        <span><FormattedMessage id="translateme!" defaultMessage="Public"/></span>
                    </label>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={false} onChange={console.log} data-option="activePage"/>
                        <i />
                        <FormattedMessage id="translateme!" defaultMessage="Private"/>
                    </label>

                </div>
            </MarkupLine>



            <MarkupLine mods="space">
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
