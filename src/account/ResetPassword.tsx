import * as React from "react";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import { Url, MinPasswordLength } from "../Constants";
import { IFieldState, IFormState, GuiValidatedInput, ValidationTrigger } from "../shared/ui/GuiComponents";
import { FormattedMessage } from "react-intl";
import { dispatchAction } from "../CarbonFlux";
import { backend } from "carbon-api";
import { AccountAction } from "./AccountActions";

interface IResetPasswordProps extends IRouteComponentProps{
    params: {
        token: string;
    }
}

export default class ResetPassword extends RouteComponent<IResetPasswordProps, IFormState>{
    refs: {
        newPassword: GuiValidatedInput,
        token: HTMLInputElement
    }

    constructor(props){
        super(props);
        this.state = {
            status: "notReady"
        }
    }

    canHandleActions() {
        return true;
    }
    onAction(action: AccountAction) {
        if (action.type === "Account_ResetPasswordResponse") {
            this.refs.newPassword.clearError();

            if (action.response.ok === false){
                if (action.response.errors.newPassword){
                    this.refs.newPassword.setErrorLabel(action.response.errors.newPassword);
                }
            }
            return;
        }
    }

    _onSubmit = e => {
        e.preventDefault();

        if (this.state.status === "sending"){
            return;
        }

        var ok = this.refs.newPassword.validate(true);

        if (!ok){
            return;
        }
        this.setState({
            status: "sending",
        });

        var newPassword = this.refs.newPassword.getValue();
        var token = this.refs.token.value;

        backend.accountProxy.resetPassword({token, newPassword})
            .then(response => {
                dispatchAction({type: "Account_ResetPasswordResponse", response});
                this._onSuccess();
            })
            .catch(this._onFail);
    };

    _onSuccess = () => {
        this.setState({ status: "notReady" });
        this.goToInfo("passwordReset");
    };
    _onFail = () => {
        this.setState({ status: "error" });
    };

    private validatePassword = (password: string, state: any/*ImmutableRecord<IFieldState>*/, force?: boolean) => {
        if (password || force) {
            if (password.length >= MinPasswordLength){
                return state.set("status", "ok").set("error", "");
            }
            return state.set("status", "error").set("error", this.formatLabel("@account.shortPassword"));
        }
        return state.set("status", "notReady").set("error", "");
    }

    render() {
        var form_status_classname = (this.state.status) ? (" form_" + this.state.status) : "";

        return <form className={`signup flyout__content form form_spacy form__group${form_status_classname}`} onSubmit={this._onSubmit}>
            <div className="form__heading">
                <FormattedMessage tagName="h3" id="@account.resetPasswordHint" />
            </div>

            <input type="hidden" ref="token" value={this.props.params.token}/>

            <div className="form__line">
                <GuiValidatedInput ref="newPassword" id="password" type="password" autoFocus
                    placeholder={this.formatLabel("@account.passwordHint")}
                    onValidate={this.validatePassword}
                    trigger={ValidationTrigger.blur | ValidationTrigger.change} />
            </div>

            <div className="form__submit">
                <section className="gui-button gui-button_yellow">
                    <button type="submit" className="btn"><FormattedMessage id="@account.resetPassword" /></button>
                </section>
            </div>
        </form>;
    }
}