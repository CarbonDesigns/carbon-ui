import * as React from "react";
import * as PropTypes from "prop-types";
import * as ReactDom from "react-dom";
import { util } from "carbon-core";
import * as cx from "classnames";
import { Link, InjectedRouter } from "react-router";
import { Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "./FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import bem from "../utils/commonUtils";
import { backend } from "carbon-api";
import UserAvatarButton from "./UserAvatarButton";
import DropButtonItem from "./DropButtonItem";
import styled from "styled-components";

function cdnUrl(url:string) {
    return backend.cdnEndpoint + "/target/" + url;
}

interface TopMenuProps extends IReactElementProps {
    dark?: boolean;
    pathname?: string;
}

export default class TopMenu extends Component<TopMenuProps, any>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    context: {
        router: any
    }

    _goHome = () => {
        this.context.router.push("/landing");
    }

    _renderLoginButton() {
        return <Link className="topmenu_login-button" to="/login"><CarbonLabel id="@nav.login" /></Link>;
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
        var libraryActive = "/library" === this.props.pathname;
        var dashboardActive = this.props.pathname && this.props.pathname.startsWith("/@");

        if (backend.isLoggedIn() || backend.isGuest()) {
            return [
                <li key="dashboard" className={bem("navigation-menu", "item", {active:dashboardActive, dark:this.props.dark})}><Link to="/" ><CarbonLabel id="@nav.dashboard" /></Link></li>,
                <li key="library" className={bem("navigation-menu", "item", {active:libraryActive, dark:this.props.dark})}><Link to="/library" ><CarbonLabel id="@nav.communitylibrary" /></Link></li>,
                <li key="account" className={bem("navigation-menu", "item", {button:false, dark:this.props.dark})}>{this._renderLogoutButton()}</li>
            ]
        }

        let itemCn = bem("navigation-menu", "item", {dark:this.props.dark});
        return [
            <li key="slack" className={itemCn}><a target="_blank" href="https://carbonium.azurewebsites.net/"><CarbonLabel id="@nav.teamslack" /></a></li>,
            <li key="gh" className={itemCn}><a target="_blank" href="https://github.com/CarbonDesigns/carbon-ui"><CarbonLabel id="@nav.github" /></a></li>,
            <li key="library" className={bem("navigation-menu", "item", {active:libraryActive, dark:this.props.dark})}><Link to="/library" ><CarbonLabel id="@nav.communitylibrary" /></Link></li>,
            <li key="account" className={bem("navigation-menu", "item", {button:true, dark:this.props.dark})}>{this._renderLoginButton()}</li>
        ]
    }

    render() {
        return <MenuBody>
            <Logo/>
        </MenuBody>
        // return <div className="header-container">
        //     <Link to={"/landing"} className={bem("header-container", "logo", { dark: this.props.dark })} title="carbonium.io"></Link>

        //     <ul className="navigation-menu">
        //         {this._renderMenuItems()}
        //     </ul>
        // </div>
    }
}

const Logo = styled.div`
    width: 26px;
    height: 26px;
    background-image: url('${cdnUrl('img/logo.svg')}');
    background-size: cover;
`;

const MenuBody = styled.div`
    width: 100%;
    height: 60px;
    display: grid;
    grid-template-columns: 30px 1fr 1fr;
    padding: 0 118px;
    z-index: 66;
    align-items:center;
`;
