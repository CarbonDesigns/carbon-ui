import React from 'react';
import { FormattedMessage } from "react-intl";
import { Component } from "../../CarbonFlux";
import cx from 'classnames';
import bem, { IHasMods } from '../../utils/commonUtils';


export class MarkupSubmit extends Component<IReactElementProps> {
    render() {
        var { className, children, ...rest } = this.props;
        var cn = bem("markup-submit", null, null, className);
        return <div {...rest} className={cn}>{children}</div>
    }
}

export class MarkupLine extends Component<IReactElementProps & IHasMods<
    "space" |
    "fill" |
    "slim" |
    "center" |
    "stretch" |
    "fill" |
    "horizontal"
>> {
    render() {
        var { className, mods, children, ...rest } = this.props;
        var cn = bem("markup-line", null, mods, className);
        return <div {...rest} className={cn}>{children}</div>
    }
}

export class Markup extends Component<IReactElementProps & IHasMods<"space">> {
    render() {
        var { className, mods, children, ...rest } = this.props;
        var cn = bem("markup", null, mods, className);
        return <div {...rest} className={cn}>{children}</div>
    }
}
