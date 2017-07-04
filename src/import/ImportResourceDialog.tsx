import React from "react";
import { AutoSizer, List } from "react-virtualized";
import { Component, dispatchAction } from "../CarbonFlux";
import { GuiButton, GuiButtonBlock } from "../shared/ui/GuiComponents";
import DialogRegistry from "../dialogs/DialogRegistry";
import Dialog from "../dialogs/Dialog";
import { FormattedMessage } from "react-intl";
import { app, backend, IDisposable, ISharedResource, IPaginatedResult } from "carbon-core";
import { default as TabContainer, TabTabs, TabHeader, TabPage, TabArea } from "../shared/TabContainer";
import { Markup, MarkupLine, MarkupSubmit } from "../shared/ui/Markup";
import Search from "../shared/Search";
import bem from '../utils/commonUtils';
import ResourceDetails from "./ResourceDetails";
import ResourceTile from "./ResourceTile";
import InfiniteGrid from "../shared/InfiniteGrid";

const TabBuiltIn = "1";
const TabGallery = "2";
const TabCompany = "3";
const TabSearch = "4";

type ImportPageDialogState = {
    loading: boolean;
    tabId: string;
    resources?: ISharedResource[];
    selectedResource?: ISharedResource;
}

type ResourceGrid = new (props) => InfiniteGrid<ISharedResource>;
const ResourceGrid = InfiniteGrid as ResourceGrid;

export default class ImportResourceDialog extends Dialog<{}, ImportPageDialogState>{
    refs: {
        grid: InfiniteGrid<ISharedResource>
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
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

    close() {
        if (this.state.selectedResource) {
            this.closeDetails();
        }
        else {
            super.close();
        }
    }

    private onTabChanged = (tabId) => {
        this.setState({ tabId });

        let promise: Promise<ISharedResource[]> = null;
        if (tabId === TabBuiltIn) {
            //promise = backend.staticResourcesProxy.staticResources();
        }
        else if (tabId === TabGallery) {
            //promise = backend.shareProxy.resources();
        }
        //todo

        // promise.then(resources => {
        //     var res = [];
        //     for (var index = 0; index < 100; index++) {
        //         var batch = resources.map(x => Object.assign({}, x));
        //         batch.forEach(x => x.name = x.name + " " + index);
        //         res = res.concat(batch);
        //     }
        //     this.setState({ resources: res })
        // })
        //     .finally(() => this.setState({loading: false}));
    };

    private onLoadMore = (startIndex: number, stopIndex: number) => {
        //this.setState({loading: true});

        let promise: Promise<IPaginatedResult<ISharedResource>> = null;
        if (this.state.tabId === TabBuiltIn) {
            promise = backend.staticResourcesProxy.staticResources(startIndex, stopIndex);
        }
        else if (this.state.tabId === TabGallery) {
            //promise = backend.shareProxy.resources();
        }
        //todo

        // promise.then(resources => {
        //     this.setState({ resources: res })
        // })
        //     .finally(() => this.setState({loading: false}));
        return promise;
    };

    private openDetails = (resource: ISharedResource) => {
        this.setState({ selectedResource: resource });
    };
    private closeDetails = () => {
        this.setState({ selectedResource: null });
    };

    private importResource = () => {
        fetch(this.state.selectedResource.dataUrl)
            .then(response => response.json())
            .then(data => app.importPage(data))
            .then(page => {
                dispatchAction({ type: "Stencils_ChangePage", page });
                super.close();
            });
    }

    private renderTiles() {
        if (this.state.loading) {
            return <FormattedMessage tagName="p" id="@loading" />
        }

        // if (!this.state.resources.length) {
        //     return <FormattedMessage tagName="p" id="@empty" />
        // }
        return <ResourceGrid ref="grid" cellHeight={280} cellWidth={200} flex
            loadMore={this.onLoadMore}
            cellRenderer={resource =>
                <ResourceTile
                    resource={resource}
                    showDownloads={this.state.tabId !== TabBuiltIn}
                    onClick={this.openDetails}
                />} />
        // return <div className="tile-container">
        //     {this.state.resources.map(resource => <ResourceTile
        //         key={this.state.tabId + resource.name}
        //         resource={resource}
        //         showDownloads={this.state.tabId !== TabBuiltIn}
        //         onClick={this.openDetails}
        //     />)}
        // </div>
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
        return <FormattedMessage id="@import.header" tagName="h3" />;
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

            <div className="import-resource-dialog__panel import-resource-dialog__panel_details">
                <ResourceDetails resource={this.state.selectedResource}
                    onSelected={this.importResource}
                    onCancelled={this.closeDetails} />
            </div>
        </div>
    }
}

DialogRegistry.register("ImportResourceDialog", ImportResourceDialog);