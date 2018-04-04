import * as React from "react";
import { Component, dispatchAction, dispatch } from "../CarbonFlux";
import { AccountAction } from "./AccountActions";
import LoginForm from "./LoginForm";
import RouteComponent from "../RouteComponent";
import CarbonActions from "../CarbonActions";

export default class LoginPopup extends RouteComponent {
    canHandleActions() {
        return true;
    }

    onAction(action: AccountAction) {
        if (action.type === "Account_LoginResponse") {
            if (action.response.ok === true){
                dispatch(CarbonActions.cancel());
            }
            return;
        }
    }

    render() {
        return <LoginForm messageId="@account.loginMessage" location={this.props.location}/>;
    }
}