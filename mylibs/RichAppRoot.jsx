import React from "react";
import HotKeyListener from "./HotkeyListener";
import {Component} from "./CarbonFlux";
import {CoreIntl} from "carbon-core"

export default class RichAppRoot extends Component{
    render(){
        CoreIntl.instance = this.context.intl;
        return <div className="page">
            {this.props.children}
        </div>;
    }

    componentDidMount(){
        super.componentDidMount();
        HotKeyListener.attach();
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        HotKeyListener.detach();
    }
}
