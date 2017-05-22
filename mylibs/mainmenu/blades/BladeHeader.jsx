import React from "react";
import {FormattedMessage} from "react-intl";
import {Component} from "../../CarbonFlux";

export default class BladeHeader extends Component {
    render() {
        return (
            <div className="blade__heading">
                <h3><FormattedMessage id={this.props.caption}/></h3>
            </div>
        )
    }
}
