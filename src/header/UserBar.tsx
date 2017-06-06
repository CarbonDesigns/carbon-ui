import React from "react";
import {Component, handles, dispatch} from "../CarbonFlux";
import FlyoutButton from "../shared/FlyoutButton";
import {app, backend} from "carbon-core";
import {FormattedMessage} from "react-intl";

import UserAvatarButton from './UserAvatarButton';
import DropButtonItem from './DropButtonItem';
import RegistrationPopup from '../account/RegistrationPopup';
import { AccountAction } from '../account/AccountActions';

interface IUserBarProps extends IReactElementProps{
}

interface IUserBarState{
    loggedIn:boolean;
}

export default class UserBar extends Component<IUserBarProps, IUserBarState> {
    static contextTypes = {
        router: React.PropTypes.any,
        intl: React.PropTypes.object
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
        return <UserAvatarButton extension_data={{avatar_url: '/img/i/user-avatar.jpg'}}>
            {/*<DropButtonItem id="action-button_getpro">Get PRO account</DropButtonItem>
            <DropButtonItem id="action-button_projects">My projects</DropButtonItem>
            <DropButtonItem id="action-button_profile">User profile</DropButtonItem>*/}
            <DropButtonItem id="logout" onClick={this._logout} labelId="@account.logout"></DropButtonItem>
        </UserAvatarButton>
    }

    _renderSignup(){
        return  <FlyoutButton
                className="signup__button"
                content={<FormattedMessage id="Sign up" tagName="p"/>}
                position={{
                    targetVertical: "bottom",
                    disableAutoClose: true
                }}
            >
                <div id="register">
                    <RegistrationPopup/>
                </div>
        </FlyoutButton>
    }

    render(){
        return <div className="userbar">
            { this.state.loggedIn
                ? this._renderUserAvatar()
                : this._renderSignup()
            }
        </div>
    }
}
