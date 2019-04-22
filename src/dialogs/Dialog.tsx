import * as React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import { cancellationStack, ICancellationHandler } from "../shared/ComponentStack";
import styled from "styled-components";
import theme from "../theme";

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
        return <DialogContainer>
            <div className="_header">
                {this.renderHeader()}
                {this.renderCloseButton()}

            </div>
            <div className="_body">
                {this.renderBody()}
            </div>
        </DialogContainer>
    }

    renderCloseButton() {
        if (this.canClose()) {
            return <div className="_buttons">
                <div className="_button" onClick={this.closeDialog}>
                    <i className="ico-close" />
                </div>
            </div>
        }
        return null;
    }
}

const DialogContainer = styled.div`
    user-select:text;
    position:absolute;

    min-width: 800px;
    @media (max-width: 768px) {
        min-width: 500px;
    }

    color : ${theme.text_color};
    box-shadow: ${theme.flyout_shadow};
    background: ${theme.flyout_background};

    ._header{
        position:relative;
        height: 30px;
        padding: 0 20px;
        line-height: 30px;
    }

    ._buttons{
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;

        display: flex;
        align-items: center;
        flex-wrap: nowrap;
    }

    ._button{
        cursor:pointer;
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity:0.3;
        &:hover {
           // .wbg(5);
            //.op80;
        }
    }

    ._body{
        padding: 20px;
    }



`;