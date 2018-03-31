import * as React from "react";
import {FormattedMessage} from "react-intl";
import { Component, dispatchAction } from "../CarbonFlux";

type ResourceTagsProps = {
    tags: string;
}

export default class ResourceTags extends Component<ResourceTagsProps> {
    private splitTags() {
        return this.props.tags.split(',').map(x => x.trim());
    }

    render() {
        return <div className="resource-tags">
            {this.splitTags().map(tag =>
                <span className="resource-tags__tag" key={tag}>
                    <span className="resource-tags__title">{tag}</span>
                </span>
            )}
        </div>;
    }
}