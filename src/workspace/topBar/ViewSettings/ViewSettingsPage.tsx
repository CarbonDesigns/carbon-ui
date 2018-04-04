import * as React from "react";
import {richApp} from '../../../RichApp'

import {Component, handles} from "../../../CarbonFlux";
import {GuiSwitch}          from "../../../shared/ui/GuiComponents";
import {FormattedMessage}   from "react-intl";


export default class ViewSettingsPage extends Component<any, any> {
    constructor(props){
        super(props);
    }

    render(){
        var switcher = null;

        if (this.props.switcher)
            switcher = (
                <label className="view-settings__page-switcher">
                    <GuiSwitch checked={this.props.checked} onChange={this.props.onChange} />
                </label>
            );

        return <div className="view-settings__page gui-page" id={"view-settings__page_" + this.props.slug}>
            <div className="view-settings__page-heading">
                <FormattedMessage tagName="h3" id={this.props.heading}/>
                {switcher}
            </div>
            <div className="view-settings__page-body">
                {(this.props.switcher)?<div className="view-settings__overlay" style={{bottom: this.props.checked ? "100%" : "0"}}></div>:null}
                {this.props.children}
            </div>
        </div>;
    }
}
