import React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import { GuiButton } from "../shared/ui/GuiComponents";
import DialogRegistry from "../dialogs/DialogRegistry";
import Dialog from "../dialogs/Dialog";
import { FormattedMessage } from "react-intl";
import { backend, IDisposable } from "carbon-core";
import { ConnectionState } from "carbon-api";
import { Markup, MarkupLine } from "../shared/ui/Markup";

export default class IdleDialog extends Dialog {
    _connectionToken: IDisposable;

    private resume = () => {
        backend.startConnection();
    };

    componentDidMount(){
        super.componentDidMount();

        this._connectionToken = backend.connectionStateChanged.bind(this, this.onConnectionStateChanged);
    }

    componentWillUnmount(){
        super.componentWillUnmount();
        if (this._connectionToken){
            this._connectionToken.dispose();
        }
    }

    canClose() {
        return false;
    }

    private onConnectionStateChanged(newState: ConnectionState){
        if (newState.type === "connected"){
            this.close();
        }
    }

    renderHeader(){
        return <FormattedMessage id="@idle.header" tagName="p"/>;
    }

    renderBody(){
        return <div className="idleDialog">
            <MarkupLine>
                <FormattedMessage id="@idle.message" tagName="p"/>
            </MarkupLine>
            <MarkupLine>
                <GuiButton onClick={this.resume} caption="@idle.resume" mods="hover-white"/>
            </MarkupLine>
        </div>
    }
}

DialogRegistry.register("IdleDialog", IdleDialog);