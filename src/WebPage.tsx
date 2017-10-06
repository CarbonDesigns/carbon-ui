import React from "react";
import RouteComponent, { IRouteComponentProps } from "./RouteComponent";
import TopMenu from "./shared/TopMenu";

export default class WebPage extends RouteComponent<IRouteComponentProps> {
    render() {
        return <div>
            <TopMenu dark pathname={this.props.location.pathname}/>
            {this.props.children}
        </div>
    }
}