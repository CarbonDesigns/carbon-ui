import * as React from "react";
import * as cx from "classnames";
import { FormattedMessage } from "react-intl";
import { backend } from "carbon-api";
import { dispatch, handles, Component, dispatchAction } from "../CarbonFlux";
import { AccountAction } from "./AccountActions";
import { GuiButton, GuiRadio, GuiInput, IFieldState, ValidationTrigger, GuiValidatedInput, IFormState } from "../shared/ui/GuiComponents";
import Socials from "./Socials";
import * as Immutable from "immutable";
import { MinPasswordLength } from "../Constants";
import styled from "styled-components";
import theme from "../theme";
import { MainButtonComponent } from "../components/CommonStyle";

interface IRegistrationFormState extends IFormState {
    validatedEmail: string;
}

interface IRegistrationFormProps {
    messageId: string;
}

export default class RegistrationForm extends Component<IRegistrationFormProps, IRegistrationFormState> {
    refs: {
        username: GuiValidatedInput;
        email: GuiValidatedInput;
        password: GuiValidatedInput;
    }

    constructor(props) {
        super(props);
        this.state = {
            status: "notReady",
            validatedEmail: ""
        };
    }

    canHandleActions() {
        return true;
    }
    onAction(action: AccountAction) {
        if (action.type === "Account_EmailValidation") {
            if (action.response.ok === true) {
                this.refs.email.setOk();
            }
            else {
                this.refs.email.setErrorLabel(action.response.errors.email);
            }
            return;
        }
    }

    _onSubmit = e => {
        e.preventDefault();

        if (this.state.status === "sending") {
            return;
        }

        var ok = this.refs.username.validate(true);
        ok = this.refs.email.validate(true) && ok;
        ok = this.refs.password.validate(true) && ok;

        if (!ok) {
            return;
        }
        this.setState({
            status: "sending",
        });

        var username = this.refs.username.getValue();
        var email = this.refs.email.getValue();
        var password = this.refs.password.getValue();

        backend.accountProxy.register({ username, email, password })
            .then(() => backend.loginAsUser({ email, password }))
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

    private validateUsername = (username: string, state: any/*ImmutableRecord<IFieldState>*/, force?: boolean) => {
        var username = this.refs.username.getValue();
        if (username) {
            return state.set("status", "ok");
        }
        if (force) {
            return state.set("status", "error").set("error", this.formatLabel("@account.noUsername"));
        }
        return state.set("status", "notReady");
    }

    private validateEmail = (email: string, state: any/*ImmutableRecord<IFieldState>*/, force?: boolean) => {
        if (email) {
            if (email.indexOf('@') < 0) {
                return state.set("status", "error").set("error", this.formatLabel("@account.badEmail"));
            }
            if (email !== this.state.validatedEmail && state.get("status") !== "checking") {
                backend.accountProxy.validateEmail({ email })
                    .then(response => {
                        dispatchAction({ type: "Account_EmailValidation", response });
                        this.setState({ validatedEmail: email });
                    })
                    .catch(this._onFail);

                return state.set("status", "checking").set("error", "");
            }

            return state;
        }

        if (force) {
            return state.set("status", "error").set("error", this.formatLabel("@account.noEmail"));
        }

        return state.set("status", "notReady");
    }
    private invalidateEmail() {
        this.setState({ validatedEmail: "" });
    }

    private validatePassword = (password: string, state: any/*ImmutableRecord<IFieldState>*/, force?: boolean) => {
        if (password || force) {
            if (password.length >= MinPasswordLength) {
                return state.set("status", "ok").set("error", "");
            }
            return state.set("status", "error").set("error", this.formatLabel("@account.shortPassword"));
        }
        return state.set("status", "notReady").set("error", "");
    }

    render() {
        return <RegistrationFormContainer onSubmit={this._onSubmit} status={this.state.status}>
            <RegistrationFormHeading>
                <FormattedMessage id={this.props.messageId} />
            </RegistrationFormHeading>

            <GuiValidatedInput ref="username" id="username"
                placeholder="Your name" autoFocus
                onValidate={this.validateUsername}
                trigger={ValidationTrigger.blur} />
            <GuiValidatedInput ref="email" id="email"
                placeholder="Your e-mail address" onChange={e => this.invalidateEmail()}
                onValidate={this.validateEmail}
                trigger={ValidationTrigger.blur} />
            <GuiValidatedInput ref="password" id="password" type="password"
                placeholder={this.formatLabel("@account.passwordHint")}
                onValidate={this.validatePassword}
                trigger={ValidationTrigger.blur | ValidationTrigger.change} />

            <div>
                <SubmitButton type="submit"><FormattedMessage id="@account.create" /></SubmitButton>
                {this.renderConnectionErrorIfAny()}
            </div>

            <Socials message="@socialHeader" />
        </RegistrationFormContainer>;
    }

    private renderConnectionErrorIfAny() {
        if (this.state.status === "error") {
            //TODO: (design) we probably need some generic "Could not connect to the server notification"
            return <span>Could not connect to the server right now.</span>
        }
        return null;
    }
}



const SubmitButton = styled(MainButtonComponent)`
    border-radius:4px;
    width:100%;
    height:40px;
`;

const RegistrationFormContainer = styled.form<{ status: string }>`
    display:grid;
    grid-template-rows: 50px auto auto auto 60px 100px;
    align-items:center;
    grid-row-gap:${theme.margin1};
    background:${theme.flyout_background};
    box-shadow:${theme.flyout_shadow};
    padding:${theme.margin2};
`;

const RegistrationFormHeading = styled.div`
    font:${theme.h1font};
    font-size:20px;
    color:${theme.text_color};
    text-align:center;
    line-height:40px;
`;
