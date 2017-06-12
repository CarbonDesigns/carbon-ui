import React from "react";
import { FormattedMessage } from "react-intl";
import { IFieldState, GuiValidatedInput, GuiTextArea, GuiButton, GuiRequiredInput, ValidationTrigger } from "../../../shared/ui/GuiComponents";
import { Component, dispatchAction } from "../../../CarbonFlux";
import { backend, IPage, app } from "carbon-core";
import { PublishAction } from "./PublishActions";
import { MarkupLine } from "../../../shared/ui/Markup";
import electronEndpoint from "electronEndpoint";
import TabContainer, { TabArea, TabPage } from "../../../shared/TabContainer";

interface IPublishPageFormProps {
    page: IPage;
    coverUrl: string;
}
interface IPublishPageFormState {
    validatedName: string;
    isPublic: boolean;
    confirm: boolean;
    publishStep: string;
}
export default class PublishPageForm extends Component<IPublishPageFormProps, IPublishPageFormState> {
    refs: {
        name: GuiValidatedInput,
        description: GuiTextArea,
        tags: GuiRequiredInput
    }

    constructor(props) {
        super(props);

        this.state = {
            validatedName: "",
            isPublic: true,
            confirm: false,
            publishStep: "1"
        }
    }

    canHandleActions() {
        return true;
    }
    onAction(action: PublishAction) {
        switch (action.type) {
            case "Publish_NameValidation":
                if (action.response.ok === true) {
                    this.refs.name.setOk();
                    this.setState({ confirm: action.response.result.exists });
                }
                else {
                    this.refs.name.setErrorLabel(action.response.errors.name);
                }
                break;
            case "Publish_Published":
                if (action.response.ok === true) {
                    this.refs.name.setOk();
                }
                else {
                    this.refs.name.setErrorLabel(action.response.errors.name);
                }
                break;
        }
    }

    private validateName = (name: string, state: ImmutableRecord<IFieldState>, force?: boolean) => {
        if (name) {
            if (name !== this.state.validatedName && state.get("status") !== "checking") {
                backend.shareProxy.validatePageName({ name, isPublic: this.state.isPublic })
                    .then(response => {
                        dispatchAction({ type: "Publish_NameValidation", response });
                        this.setState({ validatedName: name, publishStep: "1" });
                    });

                return state.set("status", "checking").set("error", "");
            }

            return state;
        }

        if (force) {
            return state.set("status", "error").set("error", this.formatLabel("@requiredField"));
        }

        return state.set("status", "notReady");
    }

    private togglePrivacy = () => {
        this.setState({ isPublic: !this.state.isPublic, publishStep: "1" });
    }

    private onPublishButtonClick = () => {
        if (this.state.confirm) {
            this.setState({publishStep: "2"});
        }
        else {
            this.publishPage();
        }
    }

    private onConfirmationCancelled = () => {
        this.setState({publishStep: "1"});
    }

    private publishPage = () => {
        let ok = this.refs.name.validate(true);
        if (!ok) {
            return;
        }

        // TODO: show progress bar here
        this.props.page.export()
            .then(data => backend.shareProxy.publishPage({
                name: this.refs.name.getValue(),
                description: this.refs.description.getValue(),
                tags: this.refs.tags.getValue(),
                isPublic: this.state.isPublic,
                pageData: JSON.stringify(data),
                previewPicture: this.props.coverUrl
            }))
            .then((result) => {
                dispatchAction({type: "Publish_Published", response: result});
            });
    };

    private saveToDisk() {
        electronEndpoint.saveResource(() => {
            return app.activePage.export().then(data => {
                return {
                    name: this.refs.name.getValue(),
                    data: data,
                    description: this.refs.description.getValue(),
                    tags: this.refs.tags.getValue(),
                    image: this.props.coverUrl
                }
            });

        });
    }

    private renderPublishButton() {
        if (app.isElectron()) {
            return <MarkupLine>
                <GuiButton mods="submit" onClick={this.saveToDisk.bind(this)} caption="btn.save" defaultMessage="Save"
                    icon={true} />
            </MarkupLine>
        }

        return <TabContainer currentTabId={this.state.publishStep} className="publish__submit">
                <TabArea className="gui-pages">
                    <TabPage className="gui-page" tabId="1">
                        <MarkupLine>
                            <GuiButton mods="submit" onClick={this.onPublishButtonClick} caption="btn.publish" icon={true} />
                        </MarkupLine>
                    </TabPage>
                    <TabPage className="gui-page" tabId="2">
                        <MarkupLine>
                            <FormattedMessage id="@publish.confirm" tagName="p"/>
                        </MarkupLine>
                        <MarkupLine>
                            <GuiButton mods="submit" onClick={this.publishPage} caption="@update" icon={true} />
                            <GuiButton mods="hover-white" onClick={this.onConfirmationCancelled} caption="@cancel" icon={true} />
                        </MarkupLine>
                    </TabPage>
                </TabArea>
            </TabContainer>;
    }

    render() {
        return <div>
            <MarkupLine mods="space">
                <GuiValidatedInput ref="name" caption="@publish.name" placeholder="Give it some cool name"
                    onValidate={this.validateName}
                    trigger={ValidationTrigger.blur} />
            </MarkupLine>

            <MarkupLine>
                <GuiTextArea ref="description" caption="@publish.description" placeholder="What inspired you?" />
            </MarkupLine>
            <MarkupLine>
                <GuiRequiredInput ref="tags" caption="@tags" placeholder="buttons, ios, flat, etc" />
            </MarkupLine>

            <MarkupLine>
                <div className="gui-input">
                    <p className={"gui-input__label"}>
                        <FormattedMessage id="@publish.privacy" />
                    </p>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={this.state.isPublic} onChange={this.togglePrivacy} data-option="activeArtboard" />
                        <i />
                        <span><FormattedMessage id="@publish.public" /></span>
                    </label>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={!this.state.isPublic} onChange={this.togglePrivacy} data-option="activePage" />
                        <i />
                        <FormattedMessage id="@publish.private" />
                    </label>

                </div>
            </MarkupLine>

            {this.renderPublishButton()}
        </div>
    }
}