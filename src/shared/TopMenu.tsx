import React from "react";
import PropTypes from "prop-types";
import ReactDom from "react-dom";
import { util } from "carbon-core";
import cx from "classnames";
import { Link } from "react-router";
import { Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "./FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import bem from "../utils/commonUtils";
import { backend } from "carbon-api";
import UserAvatarButton from "./UserAvatarButton";
import DropButtonItem from "./DropButtonItem";

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
        return <Link className="topmenu_login-button"  to="/login"><CarbonLabel id="@nav.login" /></Link>;
    }

    // _renderLoginFlyout() {
    //     return <FlyoutButton className="login-flyout" renderContent={this._renderLoginButton}
    //         position={{ targetVertical: "bottom", targetHorizontal: "right", disableAutoClose: true }}>
    //         <div id="login">
    //             <LoginPopup location={this.props.location} />
    //         </div>
    //     </FlyoutButton>
    // }

    _renderLogoutButton() {
        return <UserAvatarButton black={this.props.dark} width={42} height={42}>
            <DropButtonItem id="settings" onClick={this._settings} labelId="@account.settings"></DropButtonItem>
            <DropButtonItem id="logout" onClick={this._logout} labelId="@account.logout"></DropButtonItem>
        </UserAvatarButton>
    }

    _logout = () => {
        backend.logout().then(() => this._goHome());
    }

    _settings = () => {
        this.context.router.push({
            pathname: "/settings"
        });
    }

    _renderMenuItems(){
        var location = this.context.router.getCurrentLocation();
        var libraryActive = "/library" === location.pathname;
        var dashboardActive = location.pathname.startsWith("/@");

        if((backend.isLoggedIn() || backend.isGuest())) {
            return [
                <li className={bem("navigation-menu", "item", {active:dashboardActive, dark:this.props.dark})}><Link to={'/'+(this.context.router.params.companyName||'')} ><CarbonLabel id="@nav.dashboard" /></Link></li>,
                <li className={bem("navigation-menu", "item", {active:libraryActive, dark:this.props.dark})}><Link to="/library" ><CarbonLabel id="@nav.communitylibrary" /></Link></li>,
                <li className={bem("navigation-menu", "item", {button:false, dark:this.props.dark})}>{this._renderLogoutButton()}</li>
            ]
        }

        let itemCn = bem("navigation-menu", "item", {dark:this.props.dark});
        return [
            <li className={itemCn}><a target="_blank" href="https://carboniumteam.slack.com/signup"><CarbonLabel id="@nav.teamslack" /></a></li>,
            <li className={itemCn}><a target="_blank" href="https://github.com/CarbonDesigns/carbon-ui"><CarbonLabel id="@nav.github" /></a></li>,
            <li className={bem("navigation-menu", "item", {active:libraryActive, dark:this.props.dark})}><Link to="/library" ><CarbonLabel id="@nav.communitylibrary" /></Link></li>,
            <li className={bem("navigation-menu", "item", {button:true, dark:this.props.dark})}>{this._renderLoginButton()}</li>
        ]
    }

    render() {
        return <nav className="header-container">
            <a onClick={this._goHome} className={bem("header-container", "logo", { dark: this.props.dark })} title="carbonium.io"></a>

            <ul className="navigation-menu">
                {this._renderMenuItems()}
            </ul>
        </nav>
    }
}
