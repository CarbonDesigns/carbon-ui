import React from "react";
import { Component, dispatchAction, dispatch } from "../CarbonFlux";
import FlyoutActions from "../FlyoutActions";
import { AccountAction } from "./AccountActions";
import RegistrationForm from "./RegistrationForm";

export default class RegistrationPopup extends Component {
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
        return <RegistrationForm messageId="@account.joinMessage"/>;
    }
}