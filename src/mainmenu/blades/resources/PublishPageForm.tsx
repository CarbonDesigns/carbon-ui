import * as React from "react";
import { FormattedMessage } from "react-intl";
import { IFieldState, GuiValidatedInput, GuiTextArea, GuiButton, GuiRequiredInput, ValidationTrigger, GuiButtonBlock } from "../../../shared/ui/GuiComponents";
import { Component, dispatchAction } from "../../../CarbonFlux";
import { backend, IPage, app, ISharedPageSetup, ResourceScope, Screenshot } from "carbon-core";
import { PublishAction } from "./PublishActions";
import { MarkupLine } from "../../../shared/ui/Markup";
import electronEndpoint from "../../../electronEndpoint";
import { TabContainer, TabArea, TabPage } from "../../../shared/TabContainer";
import ResourceSharer from "../../../library/ResourceSharer";
import { Operation } from "../../../shared/Operation";
import { GuiProgressButton } from "../../../shared/ui/GuiProgressButton";
import { TabPageStyled, TabAreaStyled } from "../../../components/CommonStyle";

interface IPublishPageFormProps {
    page: IPage;
    coverUrl: string;
    screenshots: Screenshot[];
    defaultSetup: ISharedPageSetup;
}
interface IPublishPageFormState {
    name: string;
    validatedName: string;
    description: string;
    tags: string;
    scope: ResourceScope;
    confirm: boolean;
    publishStep: string;
    loading: boolean;
}
export default class PublishPageForm extends Component<IPublishPageFormProps, IPublishPageFormState> {
    refs: {
        name: GuiValidatedInput,
        description: GuiTextArea,
        tags: GuiRequiredInput
    }

    constructor(props: IPublishPageFormProps) {
        super(props);

        this.state = {
            validatedName: "",
            scope: props.defaultSetup.scope,
            name: props.defaultSetup.name,
            description: props.defaultSetup.description,
            tags: props.defaultSetup.tags,
            confirm: false,
            publishStep: "1",
            loading: false
        }
    }

    componentWillReceiveProps(nextProps: IPublishPageFormProps) {
        if (nextProps.defaultSetup !== this.props.defaultSetup) {
            this.setState({
                scope: nextProps.defaultSetup.scope,
                name: nextProps.defaultSetup.name,
                description: nextProps.defaultSetup.description,
                tags: nextProps.defaultSetup.tags,
                confirm: !!nextProps.defaultSetup.name
            });
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
            case "Publish_PrivacyChanged":
                this.refs.name.validate();
                break;
            case "Publish_CoverSelected":
                this.refs.name.focus();
                break;
        }
    }

    private validateName = (name: string, state: any/*ImmutableRecord<IFieldState>*/, force?: boolean) => {
        if (name) {
            if (name !== this.state.validatedName && state.get("status") !== "checking") {
                backend.shareProxy.validatePageName({ name, scope: this.state.scope })
                    .then(response => {
                        dispatchAction({ type: "Publish_NameValidation", response });
                        this.setState({ validatedName: name });
                        if (!force) {
                            this.setState({ publishStep: "1" });
                        }
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

    private onNameChanged = (e) => {
        this.setState({ name: e.target.value, validatedName: "" });
    }
    private onDescriptionChanged = (e) => {
        this.setState({ description: e.target.value });
    }
    private onTagsChanged = (e) => {
        this.setState({ tags: e.target.value });
    }
    private onPrivacyChanged = () => {
        let scope = this.state.scope === ResourceScope.Company ? ResourceScope.Public : ResourceScope.Company;
        this.setState({ scope, publishStep: "1", validatedName: "" });
        dispatchAction({ type: "Publish_PrivacyChanged", newValue: scope });
    }

    private onPublishButtonClick = () => {
        if (this.state.confirm) {
            this.setState({ publishStep: "2" });
        }
        else {
            this.publishPage();
        }
    }

    private onConfirmationCancelled = () => {
        this.setState({ publishStep: "1" });
    }

    private publishPage = () => {
        let ok = this.refs.name.validate(true);
        ok = this.refs.tags.validate(true) || ok;
        if (!ok) {
            return;
        }

        let operation = new Operation();
        operation.start();

        this.setState({ loading: true });

        let tasks = [ResourceSharer.exportPage(this.props.page)];
        for (let i = 0; i < this.props.screenshots.length; ++i) {
            tasks.push(backend.fileProxy.uploadPublicImage({ content: this.props.screenshots[i].url }));
        }

        Promise.all(tasks)
            .then(results => operation.stop(results))
            .then(results => {
                let pageData = results[0];
                let screenshots = [];
                for (let i = 1; i < results.length; ++i) {
                    screenshots.push({
                        id: this.props.screenshots[i - 1].id,
                        name: this.props.screenshots[i - 1].name,
                        url: results[i].url
                    });
                }

                return backend.shareProxy.publishPage({
                    name: this.refs.name.getValue(),
                    description: this.refs.description.getValue(),
                    tags: this.refs.tags.getValue(),
                    scope: this.state.scope,
                    pageData: JSON.stringify(pageData),
                    coverUrl: this.props.coverUrl,
                    screenshots
                })
            })
            .then(response => {
                if (response.ok === true) {
                    this.props.page.setProps({ galleryId: response.result.galleryId });
                }

                dispatchAction({ type: "Publish_Published", response: response });
            })
            .finally(() => this.setState({ loading: false }));
    };

    private saveToDisk() {
        electronEndpoint.saveResource(() => {
            return ResourceSharer.exportPage(app.activePage).then(data => {
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
            <TabAreaStyled>
                <TabPageStyled tabId="1">
                    <MarkupLine>
                        <GuiProgressButton mods="submit" onClick={this.onPublishButtonClick} caption="btn.publish" disabled={!this.props.page} loading={this.state.loading} />
                    </MarkupLine>
                </TabPageStyled>
                <TabPageStyled tabId="2">
                    <MarkupLine>
                        <FormattedMessage id="@publish.confirm" tagName="p" />
                    </MarkupLine>
                    <MarkupLine>
                        <GuiButtonBlock>
                            <GuiProgressButton mods="submit" onClick={this.publishPage} caption="@update" loading={this.state.loading} />
                            <GuiButton mods="hover-white" onClick={this.onConfirmationCancelled} caption="@cancel" />
                        </GuiButtonBlock>
                    </MarkupLine>
                </TabPageStyled>
            </TabAreaStyled>
        </TabContainer>;
    }

    render() {
        return <div>
            <MarkupLine stretch>
                <GuiValidatedInput ref="name" caption="@publish.name" placeholder={this.formatLabel("@publish.nameHint")}
                    value={this.state.name} onChange={this.onNameChanged}
                    onValidate={this.validateName}
                    disabled={!this.props.page}
                    selectOnFocus={true}
                    trigger={ValidationTrigger.blur} />
            </MarkupLine>

            <MarkupLine stretch>
                <GuiTextArea ref="description" caption="@publish.description"
                    mods="resize-v"
                    value={this.state.description} onChange={this.onDescriptionChanged}
                    disabled={!this.props.page}
                    placeholder={this.formatLabel("@publish.descriptionHint")} />
            </MarkupLine>
            <MarkupLine stretch>
                <GuiRequiredInput ref="tags" caption="@tags"
                    value={this.state.tags} onChange={this.onTagsChanged}
                    disabled={!this.props.page}
                    placeholder="buttons, ios, flat, etc" />
            </MarkupLine>

            <MarkupLine stretch>
                <div className="gui-input">
                    <p className={"gui-input__label"}>
                        <FormattedMessage id="@publish.privacy" />
                    </p>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={this.state.scope === ResourceScope.Public} onChange={this.onPrivacyChanged} disabled={!this.props.page} />
                        <i />
                        <span><FormattedMessage id="@publish.public" /></span>
                    </label>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={this.state.scope === ResourceScope.Company} onChange={this.onPrivacyChanged} disabled={!this.props.page} />
                        <i />
                        <FormattedMessage id="@publish.private" />
                    </label>

                </div>
            </MarkupLine>

            {this.renderPublishButton()}
        </div>
    }
}