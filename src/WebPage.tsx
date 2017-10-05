import React from "react";
import RouteComponent, { IRouteComponentProps } from "./RouteComponent";
import TopMenu from "./shared/TopMenu";

export default class WebPage extends RouteComponent<IRouteComponentProps> {
    render() {
        return <div>
            <TopMenu dark/>
            {this.props.children}
        </div>
    }
}