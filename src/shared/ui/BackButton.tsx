import * as React from "react";
import { Component } from "../../CarbonFlux";
import { FormattedMessage } from "react-intl";

type BackButtonProps = {
    caption: string;
    onClick: () => void;
    translate?: boolean;
}

export default class BackButton extends Component<BackButtonProps> {
    render() {
        return <div onClick={this.props.onClick}><span>← {this.props.translate ? <FormattedMessage id={this.props.caption}/> : this.props.caption} </span></div>
    }

    static defaultProps: Partial<BackButtonProps> = {
        translate: true
    }
}