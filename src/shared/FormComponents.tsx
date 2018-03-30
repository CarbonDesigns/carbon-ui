import * as React from "react";
// import {app} from '../../../RichApp'
import {Component} from "../CarbonFlux";
import {FormattedMessage} from "react-intl";
import * as cx from "classnames";

//TODO: typescript bug, react intl is stripped
var a = typeof FormattedMessage;

export class FormLine extends Component<any, {}> {
    constructor(props) {
        super(props);
    }
    render (){
        var {className, ...rest} = this.props;

        return <section className={cx("form__line", className)} {...rest}>{this.props.children}</section>
    }
}

export class FormHeading extends Component<any, {}> {
    constructor(props) {
        super(props);
    }
    render (){
        // if having this.props.heading - showing  heading in formatted message wrapper.
        // else - show children
        var {tagName, heading, ...other} = this.props;

        if (heading !== null)
            return <div className="form__heading" {...other}>
                <FormattedMessage tagName={tagName} id={heading} />
            </div>;

        return <div className="form__heading" {...other}>{this.props.children}</div>;
    }
}

export class FormGroup extends Component<any, {}> {
    constructor(props) {
        super(props);
    }
    render (){
        var {heading, ...other} = this.props;

        if (heading != null)
            var formatted_heading = <FormHeading heading={heading} tagName="h6"/>;

        return <div {...other} className="form__group">{formatted_heading}{this.props.children}</div>
    }
}