import React from 'react';
import EditorComponent, {IEditorProps, IEditorState} from "./EditorComponent";
import cx from 'classnames';
import {FormattedHTMLMessage} from "react-intl";
import { GuiCheckbox}           from "../../shared/ui/GuiComponents";

export default class CheckboxEditor extends EditorComponent<IEditorProps, IEditorState<boolean>> {
    render(){
        var classes = cx("prop prop_checkbox", this.widthClass(this.props.className || "prop_width-1-1"));
        return <div className={classes}>
            <div className="prop__body">
                <GuiCheckbox
                    name={this.displayName()}
                    label={this.displayName()}
                    onChange={this.onChange}
                    checked={this.state.value}
                    defaultMessage={this.displayName()}
                />
            </div>
        </div>;
    }

    onChange = e =>{
        var value = e.target.checked;
        this.setValueByCommand(value);
    };
}