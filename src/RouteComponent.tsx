import React from "react";
import PropTypes from "prop-types";
import Router from "react-router";
import { Component } from "./CarbonFlux";
import { ErrorCode, Url, InfoCode } from "./Constants";

export interface IRouteComponentProps {
    location: {
        pathname: string;
        search: string;
        state: any;
    }
}

export default class RouteComponent<P extends IRouteComponentProps = IRouteComponentProps, S = {}> extends Component<P, S> {
    context: {
        history: Router.InjectedRouter
        intl: any
    }

    componentDidMount() {
        super.componentDidMount();

        this.updateTitle(this.getTitle());
    }

    goToDashboard(companyName: string, companyId: string) {
        this.context.history.push({
            pathname: "/@" + (companyName || "guest"),
            search: this.props.location.search,
            state: { companyId: companyId }
        });
    }

    goBack() {
        this.context.history.goBack();
    }

    goHome() {
        this.context.history.push({
            pathname: "/",
            search: this.props.location.search,
        });
    }

    goToApp(companyName: string, appId: string, companyId?: string) {
        this.context.history.replace({
            pathname: "/app/@" + companyName + "/" + appId,
            search: this.props.location.search,
            state: { companyId: companyId }
        });
    }

    goToError(errorCode: ErrorCode) {
        this.context.history.replace({
            pathname: "/e/" + errorCode,
            search: this.props.location.search
        });
    }

    goToInfo(infoCode: InfoCode) {
        this.context.history.replace({
            pathname: "/i/" + infoCode,
            search: this.props.location.search
        });
    }

    goTo(url: Url, state?: any) {
        this.context.history.push({
            pathname: url,
            search: this.props.location.search,
            state
        });
    }

    replacePath(path, search = this.props.location.search) {
        this.context.history.replace({ pathname: path, search });
    }

    protected getTitle() {
        return "Carbonium";
    }

    protected updateTitle(title: string) {
        document.title = title + " | Carbonium";
    }

    static contextTypes = {
        router: PropTypes.object.isRequired,
        intl: PropTypes.object
    }
}