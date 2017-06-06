import React from 'react';
import EditorComponent, {IEditorProps, IEditorState} from "./EditorComponent";
import cx from 'classnames';
import {FormattedHTMLMessage} from "react-intl";

export default class SwitchEditor extends EditorComponent<IEditorProps, IEditorState<boolean>> {
    render(){
        var items = this.extractOption(this.props, "items");
        var hasLabels = this.extractOption(this.props, "hasLabels");
        var classes = cx("prop prop_pushbuttons", this.widthClass(this.props.className || "prop_width-1-1"));
        return <div className={classes}>
            <div className="prop__name"><FormattedHTMLMessage id={this.displayName()}/></div>
            <div className="prop__value">
                {items.map((x, i) => {
                    if (hasLabels){
                        return this.renderItemWithLabel(x, i);
                    }
                    return this.renderItem(x, i);
                })}
            </div>
        </div>;
    }
    renderItem(x, i){
        var buttonClasses = cx("prop__pushbutton", {"_active": x.value === this.state.value});
        var iconClasses = cx("ico type-icon inline-ico", x.icon);
        return <q className={buttonClasses} onClick={this.onChange.bind(this, x.value)} key={i}>
            <i className={iconClasses}></i>
        </q>
    }

    renderItemWithLabel(x, i){
        var buttonClasses = cx("prop__pushbutton prop__v", {"_active": x.value === this.state.value});
        var iconClasses = cx("ico type-icon inline-ico", x.icon);
        return <b className={buttonClasses} onClick={this.onChange.bind(this, x.value)} key={i}>
            <i className={iconClasses}></i>
            <span>{x.label}</span>
        </b>
    }

    onChange(value){
        this.setValueByCommand(value);
    };
}