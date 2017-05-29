import React from "react";
import { Component } from "../CarbonFlux";

export default class Dialog<P, S> extends Component<P, S>{

    renderHeader(){
        return <p>Dialog header</p>
    }

    renderBody(){
        return <div>Dialog body</div>
    }


    onClose : null;

    closeDialog =()=>{
        if ((typeof this.onClose === 'function')) {
            this.onClose()
        }
    }

    render(){
        const buttons = this.props.buttons;
        return <div className="dialog">
            <div className="dialog__header">
                {this.renderHeader()}
                {
                    (typeof this.onClose === 'function') &&
                        <div className="dialog__buttons">
                            <div className="dialog__button" onClick={this.closeDialog}>
                                <i className="ico--close"/>
                            </div>
                        </div>
                }
                {/*
                    buttons && buttons.length &&
                        <div className="dialog__buttons">
                            {buttons.map((button)=>{
                                const content = button.content;
                                return <div className="dialog__button" key="" onClick={button.onClick}>{content}</div>
                            })}
                        </div>

                */}
            </div>
            <div className="dialog__body">
                {this.renderBody()}
            </div>
        </div>
    }
}