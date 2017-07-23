import React, { PropTypes } from "react";
import ReactDom from "react-dom";
import { util } from "carbon-core";
import cx from "classnames";
import { Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "./FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import bem from "../utils/commonUtils";
import { backend } from "carbon-api";

interface TopMenuProps extends IReactElementProps {
    dark?: boolean;
    location: any;
}

export default class TopMenu extends Component<TopMenuProps, any>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props: TopMenuProps) {
        super(props);
    }

    _goToCommunity = () => {
        this.context.router.push("/library");
    }

    _goHome = () => {
        this.context.router.push({
            pathname: "/",
            query: this.props.location.query
        });
    }

    _renderLoginButton() {
        return <CarbonLabel id="@nav.login" />;
    }

    _renderLoginFlyout() {
        return <FlyoutButton className="login-flyout" renderContent={this._renderLoginButton}
            position={{ targetVertical: "bottom", targetHorizontal: "right", disableAutoClose: true }}>
            <div id="login">
                <LoginPopup location={this.props.location} />
            </div>
        </FlyoutButton>
    }

    _renderLogoutButton() {
        return <div>
            <button href="#" onClick={this._logout}><span><CarbonLabel id="@logout" /></span></button>
        </div>;
    }

    _logout = () => {
        backend.logout().then(() => this._goHome());
    };

    render() {
        let itemCn = bem("navigation-menu", "item", {dark:this.props.dark});
        return <nav className="header-container">
            <a onClick={this._goHome} className={bem("header-container", "logo", { dark: this.props.dark })} title="carbonium.io"></a>

            <ul className="navigation-menu">
                <li className={itemCn} onClick={this._goToCommunity} ><CarbonLabel id="@nav.communitylibrary" /></li>
                <li className={itemCn}><a target="_blank" href="https://carboniumteam.slack.com/signup"><CarbonLabel id="@nav.teamslack" /></a></li>
                <li className={itemCn}><a target="_blank" href="https://github.com/CarbonDesigns/carbon-ui"><CarbonLabel id="@nav.github" /></a></li>
                <li className={bem("navigation-menu", "item", {button:true, dark:this.props.dark})}>{backend.isLoggedIn() && !backend.isGuest() ? this._renderLogoutButton() : this._renderLoginFlyout()}</li>
            </ul>
        </nav>
    }
}
