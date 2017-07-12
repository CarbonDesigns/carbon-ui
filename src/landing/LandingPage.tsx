import React from "react";
import { FormattedMessage } from 'react-intl';
import {Link} from "react-router";

import { backend } from "carbon-api";
import { handles, Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "../shared/FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import { AccountAction } from "../account/AccountActions";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";

export default class LandingPage extends RouteComponent<IRouteComponentProps>{
    _renderLoginButton() {
        return <div className="gui-button">
            <a href="#"><span>Log in</span></a>
        </div>;
    }
    _renderLoginFlyout() {
        return <FlyoutButton className="login-flyout" renderContent={this._renderLoginButton}
            position={{ targetVertical: "bottom", disableAutoClose: true }}>
            <div id="login">
                <LoginPopup />
            </div>
        </FlyoutButton>
    }
    _renderLogoutButton() {
        return <div className="gui-button">
            <button href="#" onClick={this._logout}><span>Log out</span></button>
        </div>;
    }
    _logout = () => {
        backend.logout().then(() => this.goHome());
    };

    canHandleActions() {
        return true;
    }
    onAction(action: AccountAction) {
        if (action.type === "Account_LoginResponse" && action.response.ok === true) {
            this.goToDashboard(action.response.result.companyName, action.response.result.userId);
            return;
        }
    }

    render() {
        return <div>
            <div><span style={{ color: "aqua", fontSize: 32 }}>Landing page</span></div>

            {backend.isLoggedIn() && !backend.isGuest() ? this._renderLogoutButton() : this._renderLoginFlyout()}

            <div className="gui-button">
                <Link to="/app"><FormattedMessage id="StartDesigning" defaultMessage="Start designing" /></Link>
            </div>
            <nav className="header-container">
                <figure className="header-container__logo"></figure>
                <ul className="navigation-menu">
                    <li className="navigation-menu__item"><CarbonLabel id="@nav.communitylibrary"/></li>
                    <li className="navigation-menu__item"><CarbonLabel id="@nav.teamslack"/></li>
                    <li className="navigation-menu__item"><CarbonLabel id="@nav.github"/></li>
                    <li className="navigation-menu__item_button"><CarbonLabel id="@nav.login"/></li>
                </ul>
            </nav>
            <section className="hero-container">
                <h1 className="hero-container__hero-title"><CarbonLabel id="@hero.title"/></h1>
                <h2 className="hero-container__hero-subtitle"><CarbonLabel id="@hero.subtitle"/></h2>
            </section>
            <section className="subscribe-container">
                <details className="subscribe-container__details"><CarbonLabel id="@subscribe.details"/></details>
                <form className="subscribe-form">
                    <input type="text" className="subscribe-form__email"/>
                    <button><CarbonLabel id="@subscribe"/></button>
                </form>
            </section>
        </div>;
    }
}