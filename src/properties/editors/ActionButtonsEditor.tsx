import React from 'react';
import EditorComponent from "./EditorComponent";
import {GuiButton}         from "../../shared/ui/GuiComponents";

export default class ActionButtonsEditor extends React.Component<any, any> {

    static propTypes = {
        buttons : React.PropTypes.array,
    };

    _onClick = (ev) => {
      if (typeof this.props.onClick === 'function') {
          this.props.onClick(ev, this.props.e);
      }
    };

    _renderButton = (button_data, ind) => {
        var {onClick, ...button_props} = button_data; //removing
        return React.createElement(
            GuiButton,
            Object.assign({
                key            : 'button' + ind,
                mods           : "hover-white",
                onClick        : this._onClick,
                disabled       : false,
                caption        : "translateme!",
            }, button_props),
            null
        );
    };

    render(){
        var buttons = null;
        var buttons_count = 0;
        if (this.props.children) {
            buttons_count = React.Children.count(this.props.children);
            buttons = this.props.children;
        }
        else if (this.props.buttons != null && this.props.buttons.length>0) {
            buttons_count = this.props.buttons.length;
            buttons = this.props.buttons.map(this._renderButton)
        }
        return <div className={"prop_action-buttons prop_action-buttons_" + (buttons_count>1 ? 'many' : 'single')}>
            {buttons}
        </div>;
    }
}