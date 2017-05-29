import React from "react";
import { Component, dispatchAction, dispatch } from "../CarbonFlux";
import FlyoutActions from "../FlyoutActions";
import { AccountAction } from "./AccountActions";
import LoginForm from "./LoginForm";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";

export default class LoginPage extends RouteComponent<IRouteComponentProps, void> {
    canHandleActions() {
        return true;
    }
    onAction(action: AccountAction) {
        if (action.type === "Account_LoginResponse" && action.response.ok === true) {
            this.goBack();
            return;
        }
    }

    render() {
        return <div className="loginPage">
            <div className="loginPage__middle">
                <LoginForm messageId="@account.loginNeededMessage"/>
            </div>
        </div>;
    }
}