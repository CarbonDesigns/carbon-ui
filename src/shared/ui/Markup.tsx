import React from 'react';
import {FormattedMessage} from "react-intl";
import {Component}        from "../../CarbonFlux";
import cx from 'classnames';
import bem from '../../utils/commonUtils';


export class MarkupSubmit extends Component<any, any> {
    constructor(props) {
        super(props);
    }

    render (){
        var {className, tagName, mods, ...rest} = this.props;
        var cn = bem("markup-submit", null, mods, className);
        return <div {...rest} className={cn}>{this.props.children}</div>
    }
}

export class MarkupLine extends Component<any, any> {
    constructor(props) {
        super(props);
    }

    render (){
        var {className, tagName, mods, ...rest} = this.props;
        var cn = bem("markup-line", null, mods, className);
        return <div {...rest} className={cn}>{this.props.children}</div>
    }
}


export class Markup extends Component<any, any> {
    constructor(props) {
        super(props);
    }

    render (){

        var {className, tagName, ...rest} = this.props;
        var cn = cx("markup", className);
        return <div {...rest} className={cn}>{this.props.children}</div>
    }
}
