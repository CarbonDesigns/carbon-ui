import React from 'react';
import EditorComponent, {IEditorProps, IEditorState} from "./EditorComponent";
import cx from 'classnames';
import {FormattedHTMLMessage} from "react-intl";

export default class MultiToggleEditor extends EditorComponent<IEditorProps, IEditorState<any>> {
    render(){
        var items = this.extractOption(this.props, "items");
        var wcn = this.widthClass(this.props.className || "prop_width-1-1");
        var classes = cx("prop prop_pushbuttons", wcn);
        return <div className={classes}>
            <div className="prop__name"><FormattedHTMLMessage id={this.displayName()}/></div>
            <div className="prop__value">
                {items.map((x, i) => this.renderItem(x, i))}
            </div>
        </div>;
    }

    renderItem(x, i){
        var value = this.state.value[x.field];
        var active = value;
        if (x.config){
            active = value === x.config.on;
        }
        var buttonClasses = cx("prop__pushbutton", {"_active": active});
        var iconClasses   = cx("ico ico-prop", x.icon);
        return <q className={buttonClasses} onClick={this.onChange} key={i} data-field={x.field} data-i={i}>
            <i className={iconClasses}></i>
        </q>
    }

    onChange = (e) => {
        var field = e.currentTarget.dataset.field;
        var i = parseInt(e.currentTarget.dataset.i);
        var items = this.extractOption(this.props, "items");
        var config = items[i].config;

        var value = this.state.value[field];
        var changes = {};
        if (config){
            var active = value === config.on;
            changes[field] = !active ? config.on : config.off
        }
        else{
            changes[field] = !value;
        }
        if (this.props.onSettingValue && this.props.onSettingValue(changes) === false){
            return;
        }
        var newObject = extend({}, this.state.value, changes);
        this.setValueByCommand(newObject);
    };
}