import * as React from "react";
import { Component, dispatchAction, dispatch } from "../CarbonFlux";
import { AccountAction } from "./AccountActions";
import RegistrationForm from "./RegistrationForm";
import CarbonActions from "../CarbonActions";

export default class RegistrationPopup extends Component {
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
        return <RegistrationForm messageId="@account.joinMessage"/>;
    }
}