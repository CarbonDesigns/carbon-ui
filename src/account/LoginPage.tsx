import React from "react";
import { Component, dispatchAction, dispatch, CarbonLabel } from "../CarbonFlux";
import { AccountAction } from "./AccountActions";
import LoginForm from "./LoginForm";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import { FormattedMessage } from "react-intl";
import { GuiValidatedInput, ValidationTrigger } from "../shared/ui/GuiComponents";
import TopMenu from "../shared/TopMenu";
import bem from "../utils/commonUtils";
import separatorOr from "../shared/SeparatorOr";
import { LoginProviders } from "../Constants";
import { backend } from "carbon-api";

var Socials: React.StatelessComponent<any> = props =>
    <div className="form__text loginpage-signup__alternative">
        {separatorOr(props.message, "translateme")}
        <div className="signup__with-socials">
            {
                LoginProviders.map(p =>
                    <div className={"signuponform__social signup__social_" + p.toLowerCase()} onClick={(e) => {
                        var provider: any = e.currentTarget.dataset.provider;
                        backend.loginExternal(provider);
                    }} data-provider={p} key={p}>
                        <div className={"ico-social ico-social_" + p.toLowerCase()}></div>
                    </div>)
            }
        </div>
    </div>;

class LoginPageForm extends LoginForm {

    render() {
        var form_status_classname = (this.state.status) ? (" form_" + this.state.status) : "";

        return <form className={`login-form form__group${form_status_classname}`} onSubmit={this._onSubmit}>
            <div className="login-form__heading">
                <FormattedMessage tagName="h3" id={this.props.messageId} />
            </div>

            <div className="form__line login_input login-input_email">
                <GuiValidatedInput ref="email" id="email" autoFocus
                    component="fs-input"
                    type="email"
                    placeholder="Your e-mail address"
                    onValidate={this.validateEmail}
                    trigger={ValidationTrigger.blur} />
            </div>
            <div className="form__line login_input login-input_password">
                <GuiValidatedInput ref="password" id="password" type="password"
                    component="fs-input"
                    placeholder="Your password"
                    onValidate={this.validatePassword}
                    trigger={ValidationTrigger.blur} />
            </div>

            <section className="form__line connection-error">
                {this.renderConnectionErrorIfAny()}
            </section>

            <div className="login-submit">
                <button type="submit" className="fs-main-button login-submit_button"><FormattedMessage id="@account.login" /></button>
                <div className="forgot-password">
                    <a href="#" onClick={this.forgotPasswordLink}><FormattedMessage id="@account.forgotPassword?" /></a>
                </div>
            </div>

            <Socials message="or log in with" />
        </form>;
    }
}

export default class LoginPage extends RouteComponent<IRouteComponentProps> {
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
        return <div className="login-page light-page">
            <TopMenu dark={true} />

            <div className="login-page_content">
                <section className="loginheader-container smooth-header">
                    <h1 className={bem("loginheader-container", "header")} >
                        <CarbonLabel id={"@login.header"} />
                    </h1>
                </section>
                <section className="login-form-container">
                    <LoginPageForm messageId="@account.loginNeededMessage" location={this.props.location} />
                </section>
            </div>
        </div>;
    }
}