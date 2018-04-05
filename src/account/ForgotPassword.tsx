import * as React from "react";
import RouteComponent, { RouteComponentProps } from "../RouteComponent";
import { Url } from "../Constants";
import { IFieldState, IFormState, GuiValidatedInput, ValidationTrigger } from "../shared/ui/GuiComponents";
import { FormattedMessage } from "react-intl";
import { dispatchAction, CarbonLabel } from "../CarbonFlux";
import { backend } from "carbon-api";
import { AccountAction } from "./AccountActions";
import TopMenu from "../shared/TopMenu";
import bem from "../utils/commonUtils";

export default class ForgotPassword extends RouteComponent<RouteComponentProps, IFormState>{
    refs: {
        email: GuiValidatedInput
    }

    constructor(props) {
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

            if (action.response.ok === false) {
                if (action.response.errors.email) {
                    this.refs.email.setErrorLabel(action.response.errors.email);
                }
            }
            return;
        }
    }

    _onSubmit = e => {
        e.preventDefault();

        if (this.state.status === "sending") {
            return;
        }

        var ok = this.refs.email.validate(true);

        if (!ok) {
            return;
        }
        this.setState({
            status: "sending",
        });

        var email = this.refs.email.getValue();

        backend.accountProxy.forgotPassword({ email })
            .then(response => {
                dispatchAction({ type: "Account_ForgotPasswordResponse", response });
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

    private validateEmail = (email: string, state: any, force?: boolean) => {
        if (email && email.indexOf('@') < 0) {
            return state.set("status", "error").set("error", this.formatLabel("@account.badEmail"));
        }

        if (force && !email) {
            return state.set("status", "error").set("error", this.formatLabel("@account.noEmail"));
        }

        return state.set("status", "notReady");
    }

    render() {
        var form_status_classname = (this.state.status) ? (" form_" + this.state.status) : "";

        return <div className="login-page light-page">
            <div className="login-page_content">
                <section className="loginheader-container smooth-header">
                    <h1 className={bem("loginheader-container", "header")} >
                        <CarbonLabel id={"@forgotPassword.header"} />
                    </h1>
                </section>
                <section className="login-form-container">
                    <form className={`login-form form__group${form_status_classname}`} onSubmit={this._onSubmit}>
                        <div className="login-form__heading">
                            <FormattedMessage tagName="h3" id="@account.forgotPasswordHint" />
                        </div>

                        <div className="form__line login_input login-input_email">
                            <GuiValidatedInput ref="email" id="email" autoFocus
                                type="email"
                                component="fs-input"
                                placeholder="Your e-mail address"
                                defaultValue={this.props.location.state.email}
                                onValidate={this.validateEmail}
                                trigger={ValidationTrigger.blur} />
                        </div>

                        <div className="login-submit">
                                <button className="fs-main-button restore-pwd-btn" type="submit"><FormattedMessage id="@account.sendResetPasswordLink" /></button>
                        </div>
                    </form>
                </section>
            </div>
        </div>;
    }
}