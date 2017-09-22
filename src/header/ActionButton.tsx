import React from "react";
import PropTypes from "prop-types";
import {app} from "carbon-core";
import cx from 'classnames';
import { Component } from "../CarbonFlux";

interface ActionButtonProps extends IReactElementProps {
    action:string;
    disabled:boolean;
}

export default class ActionButton extends Component<ActionButtonProps> {
    _action = (event)=> {
        event.stopPropagation();
        app.actionManager.invoke(this.props.action);
    }

    _stopPropagation(event) {
        event.stopPropagation();
    }

    render() {
        var classname = cx("action-button", {disabled: this.props.disabled});
        var label = this.formatLabel(this.props.action);
        return (
            <div className={classname} id={this.props.id} title={label} onMouseDown={this._stopPropagation}
                 onClick={this._action}>
                <div className="big-icon"/>
            </div>
        )
    }
}
