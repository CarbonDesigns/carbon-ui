import * as React from "react";
import EditorComponent from "./EditorComponent";
import { FormattedMessage } from "react-intl";
import { GuiCheckbox}           from "../../shared/ui/GuiComponents";
import { PropertyFullLineContainer } from "../PropertyStyles";

export default class CheckboxEditor extends EditorComponent<boolean> {
    render(){
        var label = this.extractOption(this.props, "label", true);
        return <PropertyFullLineContainer>
                <GuiCheckbox
                    name={this.displayName()}
                    label={this.displayName()}
                    labelless={!label}
                    onChange={this.onChange}
                    checked={this.propertyValue()}
                />
            </PropertyFullLineContainer>;
    }

    onChange = e =>{
        var value = e.target.checked;
        this.setValueByCommand(value);
    };
}