import * as React from "react";
import * as PropTypes from "prop-types";
import { FormattedMessage } from 'react-intl';
import { Link } from "react-router";

import { handles, Component, CarbonLabel } from "../CarbonFlux";
import RouteComponent, { RouteComponentProps } from "../RouteComponent";
import TopMenu from "../shared/TopMenu";
import bem from "../utils/commonUtils";

export default class MessagePage extends RouteComponent<RouteComponentProps, any>{
    constructor(props) {
        super(props);
    }

    render() {
        var location = this.props.location;
        if (location && location.state) {
            var header = location.state.header;
            var message = location.state.message;
        }
        return <div className="message-page">
            <section className="message-container smooth-header">
                <h1 className={bem("message-container", "header")}><CarbonLabel id={header || "404"} /></h1>
                <article className={bem("message-container", "body")}><CarbonLabel id={message || "Not found"} /></article>
            </section>

        </div>;
    }
}