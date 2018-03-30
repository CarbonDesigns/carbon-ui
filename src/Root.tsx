import * as React from "react";
import DialogContainer from "./dialogs/DialogContainer";
import {Component} from "./CarbonFlux";

export default class Root extends Component<any, any>{
    onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        let target = e.target as HTMLElement;
        if (e.key === "Escape" && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
            target.blur();
        }
    }

    render(){
        return <div onKeyDown={this.onKeyDown} className="root">
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
