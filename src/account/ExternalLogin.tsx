import * as React from "react";
import { backend, logger } from "carbon-api";
import RouteComponent, { RouteComponentProps } from "../RouteComponent";
import { Url } from "../Constants";

export class ExternalLogin extends RouteComponent<RouteComponentProps>{
    componentDidMount() {
        backend.externalCallback()
            .then(response => {
                if (response.ok === true) {
                    var url = localStorage.getItem("redirect") as Url;
                    if (url) {
                        localStorage.removeItem("redirect");
                        this.goTo(url);
                    }
                    else {
                        this.goToDashboard(response.result.companyName, response.result.userId);
                    }
                }
            });
    }
    render() {
        return <div></div>
    }
}