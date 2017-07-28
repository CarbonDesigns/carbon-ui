import React, { PropTypes } from "react";
import { FormattedMessage } from 'react-intl';
import { Link } from "react-router";

import { handles, Component, CarbonLabel } from "../CarbonFlux";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import TopMenu from "../shared/TopMenu";
import bem from "../utils/commonUtils";

export default class MessagePage extends RouteComponent<IRouteComponentProps, any>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);
    }

    render() {
        if (this.context.router.location && this.context.router.location.state) {
            var header = this.context.router.location.state.header;
            var message = this.context.router.location.state.message;
        }
        return <div className="message-page">
            <TopMenu location={this.props.location} dark={true} />

            <section className="message-container smooth-header">
                <h1 className={bem("message-container", "header")}><CarbonLabel id={header || "404"} /></h1>
                <article className={bem("message-container", "body")}><CarbonLabel id={message || "Not found"} /></article>
            </section>

        </div>;
    }
}