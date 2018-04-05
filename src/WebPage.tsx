import * as React from "react";
import RouteComponent, { RouteComponentProps } from "./RouteComponent";
import TopMenu from "./shared/TopMenu";

export default class WebPage extends RouteComponent<RouteComponentProps> {
    render() {
        return <div>
            <TopMenu dark pathname={this.props.location.pathname}/>
            {this.props.children}
        </div>
    }
}