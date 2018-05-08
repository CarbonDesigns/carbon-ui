import * as React from "react";
import * as PropTypes from "prop-types";
import {Component, handles, dispatch} from "../CarbonFlux";
import FlyoutButton from "../shared/FlyoutButton";
import {Avatar} from "../shared/Avatar";
import {app, backend} from "carbon-core";
import {FormattedMessage} from "react-intl";

import UserAvatarButton from '../shared/UserAvatarButton';
import DropButtonItem from '../shared/DropButtonItem';
import RegistrationPopup from '../account/RegistrationPopup';
import { AccountAction } from '../account/AccountActions';
import styled from "styled-components";
import theme from "../theme";

interface IUserBarProps extends IReactElementProps{
}

interface IUserBarState{
    loggedIn:boolean;
}

export default class UserBar extends Component<IUserBarProps, IUserBarState> {
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props){
        super(props);
        this.state = {loggedIn: backend.isLoggedIn() && !backend.isGuest()};
    }

    canHandleActions(){
        return true;
    }

    onAction(action: AccountAction){
        switch (action.type){
            case "Account_LoginResponse":
                if (action.response.ok === true){
                    this.setState({loggedIn: true});
                }
                return;
        }
    }

    _logout = () => {
        var saved = app.isDirty() ? app.actionManager.invoke("save") as Promise<void> : Promise.resolve();
        saved.then(() => backend.logout()
            .then(() => this.context.router.push("/")));
    };

    _renderUserAvatar(){
        return <UserAvatarButton className="user-avatar-button">
            {/*<DropButtonItem id="action-button_getpro">Get PRO account</DropButtonItem>
            <DropButtonItem id="action-button_projects">My projects</DropButtonItem>
            <DropButtonItem id="action-button_profile">User profile</DropButtonItem>*/}
            <DropButtonItem id="logout" onClick={this._logout} labelId="@account.logout"></DropButtonItem>
        </UserAvatarButton>
    }

    _renderSignup(){
        return  <FlyoutButton
                content={<SignupButton><FormattedMessage id="@signup" tagName="p"/></SignupButton>}
                position={{
                    targetVertical: "bottom",
                    targetHorizontal: "right",
                    sourceHorizontal:"right",
                    disableAutoClose: true
                }}
            >
                <div id="register">
                    <RegistrationPopup/>
                </div>
        </FlyoutButton>
    }

    render(){
        return <UserBarContainer>
            { this.state.loggedIn
                ? this._renderUserAvatar()
                : this._renderSignup()
            }
        </UserBarContainer>
    }
}

const UserBarContainer = styled.div`
    display: flex;
    padding-right:32px;
`;

const SignupButton = styled.div`
    width:100px;
    height:100%;
    border-left: 2px solid ${theme.workspace_background};
    border-right: 2px solid ${theme.workspace_background};
    border-bottom: 1px solid ${theme.accent};
    cursor:pointer;
    font:${theme.h1font};
    color:${theme.text_color};
    text-transform: uppercase;
    display:grid;
    align-items:center;
    justify-items:center;
`;
