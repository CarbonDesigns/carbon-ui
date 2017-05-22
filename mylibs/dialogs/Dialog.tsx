import React from "react";
import { Component } from "../CarbonFlux";

export default class Dialog<P, S> extends Component<P, S>{
    renderHeader(){
        return <p>Dialog header</p>
    }

    renderBody(){
        return <div>Dialog body</div>
    }

    render(){
        return <div className="dialog">
            <div className="dialog__header">
                {this.renderHeader()}
            </div>
            <div className="dialog__body">
                {this.renderBody()}
            </div>
        </div>
    }
}