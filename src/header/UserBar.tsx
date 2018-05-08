import * as React from "react";
import * as PropTypes from "prop-types";
import { Component, handles, dispatch } from "../CarbonFlux";
import FlyoutButton from "../shared/FlyoutButton";
import { Avatar } from "../shared/Avatar";
import { app } from "carbon-core";
import { backend } from "carbon-api";
import { FormattedMessage } from "react-intl";
import IconButton from "../components/IconButton";
import DropButtonItem from '../shared/DropButtonItem';
import RegistrationPopup from '../account/RegistrationPopup';
import { AccountAction } from '../account/AccountActions';
import styled from "styled-components";
import theme from "../theme";
import icons from "../theme-icons";
import { FlyoutBody, FlyoutBodyNoPadding } from "../components/CommonStyle";

interface IUserBarProps extends IReactElementProps {
}

interface IUserBarState {
    loggedIn: boolean;
}

export default class UserBar extends Component<IUserBarProps, IUserBarState> {
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);
        this.state = { loggedIn: backend.isLoggedIn() && !backend.isGuest() };
    }

    canHandleActions() {
        return true;
    }

    onAction(action: AccountAction) {
        switch (action.type) {
            case "Account_LoginResponse":
                if (action.response.ok === true) {
                    this.setState({ loggedIn: true });
                }
                return;
        }
    }

    _logout = () => {
        var saved = app.isDirty() ? app.actionManager.invoke("save") as Promise<void> : Promise.resolve();
        saved.then(() => backend.logout()
            .then(() => this.context.router.push("/")));
    };

    _renderUserAvatar() {
        return [<ProjectName key="name" title={app.name()}>{app.name()}</ProjectName>,
        <FlyoutButton
            key="button"
            position={{
                targetHorizontal: "right",
                sourceHorizontal: "right",
                targetVertical:"bottom"
            }}
            renderContent={() =>
                <AvatarContainer>
                    <Avatar userName={backend.getUserName()} url={backend.getUserAvatar()} width={36} height={36} />
                    <IconButton icon={icons.triangle_down} width={12} height={12}/>
                </AvatarContainer>}
        >
            <UserMenu>
                <UserMenuItem onClick={this._logout} labelId="@account.logout"></UserMenuItem>
            </UserMenu>
        </FlyoutButton>]
    }

    _renderSignup() {
        return <FlyoutButton
            content={<SignupButton><FormattedMessage id="@signup" tagName="p" /></SignupButton>}
            position={{
                targetVertical: "bottom",
                targetHorizontal: "right",
                sourceHorizontal: "right",
                disableAutoClose: true
            }}
        >
            <div id="register">
                <RegistrationPopup />
            </div>
        </FlyoutButton>
    }

    render() {
        return <UserBarContainer>
            {this.state.loggedIn
                ? this._renderUserAvatar()
                : this._renderSignup()
            }
        </UserBarContainer>
    }
}

const UserMenuItem = styled(DropButtonItem)`
    padding:0 ${theme.margin1};
    height:24px;
    line-height:24px;
`;

const UserMenu = styled(FlyoutBodyNoPadding)`
    padding: ${theme.margin1} 0;
    min-width:120px;
`;

const AvatarContainer = styled.div`
    display:grid;
    grid-template-columns: 1fr 12px;
    width:100%;
    height:100%;
    justify-items:center;
    align-items:center;
`;

const ProjectName = styled.div`
    max-width:160px;
    height:100%;
    border-left: 2px solid ${theme.workspace_background};
    border-right: 2px solid ${theme.workspace_background};
    border-bottom: 1px solid ${theme.accent};
    font:${theme.default_font};
    color:${theme.text_color};
    display:block;
    text-align:center;
    line-height:44px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    padding:0 ${theme.margin1};
`;

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
