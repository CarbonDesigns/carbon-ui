import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from 'react-intl';
import { Link, InjectedRouter } from "react-router";
import { backend, util } from "carbon-api";
import { handles, Component, CarbonLabel } from "../CarbonFlux";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import TopMenu from "../shared/TopMenu";
import SubscribeForm from "../shared/SubscribeForm";
import bem from "../utils/commonUtils";
import InfiniteGrid from "../shared/collections/InfiniteGrid";
import { ISharedResource, IPaginatedResult } from "carbon-core";
import Search from "../shared/Search";
import { SearchTag } from "./SearchTag";

type ResourceGrid = new (props) => InfiniteGrid<ISharedResource>;
const ResourceGrid = InfiniteGrid as ResourceGrid;

interface CommunityLibraryPageProps {
    search: string;
    visible: boolean;
}

export default class CommunityLibraryPage extends Component<CommunityLibraryPageProps>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }
    context: {
        router: InjectedRouter
    }
    refs: {
        grid: InfiniteGrid
    }

    private lastSearch: string;

    componentDidUpdate(prevProps: CommunityLibraryPageProps) {
        if (this.props.visible && this.props.search !== this.lastSearch) {
            this.refs.grid.reset();
            this.lastSearch = this.props.search;
        }
    }

    private onLoadMore = (startIndex: number, stopIndex: number) => {
        return backend.galleryProxy.resources(startIndex, stopIndex, this.props.search);
    }

    private noItemsFound = () => {
        if (this.props.search) {
            return <div className={bem("gallery-list-container", "noresult")}><CarbonLabel id="@gallery.noitems" /></div>
        }
        return null;
    }

    private renderTiles() {
        return <ResourceGrid ref="grid" windowScroll={true} cellHeight={345} cellWidth={300}
            loadMore={this.onLoadMore}
            cellRenderer={this.renderTile}
            noContentRenderer={this.noItemsFound}
            spinnerMods="dark"
        />
    }

    private renderTile = (resource: ISharedResource) => {
        return <GalleryListItem item={resource} />
    }

    private onSearch = (text) => {
        let query: any = {};
        if (text) {
            query.s = text;
        }
        this.context.router.replace({
            pathname: "/library",
            query
        });
    }

    render() {
        return <div className={bem("library-page", null, { hidden: !this.props.visible }, "light-page")}>
            <section className="libraryheader-container smooth-header section-center">
                <h1 className={bem("libraryheader-container", "h")}><CarbonLabel id="@library.header" /></h1>
            </section>

            <section className="searchlib-container section-center">
                <Search query={this.props.search} onQuery={this.onSearch} className={bem("searchlib-container", "input")} autoFocus mods="dark" />
            </section>

            <section className="searchtags-container section-center">
                <SearchTag text="ios" />
                <SearchTag text="icons" />
                <SearchTag text="android" />
                <SearchTag text="landing" />
            </section>

            <section className="gallery-list-container">
                {this.renderTiles()}
            </section>

            <SubscribeForm mainTextLabelId="@subscribe.details" />
        </div>;
    }
}

function GalleryListItem(props) {
    var item = props.item;
    return <Link to={{ pathname: "/library/" + item.galleryId, state: { data: item }}}
        key={item.galleryId}
        className={bem("gallery-item")} style={{ backgroundImage: "url('" + item.coverUrl + "')" }}>
        <div className={bem("gallery-item", "overlay")}>
            <div className={bem("gallery-item", "row")}>
                <h2 className={bem("gallery-item", "name")}>{item.name}</h2>
                <div className={bem("gallery-item", "downloads")}>{item.timesUsed}</div>
            </div>
            <h3 className={bem("gallery-item", "tags")}>{item.tags}</h3>
        </div>
    </Link>
}