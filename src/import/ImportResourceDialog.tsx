import * as React from "react";
import { dispatchAction } from "../CarbonFlux";
import DialogRegistry from "../dialogs/DialogRegistry";
import Dialog from "../dialogs/Dialog";
import { FormattedMessage } from "react-intl";
import { backend, ISharedResource, IPaginatedResult } from "carbon-core";
import { TabContainer, TabTabs} from "../shared/TabContainer";
import Search from "../shared/Search";
import ResourceSharer from "../library/ResourceSharer";
import bem from '../utils/commonUtils';
import ResourceDetails from "./ResourceDetails";
import ResourceTile from "./ResourceTile";
import InfiniteGrid from "../shared/collections/InfiniteGrid";
import { TabAreaStyled, TabPageStyled } from "../components/CommonStyle";

const TabBuiltIn = "1";
const TabGallery = "2";
const TabCompany = "3";
const TabSearch = "4";

interface ImportResourceDialogProps {
    tags?: string;
    query?: string;
}

type ImportPageDialogState = {
    loading: boolean;
    tabId: string;
    selectedResource?: ISharedResource;
    query?: string;
}

type ResourceGrid = new (props) => InfiniteGrid<ISharedResource>;
const ResourceGrid = InfiniteGrid as ResourceGrid;

export default class ImportResourceDialog extends Dialog<{}, ImportPageDialogState>{
    refs: {
        grid: InfiniteGrid<ISharedResource>;
    }

    constructor(props: ImportResourceDialogProps) {
        super(props);

        let query = this.getQueryFromProps(props);
        this.state = {
            loading: false,
            tabId: query ? TabGallery : TabBuiltIn,
            query
        };
    }

    componentWillReceiveProps(nextProps: Readonly<ImportResourceDialogProps>) {
        let query = this.getQueryFromProps(nextProps);
        this.setState({
            query,
            tabId: query ? TabGallery : this.state.tabId
        });
    }

    close() {
        if (this.state.selectedResource) {
            this.closeDetails();
        }
        else {
            super.close();
        }
    }

    private getQueryFromProps(props: ImportResourceDialogProps) {
        let query = "";
        if (props.tags) {
            query = "tags:" + props.tags + " ";
        }
        if (props.query) {
            query += props.query;
        }
        return query;
    }

    private onTabChanged = (tabId: string) => {
        this.setState({ tabId });
    };

    private onSearch = (query) => {
        this.setState({ query });
        this.refs.grid.reset();
    };

    private onLoadMore = (startIndex: number, stopIndex: number) => {
        //this.setState({ loading: true });

        let promise: Promise<IPaginatedResult<ISharedResource>> = null;
        if (this.state.tabId === TabBuiltIn) {
            promise = backend.staticResourcesProxy.staticResources(startIndex, stopIndex, this.state.query);
        }
        else if (this.state.tabId === TabGallery) {
            promise = backend.galleryProxy.resources(startIndex, stopIndex, this.state.query);
        }
        else {
            promise = backend.shareProxy.resources(startIndex, stopIndex, this.state.query);
        }

        return promise.finally(() => this.setState({ loading: false }));
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
            .then(data => ResourceSharer.importPage(data))
            .then(page => {
                dispatchAction({ type: "Symbols_ChangePage", page });
                super.close();
            });
    }

    private renderTiles() {
        if (this.state.loading) {
            return <FormattedMessage tagName="p" id="@loading" />
        }

        return <ResourceGrid ref="grid" cellHeight={280} cellWidth={200}
            loadMore={this.onLoadMore}
            cellRenderer={resource =>
                <ResourceTile
                    resource={resource}
                    showDownloads={this.state.tabId !== TabBuiltIn}
                    onClick={this.openDetails}
                />} />
    }

    renderHeader() {
        return <FormattedMessage id="@import.header" tagName="h3" />;
    }

    renderBody() {
        return <div className={bem("import-resource-dialog", null, { "details-open": !!this.state.selectedResource })}>
            <div className="import-resource-dialog__panel  import-resource-dialog__panel_list">
                <TabContainer type="normal" className="resources-list" onTabChanged={this.onTabChanged} currentTabId={this.state.tabId}>
                    <TabTabs tabClassName="resources-list__tab-header" tabMods="nogrow"
                        items={[
                            <FormattedMessage tagName="h5" id="@import.builtin" />,
                            <FormattedMessage tagName="h5" id="@import.gallery" />,
                            <FormattedMessage tagName="h5" id="@import.team" />
                        ]}
                        insertAfter={<Search className="resources-list__search-field" query={this.state.query} onQuery={this.onSearch} />}
                    />
                    <TabAreaStyled>
                        <TabPageStyled tabId={TabBuiltIn}>
                            {this.renderTiles()}
                        </TabPageStyled>
                        <TabPageStyled tabId={TabGallery}>
                            {this.renderTiles()}
                        </TabPageStyled>
                        <TabPageStyled tabId={TabCompany}>
                            {this.renderTiles()}
                        </TabPageStyled>
                    </TabAreaStyled>

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