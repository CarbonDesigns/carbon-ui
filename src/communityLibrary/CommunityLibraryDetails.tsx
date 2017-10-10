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
import { SearchTag } from "./SearchTag";

function buildSymbol(name) {
    var parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toLowerCase();
    }

    if (name.length < 2) {
        return name.toLowerCase();
    }

    return name.substr(0, 2).toLowerCase();
}

interface CommunityLibraryDetailsProps {
    resourceId: string;
    data?: ISharedResource;
}

interface CommunityLibraryDetailsState {
    data: ISharedResource;
}

export default class CommunityLibraryDetails extends Component<CommunityLibraryDetailsProps, CommunityLibraryDetailsState>{
    constructor(props: CommunityLibraryDetailsProps) {
        super(props);

        this.state = this.getStateFromProps(props);
    }

    componentWillReceiveProps(nextProps: CommunityLibraryDetailsProps) {
        this.setState(this.getStateFromProps(nextProps));
    }

    private getStateFromProps(props: CommunityLibraryDetailsProps) {
        let state: CommunityLibraryDetailsState = { data: props.data };
        if (!state.data) {
            backend.galleryProxy.resource(props.resourceId).then(data => {
                this.setState({ data });
            });
        }
        return state;
    }

    renderTags(tagsString) {
        if (!tagsString) {
            return;
        }

        var tags = tagsString.split(',');

        return tags.map(t => <SearchTag text={t} key={t} />)
    }

    render() {
        if (!this.state.data) {
            return <div></div>
        }

        var data = this.state.data;
        return <div className="resource-page">
            <section className="resource-details-container">
                {this.renderImage({ side: true })}
                <div className="resource-details">
                    <h3 className={bem("resource-details", "symbol")}>{buildSymbol(data.name)}</h3>
                    <h1 className={bem("resource-details", "header")}>{data.name}</h1>
                    <div className={bem("resource-details", "tags")}>{this.renderTags(data.tags)}</div>
                    <article className={bem("resource-details", "description")}>
                        {data.description.split("\n").map((x, i) => <p key={i} className={bem("resource_details", "par")}>{x}</p>)}
                    </article>
                    {this.renderImage({ column: true })}
                    <label className={bem("resource-details", "dblabel")}>Designed by</label>
                    <div className={bem("resource-details", "designedby")}>{data.authorName || "carbonium"}</div>

                    <div className="resource-details__import-aligner">
                        <a href={"/app?r=" + this.props.resourceId} className={cx("fs-main-button", bem("resource-details", "import"))}>{this.formatLabel("@library.openSymbol")}</a>
                        <div className={bem("resource-details", "downloads")}>
                            <FormattedMessage id="@library.downloads" values={{ num: data.timesUsed }} />
                        </div>
                    </div>
                </div>
            </section>

            <SubscribeForm mainTextLabelId="@subscribe.details" />
        </div>;
    }

    private renderImage(mods: { side?: boolean, column?: boolean }) {
        mods = Object.assign({}, mods, { hasScreens: this.state.data.screenshots.length > 0 });
        return <figure className={bem("resource-details", "image", mods)}>
            <div className={bem("resource-details", "bg-container")}>
                <div className={bem("resource-details", "bg", mods)} style={{ backgroundImage: "url('" + this.state.data.coverUrl + "')" }}></div>
            </div>
            <div className={bem("resource-details", "screen-container")}>
                {this.state.data.screenshots.map((x, i) =>
                    <img className={bem("resource-details", "screen")} src={x.url} title={x.name} key={i} />
                )}
                {/* Workaround for a issue with flex, auto-sized images and righmost padding */}
                <div className={bem("resource-details", "last")} />
            </div>
        </figure>
    }
}