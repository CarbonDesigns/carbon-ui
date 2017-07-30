import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from 'react-intl';
import { Link } from "react-router";

import { backend } from "carbon-api";
import { handles, Component, CarbonLabel } from "../CarbonFlux";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import TopMenu from "../shared/TopMenu";
import SubscribeForm from "../shared/SubscribeForm";
import bem from "../utils/commonUtils";
import { ISharedResource, IPaginatedResult } from "carbon-core";
import cx from "classnames";


function SearchTag(props) {
    return <div className="search-tag">
        {props.text}
    </div>
}

function buildSymbol(name) {
    var parts = name.split(' ');
    if(parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toLowerCase();
    }

    if(name.length < 2) {
        return name.toLowerCase();
    }

    return name.substr(0,2).toLowerCase();
}

function GalleryListItem(props) {
    var item = props.item;
    return <div className={bem("gallery-item")} onClick={() => props.host.goToItem(item.id)} style={{ backgroundImage: "url('" + item.coverUrl + "')" }}>
        <div className={bem("gallery-item", "downloads")}>{item.downloadCount}</div>
        <h2 className={bem("gallery-item", "name")}>{item.name}</h2>
        <h3 className={bem("gallery-item", "tags")}>{item.tags}</h3>
    </div>
}

interface CommunityLibraryPageState {
    data:any;
}

export default class CommunityLibraryPage extends RouteComponent<IRouteComponentProps, CommunityLibraryPageState>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);
        if(props.location.state && props.location.state.data) {
            this.state = { data:props.location.state.data };
        } else {
            this.state = {data:null};
            backend.galleryProxy.resource(props.params.id).then(data=>{
                this.setState({data:data});
            })
        }
    }

    _openSymbol(dataUrl) {
        this.context.router.push({
            pathname:"/app",
            state: {
                dataUrl:dataUrl
            }
        })
    }

    componentDidMount() {
        super.componentDidMount();
    }

    renderTags(tagsString) {
        if(!tagsString) {
            return;
        }

        var tags = tagsString.split(',');

        return tags.map(t=><SearchTag text={t} key={t}/>)
    }


    render() {

        if(!this.state.data) {
            return <div></div>
        }
        var data = this.state.data;
        return <div className="resource-page">
            <TopMenu location={this.props.location} dark={true} />

            <section className="resource-details-container">
                <figure className="resource-details-image" style={{ backgroundImage: "url('" + data.coverUrl + "')" }}></figure>
                <div className="resource-details">
                    <h3 className={bem("resource-details", "symbol")}>{buildSymbol(data.name)}</h3>
                    <h1 className={bem("resource-details", "header")}>{data.name}</h1>
                    <div className={bem("resource-details", "tags")}>{this.renderTags(data.tags)}</div>
                    <article className={bem("resource-details", "description")}>{data.description}</article>
                    <figure className="resource-details__image" style={{ backgroundImage: "url('" + data.coverUrl + "')" }}></figure>
                    <label className={bem("resource-details", "dblabel")}>Designed by</label>
                    <div className={bem("resource-details", "designedby")}>{data.authorName||"carbonium"}</div>

                    <div className="resource-details__import-aligner">
                        <button onClick={()=>{this._openSymbol(data.dataUrl)}} className={cx("form-main-button", bem("resource-details", "import"))}>Open symbol</button>
                        <div className={bem("resource-details", "downloads")}>{data.timesUsed} downloads</div>
                    </div>
                </div>
            </section>

            <SubscribeForm mainTextLabelId="@subscribe.details"/>
        </div>;
    }
}