import React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import { GuiButton, GuiButtonBlock } from "../shared/ui/GuiComponents";
import DialogRegistry from "../dialogs/DialogRegistry";
import Dialog from "../dialogs/Dialog";
import { FormattedMessage } from "react-intl";
import { app, backend, IDisposable, ISharedResource } from "carbon-core";
import { default as TabContainer, TabTabs, TabHeader, TabPage, TabArea } from "../shared/TabContainer";
import { Markup, MarkupLine, MarkupSubmit } from "../shared/ui/Markup";
import Search from "../shared/Search";
import bem from '../utils/commonUtils';

const TabBuiltIn = "1";
const TabGallery = "2";
const TabCompany = "3";
const TabSearch = "4";

interface IImportPageDialogState {
    loading: boolean;
    tabId: string;
    resources?: ISharedResource[];
    selectedResource?: ISharedResource;
}

export default class ImportResourceDialog extends Dialog<{}, IImportPageDialogState>{
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            tabId: TabBuiltIn
        };
        //
        // this._debounceSearch = util.debounce((search)=>{
        //     ShareProxy.resources(search).then((data)=> {
        //         data.loading = false;
        //         this.setState(data);
        //     })
        // }, 400);
    }

    componentDidMount() {
        super.componentDidMount();
        this.onTabChanged(TabBuiltIn);
    }

    private onTabChanged = (tabId) => {
        this.setState({tabId, loading: true});

        let promise: Promise<ISharedResource[]> = null;
        if (tabId === TabBuiltIn) {
            promise = backend.staticResourcesProxy.staticResources();
        }
        else if (tabId === TabGallery) {
            promise = backend.shareProxy.resources();
        }
        //todo

        promise.then(resources => this.setState({ resources }))
            .finally(() => this.setState({loading: false}));
    };

    private openDetails = (resource: ISharedResource) => {
        this.setState({ selectedResource: resource });
    };

    private importResource = () => {
        fetch(this.state.selectedResource.dataUrl)
            .then(response => response.json())
            .then(data => app.importPage(data));
        //TODO: action
    }

    private renderTiles() {
        if (this.state.loading) {
            return <FormattedMessage tagName="p" id="@loading" />
        }

        if (!this.state.resources.length) {
            return <FormattedMessage tagName="p" id="@empty" />
        }
        return <div className="tile-container">
            {this.state.resources.map(resource => <ResourceTile
                key={this.state.tabId + resource.name}
                resource={resource}
                showDownloads={this.state.tabId !== TabBuiltIn}
                onClick={this.openDetails}
            />)}
        </div>
    }
    // _onSearch=(e)=>{
    //     var searchString = e.target.value;
    //     this.setState({loading:true, searchString:searchString});
    //     this._debounceSearch(searchString);
    // };
    //

    // _renderList() {
    //     return
    // }

    renderHeader() {
        return <FormattedMessage id="@import.header" tagName="h2" />;
    }

    private renderDetails() {
        if (!this.state.selectedResource) {
            return null;
        }

        return <div className="resource-import-details">
            <MarkupLine>
                <figure>
                    <div className="resource-import-details__gallery">
                        <div className="resource-import-details__slides">
                            {/* todo    If slide is active =>  .resource-import-details__slide_active  */}
                            <div className="resource-import-details__slide  resource-import-details__slide_active ">
                                <img ref="preview" src={'/target/1/image.png'} className="resource-import-details__preview-img" />
                            </div>
                            <div className="resource-import-details__slide" style={{ backgroundImage: `url('${this.state.selectedResource.coverUrl}')`, }}>
                                <img ref="preview" src={'/target/2/image.png'} className="resource-import-details__preview-img" />
                            </div>
                        </div>

                        {/* todo    If thumbs.length >= 1*/}
                        {/*<div className="resource-import-details__thumbs">*/}
                            {/* todo    If thumb  is active =>  .resource-import-details__thumb_active  */}
                            {/*<div className="resource-import-details__thumb  resource-import-details__thumb_active" style={{ backgroundImage: `url('${details.imageUrl}')` }} />
                            <div className="resource-import-details__thumb" style={{ backgroundImage: `url('/target/1/image.png')` }} />
                            <div className="resource-import-details__thumb" style={{ backgroundImage: `url('/target/2/image.png')` }} />
                        </div>*/}
                    </div>
                </figure>
            </MarkupLine>

            <MarkupLine>
                <div className="resource-import-details__name">{this.state.selectedResource.name}</div>
            </MarkupLine>

            <MarkupLine>
                <p>{this.state.selectedResource.description}</p>
            </MarkupLine>

            <MarkupLine>
                <p className="resource-import-details__tags">
                    {<span className="resource-import-details__tag"><span className="resource-import-details__tag-title">{this.state.selectedResource.tags}</span></span>}
                    {splitTags(this.state.selectedResource.tags).map(tag =>
                        <span className="resource-import-details__tag" key={tag}>
                            <span className="resource-import-details__tag-title">{tag}</span>
                        </span>
                    )}
                </p>
            </MarkupLine>

            <MarkupLine>
                <div className="markup-heading markup-heading_faded "><FormattedMessage id="TRANSLATEME!!!" defaultMessage="Author" /></div>
                <div className="resource-import-details__author">
                    <div className="resource-import-details__author-avatar" style={{ backgroundImage: `url('${this.state.selectedResource.author.avatar}')` }} />
                    <span className="resource-import-details__author-name">{this.state.selectedResource.author.name}</span>
                </div>
            </MarkupLine>

            <MarkupSubmit>
                <GuiButtonBlock>
                    <GuiButton mods="submit" onClick={this.openDetails} caption="TRANSLATEME!!!" defaultMessage="Import resource" />
                    <GuiButton mods="hover-cancel" onClick={this.openDetails} caption="TRANSLATEME!!!" defaultMessage="Cancel import" />
                </GuiButtonBlock>
            </MarkupSubmit>
        </div>
    }

    renderBody() {
        return <div className={bem("import-resource-dialog", null, { "details-open": !!this.state.selectedResource })}>
            <div className="import-resource-dialog__panel  import-resource-dialog__panel_list">
                <TabContainer type="normal" className="resources-list">
                    <TabTabs
                        items={[
                            <FormattedMessage tagName="h5" id="translateme!" defaultMessage="Built-in" />,
                            <FormattedMessage tagName="h5" id="translateme!" defaultMessage="Public" />,
                            <FormattedMessage tagName="h5" id="translateme!" defaultMessage="My" />,
                            <i className="ico--search" />,
                        ]}
                    />
                    <TabArea className="gui-pages">
                        <TabPage className="gui-page" tabId={TabBuiltIn}>
                            {this.renderTiles()}
                        </TabPage>
                        <TabPage className="gui-page" tabId={TabGallery}>
                            {this.renderTiles()}
                        </TabPage>
                        <TabPage className="gui-page" tabId={TabCompany}>
                            {this.renderTiles()}
                        </TabPage>

                        <TabPage className="gui-page" tabId={TabSearch}>
                            <div className="resources-list__search">
                                <Search onQuery={console.log} ref="search" />
                            </div>
                            {this.renderTiles()}
                        </TabPage>
                    </TabArea>

                </TabContainer>
            </div>

            <div className="import-resource-dialog__panel  import-resource-dialog__panel_details">
                {this.renderDetails()}
            </div>
        </div>
    }
}

interface IResourceTileProps {
    resource: ISharedResource;
    showDownloads: boolean;
    onClick: (resource: ISharedResource) => void;
}
export class ResourceTile extends Component<IResourceTileProps> {
    render() {
        var imgStyle = { backgroundImage: "url('" + this.props.resource.coverUrl + "')" };
        return (
            <div className="resource-tile" onClick={() => this.props.onClick(this.props.resource)}>
                <div className="resource-tile__image" style={imgStyle} />

                <div className="resource-tile__meta">
                    <div className="resource-tile__name">
                        <span>{this.props.resource.name}</span>
                    </div>

                    {/*<p className="resource-tile__description"> Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl. </p> */}

                    <div className="resource-tile__tags">
                        {splitTags(this.props.resource.tags).map(tag =>
                            <span className="resource-tile__tag" key={tag}>
                                <span className="resource-tile__tag-title">{tag}</span>
                            </span>
                        )}
                    </div>

                    <div className="resource-tile__bottom">
                        <span className="resource-tile__author">
                            <span className="resource-tile__author-avatar" style={{ backgroundImage: `url('/target/1/image.png')` }} />
                            <span className="resource-tile__author-name">{this.props.resource.author.name}</span>
                        </span>

                        <span className="resource-tile__indicators">
                            {this.props.showDownloads && <span className="resource__downloads">
                                <span className="resource__downloads-icon"><i className="ico--download" /></span>
                                <span className="resource__downloads-number">{this.props.resource.downloads}</span>
                            </span>}
                            {/* <span className="resource__rating"> <span className="resource__rating-icon"><i className=""></i></span> <span className="resource__rating-number">4.5</span> </span>*/}
                        </span>
                    </div>

                </div>
            </div>
        );
    }
}

export function splitTags(tags: string): string[]{
    return tags.split(',').map(x => x.trim());
}

DialogRegistry.register("ImportResourceDialog", ImportResourceDialog);