import React from "react";
import { Component, dispatchAction, dispatch } from "../CarbonFlux";
import { AccountAction } from "./AccountActions";
import RegistrationForm from "./RegistrationForm";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import { FormattedMessage } from "react-intl";

export default class RegistrationPage extends RouteComponent<IRouteComponentProps> {
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
        return <div className="registerPage">
            <div className="registerPage__middle">
                <RegistrationForm messageId="@account.registrationMessage"/>
            </div>
        </div>;
    }
}