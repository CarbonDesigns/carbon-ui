import React from "react";
import FlyoutContainer from "./FlyoutContainer";
import DialogContainer from "./dialogs/DialogContainer";
import {Component} from "./CarbonFlux";

export default class Root extends Component<any, any>{
    refs: {
        flyout: FlyoutContainer
    }

    onMouseDown = e => {
        this.refs.flyout.onAppMouseDown(e);
    }

    onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        let target = e.target as HTMLElement;
        if (e.key === "Escape" && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
            target.blur();
        }
    }

    render(){
        return <div onMouseDown={this.onMouseDown} onKeyDown={this.onKeyDown} className="root">
            <FlyoutContainer ref="flyout"/>
            {this.renderContent()}
            <DialogContainer/>
        </div>;
    }

    renderContent(){
        return <div className="content">
            {this.props.children}
        </div>
    }
}
