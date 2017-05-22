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
    };

    render(){
        return <div onMouseDown={this.onMouseDown} className="root">
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
