import * as React from "react";
import * as PropTypes from "prop-types";
import * as cx from "classnames";
import { FormattedMessage } from "react-intl";
import { backend } from "carbon-api";
import { dispatch, handles, Component, dispatchAction } from "../CarbonFlux";
import { AccountAction } from "./AccountActions";
import { GuiButton, GuiRadio, GuiInput, IFieldState, ValidationTrigger, GuiValidatedInput, IFormState } from "../shared/ui/GuiComponents";
import RouteComponent, { RouteComponentProps } from "../RouteComponent";
import Socials from "./Socials";
import * as Immutable from "immutable";
import styled from "styled-components";
import theme from "../theme";

interface ILoginFormProps extends RouteComponentProps {
    messageId?: string;
}

export default class LoginForm extends RouteComponent<ILoginFormProps, IFormState> {
    refs: {
        email: GuiValidatedInput;
        password: GuiValidatedInput;
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

            if (action.response.ok === false) {
                if (action.response.errors.email) {
                    this.refs.email.setErrorLabel(action.response.errors.email);
                }
                if (action.response.errors.password) {
                    this.refs.password.setErrorLabel(action.response.errors.password);
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
        ok = this.refs.password.validate(true) && ok;

        if (!ok) {
            return;
        }
        this.setState({
            status: "sending",
        });

        var email = this.refs.email.getValue();
        var password = this.refs.password.getValue();

        backend.loginAsUser({ email, password })
            .then(response => {
                dispatchAction({ type: "Account_LoginResponse", response });
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

    protected validateEmail = (email: string, state: any/*ImmutableRecord<IFieldState>*/, force?: boolean) => {
        if (email && email.indexOf('@') < 0) {
            return state.set("status", "error").set("error", this.formatLabel("@account.badEmail"));
        }

        if (force && !email) {
            return state.set("status", "error").set("error", this.formatLabel("@account.noEmail"));
        }

        return state.set("status", "notReady");
    }

    protected validatePassword = (password: string, state: any/*ImmutableRecord<IFieldState>*/, force?: boolean) => {
        if (!password && force) {
            return state.set("status", "error").set("error", this.formatLabel("@account.noPassword"));
        }
        return state.set("status", "notReady").set("error", "");
    }

    protected forgotPasswordLink = e => {
        e.preventDefault();

        this.goTo("/account/forgotPassword", { email: this.refs.email.getValue() });

        return false;
    };

    private register() {
        // TODO:
    }

    render() {
        // var form_status_classname = (this.state.status) ? (" form_" + this.state.status) : "";

        return <FormContainer onSubmit={this._onSubmit}>
            <div>
                <GuiValidatedInput ref="email" id="email" autoFocus
                    placeholder="Your e-mail address"
                    onValidate={this.validateEmail}
                    trigger={ValidationTrigger.blur} />
            </div>
            <div>
                <GuiValidatedInput ref="password" id="password" type="password"
                    placeholder="Your password"
                    onValidate={this.validatePassword}
                    trigger={ValidationTrigger.blur} />
            </div>

            <div>
                <SubmitButton type="submit"><FormattedMessage id="@account.login" /></SubmitButton>
                {this.renderConnectionErrorIfAny()}
            </div>

            <LoginDetailsSection>
                <a href="#" onClick={this.forgotPasswordLink}><FormattedMessage id="@account.forgotPassword?" /></a>
            </LoginDetailsSection>

            <LoginDetailsSection>
                <FormattedMessage id="@account.notamember" />&nbsp;<a href="#" onClick={this.register}><FormattedMessage id="@account.create" /></a>
            </LoginDetailsSection>

            <SocialsContainer>
                <FormattedMessage id="@account.orsocials" />
                <Socials/>
            </SocialsContainer>
        </FormContainer>;
    }

    protected renderConnectionErrorIfAny() {
        if (this.state.status === "error") {
            //TODO: (design) we probably need some generic "Could not connect to the server notification"
            return <span>Could not connect to the server right now.</span>
        }
        return null;
    }

    static contextTypes = {
        router: PropTypes.object.isRequired,
        intl: PropTypes.object
    }
}

const SocialsContainer = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    font: ${theme.default_font};
    color: ${theme.text_color};
    padding-top: 24px;
    line-height: 24px;
`;

const FormContainer = styled.form`
    margin-top: 25px;
    display: grid;
    grid-template-rows: 52px 52px 42px auto auto auto;
`;

const LoginDetailsSection = styled.section`
    padding-top:10px;
    &, a:link {
        color: ${theme.text_color_secondary};
        font: ${theme.default_font};
        text-decoration:none;
    }

    a:hover {
        text-decoration:underline;
    }
`;

const SubmitButton = styled.button`
    background: ${theme.button_active};
    height: 32px;
    width: 100%;
    color: ${theme.text_color};
    border-radius:0;
    border:none;
    padding:0;
    cursor: pointer;
    &:hover{
        background: ${theme.button_active.lighten(0.1)};
    }
`;