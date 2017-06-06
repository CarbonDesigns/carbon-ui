import React from "react";
import BladePage from "../BladePage";
import { app, backend, ShareProxy, IPage, Rect, Workspace } from "carbon-core";
import { Component } from "../../../CarbonFlux";
import cx from 'classnames';
import { FormattedMessage } from "react-intl";
import { Markup, MarkupLine } from "../../../shared/ui/Markup";
import { GuiButton, GuiButtonStack, GuiInput, GuiTextArea } from "../../../shared/ui/GuiComponents";
import { BladeBody } from "../BladePage";
import electronEndpoint from "electronEndpoint";
import {PageSelect} from "../../../shared/ui/GuiSelect";
import bem from "../../../utils/commonUtils";
import EditImageBlade from "../imageEdit/EditImageBlade";
import { ImageEditorResult } from "../imageEdit/ImageEditor";

const PreviewSize = Rect.fromSize(512, 512);

interface IPublishBladeState {
    page?: IPage;
    dataUrl?: string;
    name: string;
    description: string;
    tags: string;
    isPublic: boolean;
    done: boolean;
    progress: any;
}

export default class PublishBlade extends Component<void, IPublishBladeState> {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            description: "",
            tags: "",
            isPublic: false,
            done: false,
            progress: null
        };
    }

    componentDidMount() {
        super.componentDidMount();
        let pages = app.pagesWithSymbols();
        if (pages.length === 1) {
            this.pageSelected(pages[0]);
        }
    }

    private pageSelected = (page: IPage) => {
        this.setState({ page: page, dataUrl: page.toDataURL({ width: 512, height: 512 }) });
    }

    _publishPage = () => {
        // TODO: show progress bar here
        app.activePage.export().then(data => {
            ShareProxy.publish({
                name: this.state.name || '',
                description: this.state.description || '',
                tags: this.state.tags || '',
                isPublic: !!this.state.isPublic,
                pageData: JSON.stringify(data),
                previewPicture: this.state.dataUrl
            })
                .then((result) => {
                    this.setState({ done: true });
                    this.props.completed(this.state.isPublic, result.data);
                })
        });
    };

    _onChangeName = (event) => {
        this.setState({ name: event.target.value });
    };

    _onChangePublic = (event) => {
        this.setState({ isPublic: event.target.value });
    };

    _onDescriptionChange = (event) => {
        this.setState({ description: event.target.value });
    };

    _onChangeTags = (event) => {
        this.setState({ tags: event.target.value });
    };

    _openAvatarEditor = (ev) => {
        this.context.bladeContainer.addChildBlade(`blade_edit-project-avatar`, EditImageBlade, this.formatLabel("@caption.editCover"),
            {
                page: this.state.page,
                onComplete: this.imageEditCompleted
            });
    };

    private imageEditCompleted = (res: ImageEditorResult) => {
        this.context.bladeContainer.close(2);
        if (res) {
            if (res.type === "element") {
                this.setState({dataUrl: Workspace.view.renderElementToDataUrl(res.element, PreviewSize)});
            }
        }
    }

    _clearAvatar = (ev) => {

    };

    _saveToDisk() {

        electronEndpoint.saveResource(() => {
            return app.activePage.export().then(data => {
                return {
                    name: this.state.name,
                    data: data,
                    description: this.state.description,
                    tags: this.state.tags,
                    image: this.state.dataUrl
                }
            });

        });
    }

    _renderPublishButton() {
        if (app.isElectron()) {
            return <MarkupLine>
                <GuiButton mods="submit" onClick={this._saveToDisk.bind(this)} caption="btn.save" defaultMessage="Save"
                    icon={true} />
            </MarkupLine>
        }

        return <MarkupLine>
            {
                (this.state.progress == null)
                    ?
                    <GuiButton mods="submit" onClick={this._publishPage} caption="btn.publish" defaultMessage="Publish"
                        icon={true} />
                    :
                    <GuiButton mods="submit" onClick={this._publishPage} caption="btn.publish" defaultMessage="Publish"
                        icon={true} progressColor="rgba(255,255,255,.2)" progressPercents={this.state.progress} />
            }

        </MarkupLine>
    }

    render() {
        var dataUrl = "url('" + this.state.dataUrl + "')"
        return <BladeBody>
            <MarkupLine>
                <div className="gui-input">
                    <p className={"gui-input__label"}>
                        <FormattedMessage id="@publish.choosePage" />
                    </p>
                    {this.renderPageSelect()}
                </div>
            </MarkupLine>

            <MarkupLine>
                <p className={"gui-input__label"}>
                    <FormattedMessage id="@publish.choosePage1" defaultMessage="Create your cover" />
                </p>
            </MarkupLine>
            <MarkupLine className="project-settings__avatar">
                <figure className="project-settings__avatar-image"
                    style={{ backgroundImage: "url('" + this.state.dataUrl + "')" }}
                />
                <GuiButtonStack className="project-settings__avatar-controls">
                    <GuiButton
                        mods="hover-success"
                        icon="edit"
                        onClick={this._openAvatarEditor}
                    />
                    <GuiButton
                        mods="hover-cancel"
                        icon="trash"
                        onClick={this._clearAvatar}
                    />
                </GuiButtonStack>
            </MarkupLine>

            <MarkupLine mods="space">
                <GuiInput value={this.state.projectName} onChange={this._onChange} caption="@publish.name" placeholder="Give it some cool name"/>
            </MarkupLine>

            <MarkupLine>
                <GuiTextArea value={this.state.projectName} onChange={this._onChange} caption="@publish.description" placeholder="What inspired you?"/>
            </MarkupLine>
            <MarkupLine>
                <GuiInput value={this.state.projectName} onChange={this._onChange} caption="@tags" placeholder="buttons, ios, flat, etc"/>
            </MarkupLine>

            <MarkupLine>
                <div className="gui-input">
                    <p className={"gui-input__label"}>
                        <FormattedMessage id="translateme!" defaultMessage={"Тип все дела"} />
                    </p>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={true} onChange={console.log} data-option="activeArtboard"/>
                        <i />
                        <span><FormattedMessage id="@publish.public"/></span>
                    </label>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={false} onChange={console.log} data-option="activePage"/>
                        <i />
                        <FormattedMessage id="@publish.private"/>
                    </label>

                </div>
            </MarkupLine>

            {this._renderPublishButton()}
        </BladeBody>
    }

    private renderPageSelect() {
        let pages = app.pagesWithSymbols();
        let caption = pages.length ? "@choosePages" : "@noPagesWithSymbols";

        return <PageSelect
            className="drop_down"
            selectedItem={this.state.page}
            items={pages}
            renderItem={page => <p>{page.name()}</p>}
            caption={caption}
            onSelect={this.pageSelected}>
        </PageSelect>;
    }

    static contextTypes = {
        intl: React.PropTypes.object,
        bladeContainer: React.PropTypes.any
    }
}
