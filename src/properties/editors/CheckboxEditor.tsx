import * as React from "react";
import EditorComponent from "./EditorComponent";
import * as cx from "classnames";
import { FormattedMessage } from "react-intl";
import { GuiCheckbox}           from "../../shared/ui/GuiComponents";

export default class CheckboxEditor extends EditorComponent<boolean> {
    render(){
        var classes = cx("prop prop_checkbox", this.widthClass(this.props.className || "prop_width-1-1"));
        var label = this.extractOption(this.props, "label", true);
        return <div className={classes}>
            {!label && <div className="prop__name"><FormattedMessage id={this.displayName()}/></div>}
            <div className="prop__body">
                <GuiCheckbox
                    name={this.displayName()}
                    label={this.displayName()}
                    labelless={!label}
                    onChange={this.onChange}
                    checked={this.propertyValue()}
                />
            </div>
        </div>;
    }

    onChange = e =>{
        var value = e.target.checked;
        this.setValueByCommand(value);
    };
}