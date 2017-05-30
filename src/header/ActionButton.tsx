import React from "react";
import {app} from "carbon-core";
import cx from 'classnames';

interface IActionButtonProps extends IReactElementProps
{
    action:string;
    disabled:boolean;
}

export default class ActionButton extends React.Component<IActionButtonProps, any> {
    static contextTypes = {
        intl: React.PropTypes.object
    };

    constructor(props) {
        super(props);
    }

    _action = (event)=> {
        event.stopPropagation();
        app.actionManager.invoke(this.props.action);
    }

    _stopPropagation(event) {
        event.stopPropagation();
    }

    render() {
        var classname = cx("action-button", {disabled: this.props.disabled});
        var label = app.actionManager.getActionFullDescription(this.props.action || "empty.label", (id)=>this.context.intl.formatMessage({id:id}));
        return (
            <div className={classname} id={this.props.id} title={label} onMouseDown={this._stopPropagation}
                 onClick={this._action}>
                <div className="big-icon"/>
            </div>
        )
    }
}
