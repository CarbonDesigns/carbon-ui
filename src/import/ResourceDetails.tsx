import React from "react";
import {FormattedMessage} from "react-intl";
import { Component, dispatchAction } from "../CarbonFlux";
import { ISharedResource } from "carbon-api";
import { MarkupLine, MarkupSubmit } from "../shared/ui/Markup";
import { GuiButtonBlock, GuiButton } from "../shared/ui/GuiComponents";
import ResourceTags from "./ResourceTags";

type ResourceDetailsProps = {
    resource: ISharedResource;
    onSelected: (resource: ISharedResource) => void;
    onCancelled: () => void;
}

export default class ResourceDetails extends Component<ResourceDetailsProps> {
    constructor(props: ResourceDetailsProps) {
        super(props);
        this.state = {};
    }

    private onSelected = () => {
        this.props.onSelected(this.props.resource);
    }
    private onCancelled = () => {
        this.props.onCancelled();
    }

    render() {
        if (!this.props.resource) {
            return null;
        }

        return <div className="resource-import-details">
            <MarkupLine className="resource-import-details__metaline">
                <div className="resource-import-details__cover" style={{ backgroundImage: `url('${this.props.resource.coverUrl}')`, }}>
                </div>

                <div className="resource-import-details__info">
                    <MarkupLine>
                        <div className="resource-import-details__name">{this.props.resource.name}</div>
                    </MarkupLine>
                    <MarkupLine>
                        <p>{this.props.resource.description}</p>
                    </MarkupLine>

                    <MarkupLine>
                        <ResourceTags tags={this.props.resource.tags} />
                    </MarkupLine>

                    <MarkupLine>
                        <div className="markup-heading markup-heading_faded "><FormattedMessage id="TRANSLATEME!!!" defaultMessage="Author" /></div>
                        <div className="resource-import-details__author">
                            <div className="resource-import-details__author-avatar" style={{ backgroundImage: `url('${this.props.resource.authorAvatar}')` }} />
                            <span className="resource-import-details__author-name">{this.props.resource.authorName}</span>
                        </div>
                    </MarkupLine>

                    <MarkupSubmit>
                        <GuiButtonBlock>
                            <GuiButton mods="submit" onClick={this.onSelected} caption="@import"/>
                            <GuiButton mods="hover-cancel" onClick={this.onCancelled} caption="@cancel"/>
                        </GuiButtonBlock>
                    </MarkupSubmit>
                </div>
            </MarkupLine>
        </div>
    }
}