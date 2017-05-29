import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { backend } from "carbon-api";
import { dispatch, handles, Component, dispatchAction } from "../CarbonFlux";
import { AccountAction } from "./AccountActions";
import { GuiButton, GuiRadio, GuiInput, IFieldState, ValidationTrigger, GuiValidatedInput, IFormState } from "../shared/ui/GuiComponents";
import Socials from "./Socials";
import Immutable from "immutable";
import Intl from "react-intl";
import Router from "react-router";

interface ILoginFormProps{
    messageId: string;
}

export default class LoginForm extends Component<ILoginFormProps, IFormState> {
    context: {
        router: Router.InjectedRouter
    }

    refs: {
        email: GuiValidatedInput;
        password: GuiValidatedInput;
    }

    static contextTypes = {
        router: React.PropTypes.any,
        intl: React.PropTypes.object
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
        if (action.type === "Account_LoginResponse") {
            this.refs.email.clearError();
            this.refs.password.clearError();

            if (action.response.ok === false){
                if (action.response.errors.email){
                    this.refs.email.setErrorLabel(action.response.errors.email);
                }
                if (action.response.errors.password){
                    this.refs.password.setErrorLabel(action.response.errors.password);
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
        ok = this.refs.password.validate(true) && ok;

        if (!ok){
            return;
        }
        this.setState({
            status: "sending",
        });

        var email = this.refs.email.getValue();
        var password = this.refs.password.getValue();

        backend.loginAsUser({email, password})
            .then(response => {
                dispatchAction({type: "Account_LoginResponse", response});
                this._onSuccess();
            })
            .catch(this._onFail);
    };

    _onSuccess = () => {
        this.setState({ status: "notReady" });
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

    private validatePassword = (password: string, state: ImmutableRecord<IFieldState>, force?: boolean) => {
        if (!password && force) {
            return state.set("status", "error").set("error", this.formatLabel("@account.noPassword"));
        }
        return state.set("status", "notReady").set("error", "");
    }

    private forgotPasswordLink = e => {
        e.preventDefault();

        this.context.router.push({
            pathname: "/account/forgotPassword",
            state: {email: this.refs.email.getValue()}
        });

        return false;
    };

    render() {
        var form_status_classname = (this.state.status) ? (" form_" + this.state.status) : "";

        return <form className={`signup flyout__content form form_spacy form__group${form_status_classname}`} onSubmit={this._onSubmit}>
            <div className="form__heading">
                <FormattedMessage tagName="h3" id={this.props.messageId} />
            </div>

            <div className="form__line">
                <GuiValidatedInput ref="email" id="email" autoFocus
                    placeholder="Your e-mail address"
                    onValidate={this.validateEmail}
                    trigger={ValidationTrigger.blur} />
            </div>
            <div className="form__line">
                <GuiValidatedInput ref="password" id="password" type="password"
                    placeholder="Your password"
                    onValidate={this.validatePassword}
                    trigger={ValidationTrigger.blur} />
            </div>

            <div className="form__submit">
                <section className="gui-button gui-button_yellow">
                    <button type="submit" className="btn"><FormattedMessage id="@account.login" /></button>
                </section>
                {this.renderConnectionErrorIfAny()}
            </div>

            <section className="form__line form__line-right">
                <a href="#" onClick={this.forgotPasswordLink}><FormattedMessage id="@account.forgotPassword?"/></a>
            </section>

            <Socials message="or log in with" />
        </form>;
    }

    private renderConnectionErrorIfAny() {
        if (this.state.status === "error"){
            //TODO: (design) we probably need some generic "Could not connect to the server notification"
            return <span>Could not connect to the server right now.</span>
        }
        return null;
    }
}