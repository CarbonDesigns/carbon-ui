import React from 'react';
import {Component} from "../../CarbonFlux";
import { GuiButton, IGuiButtonProps } from "./GuiComponents";
import bem from '../../utils/commonUtils';

export default class AddButton extends Component<IGuiButtonProps> {
    render(){
        var {children, ...rest} = this.props;
        return <GuiButton mods={["link", "link-hover"]} {...rest} icon="plus">
            {children}
        </GuiButton>;
    }
}