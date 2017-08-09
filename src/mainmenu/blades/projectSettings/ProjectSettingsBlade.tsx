import React from "react";
import PropTypes from "prop-types";
import { app, backend, Invalidate, Rect } from "carbon-core";
import { Component, listenTo } from "../../../CarbonFlux";
import { FormattedMessage } from "react-intl"
import { GuiButton, GuiButtonStack, GuiInput, GuiTextArea } from "../../../shared/ui/GuiComponents";
import { FormHeading, FormLine, FormGroup } from "../../../shared/FormComponents"
import { MarkupLine } from "../../../shared/ui/Markup";
import { BladeBody } from "../BladePage";
import EditImageBlade from "../imageEdit/EditImageBlade";
import Dropdown from "../../../shared/Dropdown";
import bem from '../../../utils/commonUtils';
import appStore from "../../../AppStore";
import { ProjectAvatarSize } from "../../../Constants";

type ProjectSettingsBladeState = {
    avatarUrl: string;
}

export default class ProjectSettingsBlade extends Component<{}, ProjectSettingsBladeState> {
    refs: {
        name: GuiInput;
    }

    constructor(props) {
        super(props);

        this.state = {
            avatarUrl: appStore.state.appAvatar
        }
    }

    private onRandomizeAvatar = () => {
        app.setProps({ avatar: appStore.getRandomAvatarUrl() });
        this.setState({ avatarUrl: app.props.avatar });
    }

    private onEditAvatar = () => {
        this.context.bladeContainer.addChildBlade("blade_edit-project-avatar", EditImageBlade, "@project.editAvatar", {
            dpr: 2,
            onComplete: this.onImageEditCompleted,
            allowCropping: true,
            image: this.state.avatarUrl,
            previewSize: Rect.fromSize(ProjectAvatarSize, ProjectAvatarSize)
        });
    }

    private onAvatarDeleted = () => {
        app.setProps({ avatar: "" });
        this.setState({ avatarUrl: "" });
    }

    private onImageEditCompleted = (url?: string) => {
        this.context.bladeContainer.close(2);
        if (url) {
            this.setState({ avatarUrl: url });
        }
    }

    private onSave = (e: React.FormEvent<HTMLFormElement>) => {
        app.setProps({
            name: this.refs.name.getValue(),
            avatar: this.state.avatarUrl
        });
        this.context.bladeContainer.close(1);
        e.preventDefault();
    }

    render() {
        return <BladeBody>
            <form onSubmit={this.onSave}>
                <MarkupLine mods={["space", "stretch"]}>
                    <GuiInput defaultValue={app.props.name} caption="@project.name" ref="name" autoFocus selectOnFocus />
                </MarkupLine>

                <MarkupLine>
                    <FormattedMessage id="@project.avatar" tagName="label" />
                </MarkupLine>

                <MarkupLine className="project__avatar" mods={["stretch", "horizontal"]}>
                    <figure className="project__avatar-image"
                        style={{ backgroundImage: "url('" + this.state.avatarUrl + "')" }}
                    />
                    <GuiButtonStack className="project__avatar-controls">
                        <GuiButton
                            mods="hover-white"
                            icon="refresh"
                            onClick={this.onRandomizeAvatar}
                        />
                        <GuiButton
                            mods="hover-success"
                            icon="edit"
                            onClick={this.onEditAvatar}
                        />
                        <GuiButton
                            mods="hover-success"
                            icon="small-delete"
                            onClick={this.onAvatarDeleted}
                        />
                    </GuiButtonStack>
                </MarkupLine>

                <MarkupLine mods="space">
                    <GuiButton mods="submit" onClick={this.onSave} caption="@save" />
                </MarkupLine>
            </form>
        </BladeBody>
    }

    static contextTypes = {
        intl: PropTypes.object,
        currentBladeId: PropTypes.number,
        bladeContainer: PropTypes.any
    }
}
