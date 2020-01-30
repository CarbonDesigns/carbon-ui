import * as React from "react";
import { dispatchAction, Component } from "../CarbonFlux";
import { FormattedMessage } from "react-intl";
import { backend, ISharedResource, IPaginatedResult } from "carbon-core";
import { TabContainer, TabTabs} from "../shared/TabContainer";
import Search from "../shared/Search";
import ResourceSharer from "../library/ResourceSharer";
import ResourceDetails from "./ResourceDetails";
import ResourceTile from "./ResourceTile";
import InfiniteGrid from "../shared/collections/InfiniteGrid";
import { TabAreaStyled, TabPageStyled, LineBottom } from "../components/CommonStyle";
import styled from "styled-components";
import * as cx from "classnames";
import theme from "../theme";

const TabBuiltIn = "1";
const TabGallery = "2";
const TabCompany = "3";
const TabSearch = "4";

interface ImportResourceControlProps {
    tags?: string;
    query?: string;
}

type ImportResourceControlState = {
    loading: boolean;
    tabId: string;
    selectedResource?: ISharedResource;
    query?: string;
}

type ResourceGrid = new (props) => InfiniteGrid<ISharedResource>;
const ResourceGrid = InfiniteGrid as ResourceGrid;

export default class ImportResourceControl extends Component<{}, ImportResourceControlState>{
    refs: {
        grid: InfiniteGrid<ISharedResource>;
    }

    constructor(props: ImportResourceControlProps) {
        super(props);

        let query = this.getQueryFromProps(props);
        this.state = {
            loading: false,
            tabId: query ? TabGallery : TabBuiltIn,
            query
        };
    }

    componentWillReceiveProps(nextProps: Readonly<ImportResourceControlProps>) {
        let query = this.getQueryFromProps(nextProps);
        this.setState({
            query,
            tabId: query ? TabGallery : this.state.tabId
        });
    }

    private getQueryFromProps(props: ImportResourceControlProps) {
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
            });
    }

    private renderTiles() {
        if (this.state.loading) {
            return <FormattedMessage tagName="p" id="@loading" />
        }

        return <ResourceGrid ref="grid" cellHeight={208} cellWidth={206}
            loadMore={this.onLoadMore}
            windowScroll={true}
            cellRenderer={resource =>
                <ResourceTile
                    resource={resource}
                    showDownloads={this.state.tabId !== TabBuiltIn}
                    onClick={this.openDetails}
                />} />
    }

    render() {
        return <ImportResourceContainer className={cx({"details-open": !!this.state.selectedResource })}>
                <Search className="_search-field" query={this.state.query} onQuery={this.onSearch} />
                <TabContainer type="normal" className="resources-list" onTabChanged={this.onTabChanged} currentTabId={this.state.tabId}>
                    <TabTabs tabClassName="_tab-header" tabMods="nogrow"
                        items={[
                            <FormattedMessage tagName="div" id="@import.builtin" />,
                            <FormattedMessage tagName="div" id="@import.gallery" />,
                            <FormattedMessage tagName="div" id="@import.team" />
                        ]}
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

            <div className="_panel_details">
                <ResourceDetails resource={this.state.selectedResource}
                    onSelected={this.importResource}
                    onCancelled={this.closeDetails} />
            </div>
        </ImportResourceContainer>
    }
}

const ImportResourceContainer = styled.div`
    position:relative;
    width:100%;
    height:100%;

    /* .med(0, 750, {width: 40rem}); */

    ._search-field {
        width:100%;
        position:relative;
        &::after {
            ${LineBottom};
        }
    }

    .tabs {
        width: 100%;
        height:51px;
        position:relative;
        &::after {
            ${LineBottom};
        }

        font: ${theme.tabs_font};
        margin: auto 0;
        display: flex;
        align-items:center;

        & .tab {
            margin-right: ${theme.margin2};
            color: ${theme.text_inactive};
            cursor: pointer;
        }

        & .tab.active {
            color: ${theme.text_color};
        }
    }

    &.details-open ._panel_details {
       /* // .trn(left .2s linear); */
        left: 0;
    }

    ._panel_details {
        /* // background: @bg4_panel_body; */
        /* //.trn(left .1s linear); */
        position:absolute;
        left: 100%;
        width: 100%;
        top: 0;
        bottom:0;
    }
`;