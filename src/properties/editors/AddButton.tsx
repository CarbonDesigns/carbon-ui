import React from 'react';
import {Component} from "../../CarbonFlux";
import {FormattedHTMLMessage} from "react-intl";
import {GuiButton} from "../../shared/ui/GuiComponents";
import bem from '../../utils/commonUtils';

export default class AddButton extends Component<any, any> {
    render(){
        var {children, ...rest} = this.props;
        return <GuiButton mods={["link", "link-hover"]} {...rest} icon="plus">
            {children}
        </GuiButton>;
    }
}