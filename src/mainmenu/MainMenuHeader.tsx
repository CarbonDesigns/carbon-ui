import * as React from "react";
import styled from "styled-components";
import theme from "../theme";
import { CarbonLabel } from "../CarbonFlux";
import Icon from "../components/Icon";
import icons from "../theme-icons";

export default class MainMenuHeader extends React.Component<any, any>{
    render(){
        return <MainMenuHeaderContainer>
            <LogoContainer>carbonium</LogoContainer>
            <MenuButton><Icon icon={icons.menu_tutorial} className="_icon" /><CarbonLabel id="@menu_tutorials"/></MenuButton>
            <MenuButton><Icon icon={icons.menu_feedback} className="_icon" /><CarbonLabel id="@menu_feedback"/></MenuButton>
            <MenuButton><CarbonLabel id="@menu_settings"/></MenuButton>
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
    grid-template-columns: 1fr 120px 120px 120px;

    &::after {
        content:" ";
        display:block;
        width:100%;
        height:1px;
        position:absolute;
        bottom:0;
        background: ${theme.separator_color};
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
    grid-template-columns: auto 1fr auto;
    & ._icon {
        margin-right: ${theme.margin2};
    }
`;