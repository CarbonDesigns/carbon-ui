import React from "react";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction } from "../CarbonFlux";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import CommunityLibraryDetails from "./CommunityLibraryDetails";
import CommunityLibraryPage from "./CommunityLibraryPage";

interface CommunityLibraryProps extends IRouteComponentProps {
    params: {
        resourceId?: string;
    };
    location: {
        pathname: string;
        query: {
            s?: string;
        };
        state: object;
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
            return <CommunityLibraryPage search={this.props.location.query.s || ""} visible={!this.props.params.resourceId} />;
        }
        return null;
    }
    private renderDetails() {
        if (this.props.params.resourceId) {
            return <CommunityLibraryDetails resourceId={this.props.params.resourceId} />
        }
        return null;
    }
}