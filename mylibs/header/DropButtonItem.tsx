import React from "react";
import {app} from "carbon-core";
import classNames from 'classnames';
import {FormattedHTMLMessage} from "react-intl";

interface IDropButtonItemProps extends IReactElementProps{
    action?: string;
    labelId?: string;
    onClick?: ()=>void;
}

export default class DropButtonItem extends React.Component<IDropButtonItemProps, any>{
    _renderIcon(){
        if(this.props.id) {
            return (<i className="big-icon dropdown__left-icon"></i>);
        }

        return null;
    }

    _action=()=>{
        if (this.props.action){
            app.actionManager.invoke(this.props.action);
        }
        else if (this.props.onClick){
            this.props.onClick();
        }
    };

    _stopPropagation(event){
      event.stopPropagation();
    }

    render(){
        var labelId = this.props.labelId;
        if (this.props.action){
            labelId = app.actionManager.getActionDescription(this.props.action);
        }
        if (!labelId){
            labelId = "empty.label";
        }
        return (
            <p className="dropdown__item" id={this.props.id} onMouseDown={this._stopPropagation} onClick={this._action}>
                {this._renderIcon()}
                <span className="text pill-cap"><FormattedHTMLMessage id={labelId}></FormattedHTMLMessage></span>
                <span className="shortcut">{this.props.action ? app.shortcutManager.getActionHotkeyDisplayLabel(this.props.action) : ""}</span>
            </p>
        )
    }
}
