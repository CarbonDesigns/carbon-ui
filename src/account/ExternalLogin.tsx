import React from "react";
import { backend, logger } from "carbon-api";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import { Url } from "../Constants";

export default class ExternalLogin extends RouteComponent<IRouteComponentProps>{
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