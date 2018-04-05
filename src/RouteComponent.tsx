import * as React from "react";
import * as PropTypes from "prop-types";
import { History, Location } from "history";
import { Component } from "./CarbonFlux";
import { ErrorCode, Url, InfoCode } from "./Constants";

export interface RouteComponentProps {
    history: History;
    location: Location;
}

export default class RouteComponent<P extends RouteComponentProps = RouteComponentProps, S = {}> extends Component<P, S> {
    context: {
        intl: any
    }

    componentDidMount() {
        super.componentDidMount();

        this.updateTitle(this.getTitle());
    }

    goToDashboard(companyName: string, companyId: string) {
        this.props.history.push({
            pathname: "/@" + (companyName || "guest"),
            search: this.props.location.search,
            state: { companyId: companyId }
        });
    }

    goBack() {
        this.props.history.goBack();
    }

    goHome() {
        this.props.history.push({
            pathname: "/",
            search: this.props.location.search,
        });
    }

    goToApp(companyName: string, appId: string, companyId?: string) {
        this.props.history.replace({
            pathname: "/app/@" + companyName + "/" + appId,
            search: this.props.location.search,
            state: { companyId: companyId }
        });
    }

    goToError(errorCode: ErrorCode) {
        this.props.history.replace({
            pathname: "/e/" + errorCode,
            search: this.props.location.search
        });
    }

    goToInfo(infoCode: InfoCode) {
        this.props.history.replace({
            pathname: "/i/" + infoCode,
            search: this.props.location.search
        });
    }

    goTo(url: Url, state?: any) {
        this.props.history.push({
            pathname: url,
            search: this.props.location.search,
            state
        });
    }

    replacePath(path, search = this.props.location.search) {
        this.props.history.replace({ pathname: path, search });
    }

    protected getTitle() {
        return "Carbonium";
    }

    protected updateTitle(title: string) {
        document.title = title + " | Carbonium";
    }

    static contextTypes = {
        intl: PropTypes.object
    }
}