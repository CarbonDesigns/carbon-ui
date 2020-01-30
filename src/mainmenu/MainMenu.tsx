import * as React from "react";
import * as ReactDom from "react-dom";
import AppActions from '../RichAppActions';
import { handles, ComponentWithImmutableState } from '../CarbonFlux';
import { Record } from "immutable";
import appStore from "../AppStore";

import styled from "styled-components";
import theme from "../theme";
import MainMenuHeader from "./MainMenuHeader";
import { backend } from "carbon-api";
import MainMenuProjects from "./MainMenuProjects";
import MainMenuLogin from "./MainMenuLogin";
// import MainMenuGallery from "./MainMenuGallery";
import ImportResourceControl from "../import/ImportResourceControl";

var State = Record({
    mainMenuVisible: false,
    recentProjects: []
});

export default class MainMenu extends ComponentWithImmutableState<any, any> {
    private menuContainer: React.RefObject<HTMLDivElement>;

    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                mainMenuVisible: appStore.state.mainMenuVisible,
                recentProjects: []
            })
        };

        this.menuContainer = React.createRef<HTMLDivElement>();
    }

    @handles(AppActions.showMainMenu)
    onShowMenu() {
        this.menuContainer.current.style.display = "grid";
    }

    @handles(AppActions.hideMainMenu)
    onHideMenu() {
        this.menuContainer.current.style.display = "none";
    }

    render() {
        let loggedIn = backend.isLoggedIn() && !backend.isGuest();
        let recentProjects = [];
        return <MainMenuBackground ref={this.menuContainer} className="@mainMenu">
            <MainMenuContainer>
                <MainMenuHeader></MainMenuHeader>
                <MainMenuBody>
                    {loggedIn?<MainMenuProjects recentProjects={recentProjects}/>:<MainMenuLogin/>}
                    <ImportResourceControl/>
                </MainMenuBody>
            </MainMenuContainer>
        </MainMenuBackground>;
    }
}

const MainMenuBackground = styled.div`
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    display:none;
    background: ${theme.workspace_background};
    z-index:100000;
    padding: 0 40px;
`;


const MainMenuContainer = styled.div`
    width:100%;
    height:100%;
    max-width: 1200px;
    margin: 0 auto;
    display:grid;
    grid-template-rows: auto 1fr;
`;

const MainMenuBody = styled.div`
    display:grid;
    grid-template-columns: 380px 1fr;
`;
