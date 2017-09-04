import React from 'react';
import EditorComponent, {IEditorProps} from "./EditorComponent";
import cx from 'classnames';
import {FormattedMessage} from "react-intl";

export default class MultiSwitchEditor extends EditorComponent<any, IEditorProps> {
    render(){
        var items = this.extractOption(this.props, "items");
        var classes = cx("prop prop_pushbuttons", this.widthClass(this.props.className || "prop_width-1-1"));
        return <div className={classes}>
            <div className="prop__name"><FormattedMessage id={this.displayName()}/></div>
            <div className="prop__value">
                {items.map(x => this.renderItem(x))}
            </div>
        </div>;
    }
    renderItem(x){
        var buttonClasses = cx("prop__pushbutton", {"_active": x.value == this.propertyValue() });
        var iconClasses = cx("ico ico-prop", x.icon);
        return <q className={buttonClasses} onClick={this.onChange} key={"value__"+x.value} data-field={x.value}>
            <i className={iconClasses}></i>
        </q>
    }

    onChange = (e) => {
        var value = parseInt(e.currentTarget.dataset.field);

        if (this.props.onSettingValue && this.props.onSettingValue(value) === false){
            return;
        }
        this.setValueByCommand(value);
    };
}