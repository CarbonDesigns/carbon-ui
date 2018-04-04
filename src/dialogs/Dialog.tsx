import * as React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import { cancellationStack, ICancellationHandler } from "../shared/ComponentStack";

export default class Dialog<P = {}, S = {}> extends Component<P, S> implements ICancellationHandler {
    componentDidMount() {
        super.componentDidMount();
        cancellationStack.push(this);
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        cancellationStack.pop();
    }

    onCancel() {
        if (this.canClose()) {
            this.close();
        }
    }

    renderHeader() {
        return <p>Dialog header</p>
    }

    renderBody() {
        return <div>Dialog body</div>
    }

    canClose(): boolean {
        return true;
    }

    close() {
        dispatchAction({ type: "Dialog_Hide", async: true });
    }

    private closeDialog = () => {
        if (this.canClose()) {
            this.close()
        }
    }

    render() {
        return <div className="dialog">
            <div className="dialog__header">
                {this.renderHeader()}
                {this.renderCloseButton()}
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

    renderCloseButton() {
        if (this.canClose()) {
            return <div className="dialog__buttons">
                <div className="dialog__button" onClick={this.closeDialog}>
                    <i className="ico-close" />
                </div>
            </div>
        }
        return null;
    }
}