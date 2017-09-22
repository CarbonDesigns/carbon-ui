import React from "react";
import {FormattedMessage} from "react-intl";
import {Component} from "../../CarbonFlux";

interface BladeHeaderProps {
    caption: string;
}

export default class BladeHeader extends Component<BladeHeaderProps> {
    render() {
        return (
            <div className="blade__heading">
                <h3><FormattedMessage id={this.props.caption}/></h3>
            </div>
        )
    }
}
