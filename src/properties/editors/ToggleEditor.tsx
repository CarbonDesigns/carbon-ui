import React from 'react';
import EditorComponent, {IEditorProps} from "./EditorComponent";
import cx from 'classnames';

export default class ToggleEditor extends EditorComponent<boolean, IEditorProps> {
    render(){
        var parentClasses = cx("prop prop_switch", this.widthClass(this.props.className || "prop_width-1-18"), {"_active": this.propertyValue()});
        var iconClasses = "ico ico-prop " + this.extractOption(this.props, "icon");
        return <div className={parentClasses} onClick={this.onChange}>
            <q>
                <i className={iconClasses}/>
            </q>
        </div>;
    }

    onChange = () => {
        var newValue = !this.propertyValue();
        if (this.props.onSettingValue && this.props.onSettingValue(newValue) === false){
            return;
        }
        this.setValueByCommand(newValue);
    };
}