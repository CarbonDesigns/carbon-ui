import * as React from "react";
import styled from "styled-components";
import theme from "../theme";
import { CarbonLabel } from "../CarbonFlux";
import Icon from "../components/Icon";
import icons from "../theme-icons";
import { LineBottom } from "../components/CommonStyle";
import { backend } from "carbon-api";

export default class MainMenuHeader extends React.Component<any, any>{
    logout() {
        backend.logout();
    }

    render(){
        let loggedIn = backend.isLoggedIn() && !backend.isGuest();
        return <MainMenuHeaderContainer>
            <LogoContainer>carbonium</LogoContainer>
            <MenuButton><Icon icon={icons.menu_tutorial} className="_icon" /><CarbonLabel id="@menu_tutorials"/></MenuButton>
            <MenuButton><Icon icon={icons.menu_feedback} className="_icon" /><CarbonLabel id="@menu_feedback"/></MenuButton>
            <MenuButton><CarbonLabel id="@menu_settings"/></MenuButton>
            {loggedIn && <MenuButton className="logout" onClick={()=>this.logout()}><CarbonLabel id="@menu_logout"/></MenuButton>}
        </MainMenuHeaderContainer>
    }
}

const MainMenuHeaderContainer = styled.div`
    height: 60px;
    display:grid;
    width:100%;
    position:relative;
    margin-bottom: 60px;

    display: grid;
    grid-template-columns: 1fr 120px 120px 120px auto;

    &::after {
        ${LineBottom};
    }

`;

const LogoContainer = styled.div`
    font:${theme.logo_font};
    color:${theme.text_color};
    letter-spacing:1.99px;
    text-transform:uppercase;
    margin: auto 0;
`;

const MenuButton = styled.div`
    font: ${theme.menu_link_font};
    color: ${theme.text_color};
    margin: auto auto;
    display: grid;
    position:relative;
    cursor: pointer;
    grid-template-columns: auto 1fr auto;
    & ._icon {
        margin-right: ${theme.margin2};
    }

    &.logout {
        height: 28px;
        line-height:28px;
        text-align:center;
        min-width: 110px;
        display: block;
        &:before{
            background: ${theme.alternative_button};
            border-radius: 1.82px;
            content: "";
            display: block;
            position:absolute;
            left:0;
            top:0;
            right:0;
            bottom:0;
            z-index:-1;
        }

        text-transform: uppercase;
    }
`;