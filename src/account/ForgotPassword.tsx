import React from "react";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import { Url } from "../Constants";
import { IFieldState, IFormState, GuiValidatedInput, ValidationTrigger } from "../shared/ui/GuiComponents";
import { FormattedMessage } from "react-intl";
import { dispatchAction } from "../CarbonFlux";
import { backend } from "carbon-api";
import { AccountAction } from "./AccountActions";

export default class ForgotPassword extends RouteComponent<IRouteComponentProps, IFormState>{
    refs: {
        email: GuiValidatedInput
    }

    constructor(props){
        super(props);
        this.state = {
            status: "notReady"
        };
    }

    canHandleActions() {
        return true;
    }
    onAction(action: AccountAction) {
        if (action.type === "Account_ForgotPasswordResponse") {
            this.refs.email.clearError();

            if (action.response.ok === false){
                if (action.response.errors.email){
                    this.refs.email.setErrorLabel(action.response.errors.email);
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

        var ok = this.refs.email.validate(true);

        if (!ok){
            return;
        }
        this.setState({
            status: "sending",
        });

        var email = this.refs.email.getValue();

        backend.accountProxy.forgotPassword({email})
            .then(response => {
                dispatchAction({type: "Account_ForgotPasswordResponse", response});
                this._onSuccess();
            })
            .catch(this._onFail);
    };

    _onSuccess = () => {
        this.setState({ status: "notReady" });
        this.goToInfo("passwordResetRequested");
    };
    _onFail = () => {
        this.setState({ status: "error" });
    };

    private validateEmail = (email: string, state: ImmutableRecord<IFieldState>, force?: boolean) => {
        if (email && email.indexOf('@') < 0) {
            return state.set("status", "error").set("error", this.formatLabel("@account.badEmail"));
        }

        if (force && !email){
            return state.set("status", "error").set("error", this.formatLabel("@account.noEmail"));
        }

        return state.set("status", "notReady");
    }

    render() {
        var form_status_classname = (this.state.status) ? (" form_" + this.state.status) : "";

        return <form className={`signup flyout__content form form_spacy form__group${form_status_classname}`} onSubmit={this._onSubmit}>
            <div className="form__heading">
                <FormattedMessage tagName="h3" id="@account.forgotPasswordHint" />
            </div>

            <div className="form__line">
                <GuiValidatedInput ref="email" id="email" autoFocus
                    placeholder="Your e-mail address"
                    defaultValue={this.props.location.state.email}
                    onValidate={this.validateEmail}
                    trigger={ValidationTrigger.blur} />
            </div>

            <div className="form__submit">
                <section className="gui-button gui-button_yellow">
                    <button type="submit" className="btn"><FormattedMessage id="@account.sendResetPasswordLink" /></button>
                </section>
            </div>
        </form>;
    }
}