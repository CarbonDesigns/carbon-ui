import React from 'react';
import cx    from "classnames";

var _simple_render = function (base_clase, props) {
    var {className, ...rest} = props;
    var cn = cx("markup-line", className);
    return ( <div className={cn} {...rest}> {props.children} </div> )
};

export class MarkupLine extends React.Component {
    render() {
        return _simple_render("markup-line", this.props);
    }
}

export class MarkupSubmit extends React.Component {
    render() {
        return _simple_render("markup-submit", this.props);
    }
}

