import * as React from "react";
import { Location } from "history";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction } from "../CarbonFlux";
import RouteComponent, { RouteComponentProps } from "../RouteComponent";
import CommunityLibraryDetails from "./CommunityLibraryDetails";
import CommunityLibraryPage from "./CommunityLibraryPage";
import { ISharedResource } from "carbon-core";
import queryString from "query-string";

interface CommunityLibraryProps extends RouteComponentProps {
    params: {
        resourceId?: string;
    };
    location: Location & {
        state: {
            data?: ISharedResource;
        }
    };
}

type CommunityLibraryState = {
    showList: boolean;
}

/**
 * Renders list or details depending on parameters.
 * If details are rendered, list is just hidden to maintain correct state/position when going back.
 */
export default class CommunityLibrary extends RouteComponent<CommunityLibraryProps, CommunityLibraryState> {
    constructor(props: CommunityLibraryProps) {
        super(props);
        this.state = {
            showList: !props.params.resourceId
        };
    }


    componentWillReceiveProps(nextProps: CommunityLibraryProps) {
        if (!this.state.showList) {
            this.setState({ showList: !nextProps.params.resourceId });
        }
    }

    render() {
        return <div>
            {this.renderList()}
            {this.renderDetails()}
        </div>;
    }

    private renderList() {
        if (this.state.showList) {
            var query:any = queryString.parse(this.props.location.search);

            return <CommunityLibraryPage search={query.s || ""} visible={!this.props.params.resourceId} />;
        }
        return null;
    }
    private renderDetails() {
        if (this.props.params.resourceId) {
            return <CommunityLibraryDetails resourceId={this.props.params.resourceId} data={this.props.location.state.data} />
        }
        return null;
    }
}