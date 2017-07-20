import React from "react";
import { Component, dispatchAction, dispatch } from "../CarbonFlux";
import FlyoutActions from "../FlyoutActions";
import { AccountAction } from "./AccountActions";
import LoginForm from "./LoginForm";
import RouteComponent from "../RouteComponent";

export default class LoginPopup extends RouteComponent {
    canHandleActions() {
        return true;
    }
    onAction(action: AccountAction) {
        if (action.type === "Account_LoginResponse") {
            if (action.response.ok === true){
                dispatch(FlyoutActions.hide());
            }
            return;
        }
    }

    render() {
        return <LoginForm messageId="@account.loginMessage" location={this.props.location}/>;
    }
}