import React from "react";
import PropTypes from "prop-types";
import Router from "react-router";
import { Component } from "./CarbonFlux";
import { ErrorCode, Url, InfoCode } from "./Constants";

export interface IRouteComponentProps{
    location: {
        query: string,
        state: any
    }
}

export default class RouteComponent<P extends IRouteComponentProps = IRouteComponentProps, S = {}> extends Component<P, S> {
    context: {
        router: Router.InjectedRouter
    }

    goToDashboard(companyName: string, companyId: string){
        this.context.router.push({
            pathname: "/@" + (companyName || "guest"),
            query: this.props.location.query,
            state: { companyId: companyId }
        });
    }

    goBack(){
        this.context.router.goBack();
    }

    goHome(){
        this.context.router.push({
            pathname: "/",
            query: this.props.location.query,
        });
    }

    goToApp(companyName: string, appId: string, companyId?: string){
        this.context.router.replace({
            pathname: "/app/@" + companyName + "/" + appId,
            query: this.props.location.query,
            state: {companyId: companyId}
        });
    }

    goToError(errorCode: ErrorCode){
        this.context.router.replace({
            pathname: "/e/" + errorCode,
            query: this.props.location.query
        });
    }

    goToInfo(infoCode: InfoCode){
        this.context.router.replace({
            pathname: "/i/" + infoCode,
            query: this.props.location.query
        });
    }

    goTo(url: Url, state?: any){
        this.context.router.push({
            pathname: url,
            query: this.props.location.query,
            state
        });
    }

    replacePath(path){
        this.context.router.replace({ pathname: path, query: this.props.location.query });
    }

    static contextTypes = {
        router: PropTypes.object.isRequired,
        intl: PropTypes.object
    }
}