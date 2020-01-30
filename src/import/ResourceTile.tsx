import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction, CarbonLabel } from "../CarbonFlux";
import { ISharedResource } from "carbon-api";
import ResourceTags from "./ResourceTags";
import theme from "../theme";
import styled from "styled-components";

type ResourceTileProps = {
    resource: ISharedResource;
    showDownloads: boolean;
    onClick: (resource: ISharedResource) => void;
}

export default class ResourceTile extends Component<ResourceTileProps> {
    render() {
        var imgStyle = { backgroundImage: "url('" + this.props.resource.coverUrl + "')" };
        return (
            <ResourceTileContainer onClick={() => this.props.onClick(this.props.resource)}>
                <div className="_image" style={imgStyle} />

                <div className="_meta">
                    <div className="_name">
                        <span>{this.props.resource.name}</span>
                    </div>

                    {/* <ResourceTags tags={this.props.resource.tags} /> */}

                    <div className="_bottom">
                        <span className="_author">
                            <span className="_author-avatar" />
                            <CarbonLabel tagName="span" id="@resource.by"/>
                            <span className="_author-name">{this.props.resource.authorName}</span>
                        </span>

                        <span className="_indicators">
                            {this.props.showDownloads && <span className="resource__downloads">
                                <span className="resource__downloads-icon"><i className="ico-download" /></span>
                                <span className="resource__downloads-number">{this.props.resource.timesUsed}</span>
                            </span>}
                        </span>
                    </div>

                </div>
            </ResourceTileContainer>
        );
    }
}

const ResourceTileContainer = styled.div`
    cursor:pointer;
    width: 206px;
    height: 208px;
    margin: ${theme.margin1} 0;
    border-radius: 2px;
    overflow: hidden;
    padding-right: 28px;
    padding-top: 20px;

    &:hover {
        /* .wbg(5); */
    }

    & ._image {
        width: 100%;
        background-size: cover;
        height: auto;
        padding-bottom: 69%;
        background-repeat: no-repeat;
    }

    & ._meta {
        padding-top: ${theme.margin1};
    }

    & ._name {
        cursor:pointer;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-right: .2em;
        font:${theme.h2font};
        color: ${theme.text_color};
    }

    & ._description {
        /* .hide; */
        margin-top: ${theme.margin1};
        height: 2.4em;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    & ._tags {
        margin-top: ${theme.margin1};
        /* .f11; */
        overflow: hidden;
        text-overflow: ellipsis;
    }

    & ._tag {
        /* .nowrap; */
        padding: ${theme.margin1} 0;
        /* color: fadeout(@font_color, 50%); */

        &:hover {
            /* color: fadeout(@font_color, 30%); */
        }
        &:after {
            content: ", "
        }
        &:last-child:after {
            content: "";
        }

        &-title {

        }
    }

    & ._bottom {
        margin-top: .8rem;
        /* .flexstretch(); */
        /* .f11; */
    }

    & ._author {
        color: ${theme.text_inactive};
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font:${theme.h3font};
        padding-right: 4px;
        &-avatar {
            /* .rounded(2); */
            /* .size(1.4rem);
            .inbl;
            .bgpic();
            .wbg(5);
            */
            position:relative;
            bottom: -.2rem;
        }
        &-name {
        }
    }

    & ._indicators {
        margin-left: auto;
        margin-right: -.4em;
    }
`;