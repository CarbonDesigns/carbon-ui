import React from "react";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction } from "../CarbonFlux";
import { ISharedResource } from "carbon-api";
import ResourceTags from "./ResourceTags";

type ResourceTileProps = {
    resource: ISharedResource;
    showDownloads: boolean;
    onClick: (resource: ISharedResource) => void;
}

export default class ResourceTile extends Component<ResourceTileProps> {
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

                    <ResourceTags tags={this.props.resource.tags} />

                    <div className="resource-tile__bottom">
                        <span className="resource-tile__author">
                            <span className="resource-tile__author-avatar" />
                            <span className="resource-tile__author-name">{this.props.resource.authorName}</span>
                        </span>

                        <span className="resource-tile__indicators">
                            {this.props.showDownloads && <span className="resource__downloads">
                                <span className="resource__downloads-icon"><i className="ico-download" /></span>
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