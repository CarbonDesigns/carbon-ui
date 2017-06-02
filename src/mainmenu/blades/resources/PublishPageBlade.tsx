import React from "react";
import BladePage from "../BladePage";
import { app, backend, ShareProxy, IPage } from "carbon-core";
import { Component } from "../../../CarbonFlux";
import cx from 'classnames';
import { FormattedMessage } from "react-intl";
import { Markup, MarkupLine } from "../../../shared/ui/Markup";
import { GuiButton } from "../../../shared/ui/GuiComponents";
import { BladeBody } from "../BladePage";
import electronEndpoint from "electronEndpoint";
import GuiSelect from "../../../shared/ui/GuiSelect";
import bem from "../../../utils/commonUtils";

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

    private pageSelected(index: number) {
        var page = app.pagesWithSymbols()[index];
        if (page) {
            this.setState({ page: page, dataUrl: page.toDataURL({ width: 512, height: 512 }) });
        }
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
                <figure>
                    <div style={{ backgroundImage: dataUrl }} className="publish__preview"></div>
                </figure>
            </MarkupLine>

            <MarkupLine>
                <label className="gui-input">
                    <p><FormattedMessage id="sharepage.name" defaultMessage="Name" /></p>
                    <input type="text" value={this.state.name} onChange={this._onChangeName} placeholder="Name" />
                </label>
            </MarkupLine>

            <MarkupLine>
                <label className="gui-textarea">
                    <p><FormattedMessage id="story.description" /></p>
                    <textarea style={{ width: '100%', height: 141 }} value={this.state.description}
                        onChange={this._onDescriptionChange} />
                </label>
            </MarkupLine>

            <MarkupLine>
                <label className="gui-check">
                    <input type="checkbox" value={this.state.isPublic} onChange={this._onChangePublic} />
                    <i />
                    <FormattedMessage tagName="span" id="sharepage.scope" defaultMessage="Is public?" />
                </label>
            </MarkupLine>

            <MarkupLine>
                <label className="gui-input">
                    <p><FormattedMessage id="sharepage.tags" defaultMessage="Tags" /></p>
                    <input type="text" value={this.state.tags} onChange={this._onChangeTags}
                        placeholder="tag1;tag2;..." />
                </label>
            </MarkupLine>

            {this._renderPublishButton()}
        </BladeBody>
    }

    private renderPageSelect() {
        let pages = app.pagesWithSymbols();
        let selectedItem = pages.indexOf(this.state.page);
        let caption = pages.length ? "Select page" : "No pages with symbols found";

        return <GuiSelect
            className="drop_down_no-padding"
            selectedItem={selectedItem}
            renderDefault={() => caption}
            onSelect={console.log}>
            {pages.map((page, ind) => <p
                key={page.id()}
                className={bem("publish", "pages-list-item", { selected: (ind === selectedItem) })}>{page.name()}
            </p>)}
        </GuiSelect>;
    }
}
