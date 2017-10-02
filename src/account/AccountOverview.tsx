import React from "react";
import { Component, dispatchAction, CarbonLabel } from "../CarbonFlux";
import { backend, IAccountOverview } from "carbon-api";
import { IRouteComponentProps, default as RouteComponent } from "../RouteComponent";
import { GuiInput, GuiValidatedInput, ValidationTrigger, IFieldState } from "../shared/ui/GuiComponents";
import { FormattedMessage } from "react-intl";
import { AccountAction } from "./AccountActions";
import { LoginProviders } from "../Constants";
import TopMenu from "../shared/TopMenu";
import { SideMenu } from "../shared/SideMenu";
import { SideMenuContainer, ContentPage } from "../shared/SideMenuContainer";

interface IAccountOverviewState {
    fetched: boolean;
    overview: IAccountOverview | null;
    sendingAccountInfo: boolean;
    sendingPassword: boolean;
    updatedAccountInfo: boolean;
    updatedPassword: boolean;
}

export default class AccountOverview extends RouteComponent<IRouteComponentProps, IAccountOverviewState>{
    refs: {
        username: GuiValidatedInput;
        email: GuiValidatedInput;
        oldPassword: GuiValidatedInput;
        newPassword: GuiValidatedInput;
    }

    constructor(props) {
        super(props);

        this.state = {
            fetched: false,
            overview: null,
            sendingAccountInfo: false,
            sendingPassword: false,
            updatedAccountInfo: false,
            updatedPassword: false
        };
    }

    canHandleActions() {
        return true;
    }
    onAction(action: AccountAction) {
        if (action.type === "Account_InfoUpdated") {
            this.refs.email.clearError();
            this.refs.username.clearError();

            if (action.response.ok === false) {
                this.refs.email.setErrorLabel(action.response.errors.email);
                this.refs.username.setErrorLabel(action.response.errors.username);
            }
            else {
                this.setState({ updatedAccountInfo: true });
            }
            return;
        }

        if (action.type === "Account_PasswordChanged") {
            this.refs.oldPassword.clearError();
            this.refs.newPassword.clearError();

            if (action.response.ok === false) {
                this.refs.oldPassword.setErrorLabel(action.response.errors.oldPassword);
                this.refs.newPassword.setErrorLabel(action.response.errors.newPassword);
            }
            else {
                this.setState({ updatedPassword: true });
            }
            return;
        }

        if (action.type === "Account_PasswordAdded") {
            this.refs.newPassword.clearError();

            if (action.response.ok === false) {
                this.refs.newPassword.setErrorLabel(action.response.errors.newPassword);
            }
            else {
                this.setState({ updatedPassword: true });
            }
            return;
        }
    }

    private validateUsername = (username: string, state: ImmutableRecord<IFieldState>, force?: boolean) => {
        var username = this.refs.username.getValue();
        if (username) {
            return state.set("status", "notReady");
        }
        if (force) {
            return state.set("status", "error").set("error", this.formatLabel("@account.noUsername"));
        }
        return state.set("status", "notReady");
    }
    private validateEmail = (email: string, state: ImmutableRecord<IFieldState>, force?: boolean) => {
        if (email) {
            if (email.indexOf('@') < 0) {
                return state.set("status", "error").set("error", this.formatLabel("@account.badEmail"));
            }

            return state.set("status", "notReady").set("error", "");
        }

        if (force) {
            return state.set("status", "error").set("error", this.formatLabel("@account.noEmail"));
        }

        return state.set("status", "notReady");
    }
    private invalidateAccountInfo = e => {
        if (this.state.updatedAccountInfo) {
            this.setState({ updatedAccountInfo: false });
        }
    };
    private updateAccountInfo = e => {
        e.preventDefault();

        if (this.state.sendingAccountInfo) {
            return;
        }

        var ok = this.refs.username.validate(true);
        ok = this.refs.email.validate(true) && ok;

        if (!ok) {
            return;
        }
        this.setState({ sendingAccountInfo: true });

        var username = this.refs.username.getValue();
        var email = this.refs.email.getValue();

        backend.accountProxy.updateAccountInfo({ username, email })
            .then(response => {
                dispatchAction({ type: "Account_InfoUpdated", response });
            })
            .finally(() => this.setState({ sendingAccountInfo: false }));
    }
    private renderAccountInfoSection() {
        return <form className={`password_info form form_spacy form__group fs-form`} onSubmit={this.updateAccountInfo}>
            <div className="form__heading fs-header">
                <FormattedMessage tagName="h3" id="@account.info" />
            </div>

            <div className="form__line">
                <label className="fs-label fs-input-label" htmlFor="username"><CarbonLabel id="@account.nameLabel"/></label>
                <GuiValidatedInput ref="username" id="username"
                    component="fs-input"
                    placeholder={this.formatLabel("@account.nameHint")}
                    defaultValue={this.state.overview.info.username}
                    onChange={this.invalidateAccountInfo}
                    onValidate={this.validateUsername}
                    trigger={ValidationTrigger.blur} />
            </div>

            <div className="form__line">
                <label className="fs-label fs-input-label" htmlFor="email"><CarbonLabel id="@account.emailLabel"/></label>
                <GuiValidatedInput ref="email" id="email"
                    component="fs-input"
                    placeholder={this.formatLabel("@account.emailHint")}
                    defaultValue={this.state.overview.info.email}
                    onChange={this.invalidateAccountInfo}
                    onValidate={this.validateEmail}
                    trigger={ValidationTrigger.blur} />
            </div>

            <div className="form__submit">
                <button type="submit" className="fs-main-button"><FormattedMessage id="@update" /></button>
                {
                    this.state.updatedAccountInfo ? <FormattedMessage id="@settingsUpdated" /> : null
                }
            </div>
        </form>;
    }

    private validatePassword = (password: string, state: ImmutableRecord<IFieldState>, force?: boolean) => {
        if (password || force) {
            if (password.length >= 6) {
                return state.set("status", "ok").set("error", "");
            }
            return state.set("status", "error").set("error", this.formatLabel("@account.shortPassword"));
        }
        return state.set("status", "notReady").set("error", "");
    }
    private updatePassword = e => {
        e.preventDefault();

        if (this.state.sendingPassword) {
            return;
        }

        var ok = false;
        if (this.state.overview.hasPassword) {
            ok = this.refs.oldPassword.validate(true);
            ok = this.refs.newPassword.validate(true) && ok;
        }
        else {
            ok = this.refs.newPassword.validate(true);
        }

        if (!ok) {
            return;
        }
        this.setState({ sendingPassword: true });

        if (this.state.overview.hasPassword) {
            let oldPassword = this.refs.oldPassword.getValue();
            let newPassword = this.refs.newPassword.getValue();

            backend.accountProxy.changePassword({ oldPassword, newPassword })
                .then(response => {
                    dispatchAction({ type: "Account_PasswordChanged", response });
                })
                .finally(() => this.setState({ sendingPassword: false }));
        }
        else {
            let newPassword = this.refs.newPassword.getValue();

            backend.accountProxy.addPassword({ newPassword })
                .then(response => {
                    dispatchAction({ type: "Account_PasswordAdded", response });
                })
                .finally(() => this.setState({ sendingPassword: false }));
        }
    }

    private renderPasswordSection() {
        return <form className={`account_info form form_spacy form__group fs-form`} onSubmit={this.updatePassword}>
            <div className="form__heading fs-header">
                <FormattedMessage tagName="h3" id="@account.passwordInfo" />
            </div>

            {this.state.overview.hasPassword ? this.renderChangePassword() : this.renderAddPassword()}

            <div className="form__submit">
                <button type="submit" className="fs-main-button"><FormattedMessage id="@update" /></button>
                {
                    this.state.updatedPassword ? <FormattedMessage id="@settingsUpdated" /> : null
                }
            </div>
        </form>;
    }
    private renderChangePassword() {
        return [
            <div className="form__line" key="oldPassword">
                <label className="fs-label fs-input-label" htmlFor="email"><CarbonLabel id="@account.oldPasswordLabel"/></label>
                <GuiValidatedInput ref="oldPassword" id="password" type="password"
                    component="fs-input"
                    placeholder={this.formatLabel("@account.oldPassword")}
                    onValidate={this.validatePassword}
                    trigger={ValidationTrigger.blur | ValidationTrigger.change} />
            </div>,
            <div className="form__line" key="newPassword">
                <label className="fs-label fs-input-label" htmlFor="email"><CarbonLabel id="@account.newPasswordLabel"/></label>
                <GuiValidatedInput ref="newPassword" id="password" type="password"
                    placeholder={this.formatLabel("@account.newPassword")}
                    component="fs-input"
                    onValidate={this.validatePassword}
                    trigger={ValidationTrigger.blur | ValidationTrigger.change} />
            </div>
        ];
    }
    private renderAddPassword() {
        return [
            <div className="form__line" key="addPassword">
                <GuiValidatedInput ref="newPassword" id="password" type="password"
                    placeholder={this.formatLabel("@account.newPassword")}
                    onValidate={this.validatePassword}
                    trigger={ValidationTrigger.blur | ValidationTrigger.change} />
            </div>
        ]
    }


    private addLogin = e => {
        var provider = e.currentTarget.dataset.provider;
        localStorage.setItem("redirect", "/account");
        backend.loginExternal(provider);
    }
    private renderProvidersSection() {
        var others = LoginProviders.filter(x => this.state.overview.enabledProviders.indexOf(x) === -1);
        return <div className="form__text signup__alternative">
            <div className="form__heading fs-header">
                <FormattedMessage tagName="h3" id="@account.link" />
            </div>

            <div className="signup__with-socials_line signup__with-socials">
                <CarbonLabel id="@account.connected" tagName="p" />
                {this.state.overview.enabledProviders.map(p =>
                    <div className={"signuponform__social signup__social_" + p.toLowerCase()} key={p}>
                        <div className={"ico-social ico-social_" + p.toLowerCase()}></div>
                    </div>
                )}
            </div>
            <div className="signup__with-socials_line signup__with-socials">
                <CarbonLabel id="@account.linkmore" tagName="p" />
                {others.map(p =>
                    <div className={"signuponform__social signup__social_" + p.toLowerCase()} onClick={this.addLogin} data-provider={p} key={p}>
                        <div className={"ico-social ico-social_" + p.toLowerCase()}></div>
                    </div>
                )}
            </div>
        </div>
    }

    componentDidMount() {
        super.componentDidMount();
        backend.accountProxy.overview().then(overview => {
            if (overview.hasAccount) {
                this.setState({ fetched: true, overview });
            }
            else {
                this.goTo("/register");
            }
        });
    }

    render() {
        if (!this.state.fetched) {
            return null;
        }

        return <div className="light-page">
            <TopMenu location={this.props.location} dark={true} />
            <SideMenuContainer>
                <ContentPage label="@account.infoitem" id="account" key="account">
                    {this.renderAccountInfoSection()}
                </ContentPage>

                <ContentPage label="@account.managepassword" id="password" key="password">
                    {this.renderPasswordSection()}
                </ContentPage>

                <ContentPage label="@account.link" id="link" key="link">
                    {this.renderProvidersSection()}
                </ContentPage>
            </SideMenuContainer>
        </div>
    }
}