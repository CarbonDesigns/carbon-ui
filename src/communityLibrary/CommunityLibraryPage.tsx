import React, { PropTypes } from "react";
import { FormattedMessage } from 'react-intl';
import { Link } from "react-router";

import { backend, util } from "carbon-api";
import { handles, Component, CarbonLabel } from "../CarbonFlux";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import TopMenu from "../shared/TopMenu";
import bem from "../utils/commonUtils";
import InfiniteGrid from "../shared/collections/InfiniteGrid";
import { ISharedResource, IPaginatedResult } from "carbon-core";


// function debounce(func, wait, immediate?) {
//     var timeout;
//     return function () {
//         var context = this, args = arguments;
//         var later = function () {
//             timeout = null;
//             if (!immediate) { func.apply(context, args); }
//         };
//         var callNow = immediate && !timeout;
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//         if (callNow) { func.apply(context, args); }
//     };
// }


function SearchTag(props) {
    return <div className="search-tag" onClick={() => {
            props.host.setState({ searchText: "tags:" + props.text });
            props.host._resetSearch();
        }}>
        {props.text}
    </div>
}

function GalleryListItem(props) {
    var item = props.item;
    return <div className={bem("gallery-item")} onClick={() => props.host.goToItem(item)} style={{ backgroundImage: "url('" + item.coverUrl + "')" }}>
        <div className={bem("gallery-item", "downloads")}>{item.timesUsed}</div>
        <h2 className={bem("gallery-item", "name")}>{item.name}</h2>
        <h3 className={bem("gallery-item", "tags")}>{item.tags}</h3>
    </div>
}

interface CommunityLibraryPageState {
    searchText: string;
    loading: boolean;
}


type ResourceGrid = new (props) => InfiniteGrid<ISharedResource>;
const ResourceGrid = InfiniteGrid as ResourceGrid;

export default class CommunityLibraryPage extends RouteComponent<IRouteComponentProps, CommunityLibraryPageState>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    refs: {
        grid: InfiniteGrid<ISharedResource>;
    }

    private onLoadMore = (startIndex: number, stopIndex: number) => {
        let promise: Promise<IPaginatedResult<ISharedResource>> = null;

        promise = backend.galleryProxy.resources(startIndex, stopIndex, this.state.searchText);
        promise.then(()=>{
            if(this.state.searchText === "") {
                this.context.router.replace("/library");
            } else {
                this.context.router.replace("/library?s="+this.state.searchText);
            }
        });
        return promise.finally(() => this.setState({ loading: false }));
    };

    private _noItemsFound() {
        return <div className={bem("gallery-list-container", "noresult")}><CarbonLabel id="@gallery.noitems"/></div>
    }

    private renderTiles() {
        var res = [];
        if (this.state.loading) {
            res.push(<FormattedMessage tagName="p" id="@loading" />)
        }

        res.push(<ResourceGrid ref="grid" windowScroll={true} cellHeight={345} cellWidth={300}
            loadMore={this.onLoadMore}
            cellRenderer={resource =>
                <GalleryListItem
                    host = {this}
                    item={resource}
            />}
            noContentRenderer={this._noItemsFound}
            />);
        return res;
    }


    _resetSearch: () => void;

    constructor(props) {
        super(props);
        this.state = { searchText: props.location.query.s || "", loading: false };
        this._resetSearch = util.debounce(() => {
            this.setState({ loading: true });
            this.refs.grid.reset();
        }, 400);
    }

    componentDidMount() {
        super.componentDidMount();
    }

    _onTextChange = (event) => {
        this.setState({ searchText: event.target.value });
        this._resetSearch();
    }

    goToItem(item) {
        this.context.router.push({
            pathname:"/resource/"+item.galleryId,
            state:{data:item}
        })
    }

    render() {
        return <div className="library-page">
            <TopMenu location={this.props.location} dark={true} />

            <section className="libraryheader-container smooth-header section-center">
                <h1 className={bem("libraryheader-container", "h")}><CarbonLabel id="@library.header" /></h1>
            </section>

            <section className="searchlib-container section-center">
                <input value={this.state.searchText} onChange={this._onTextChange} className={bem("searchlib-container", "input")} type="text" placeholder={this.context.intl.formatMessage({ id: "@search.placeholder" })}></input>
            </section>

            <section className="searchtags-container section-center">
                <SearchTag text="ios" host={this}></SearchTag>
                <SearchTag text="icons" host={this}></SearchTag>
                <SearchTag text="android" host={this}></SearchTag>
                <SearchTag text="landing" host={this}></SearchTag>
            </section>

            <section className="gallery-list-container">
                {this.renderTiles()}
            </section>

            <section className="subscribe-container">
                <p className="subscribe-container__details"><CarbonLabel id="@subscribe.details" /></p>
                <form className="subscribe-form">
                    <input type="text" className="subscribe-form__email" placeholder={this.context.intl.formatMessage({ id: "@email.placeholder" })} />
                    <button className="subscribe-form__button"><CarbonLabel id="@subscribe" /></button>
                </form>
            </section>
        </div>;
    }
}