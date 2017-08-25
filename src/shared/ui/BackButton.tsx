import React from "react";
import { Component } from "../../CarbonFlux";
import { FormattedMessage } from "react-intl";

type BackButtonProps = {
    caption: string;
    onClick: () => void;
    translate?: boolean;
}

export default class BackButton extends Component<BackButtonProps> {
    render() {
        return <div onClick={this.props.onClick}><u>← {this.props.translate ? <FormattedMessage id={this.props.caption}/> : this.props.caption} </u></div>
    }

    static defaultProps: Partial<BackButtonProps> = {
        translate: true
    }
}