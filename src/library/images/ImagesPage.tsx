import * as React from "react";
import UserImages from "./UserImages";
import RecentImages from "./RecentImages";
//import RecentIcons from "./RecentIcons";
import Unsplash from "./Unsplash";
//import SearchIcons from "./SearchIcons";
import { richApp } from "../../RichApp";
import { listenTo, Component, dispatch, dispatchAction } from "../../CarbonFlux";
import { TabContainer, TabTabs, TabArea, TabPage } from "../../shared/TabContainer";
import bem from '../../utils/commonUtils';

import libraryTabStore from "../LibraryTabStore";
import SearchImages from "./SearchImages";
import { TabAreaStyled, TabPageStyled } from "../../components/CommonStyle";
import styled from "styled-components";
import Search from "../../shared/Search";

export default class ImagesPage extends Component<any, any> {
    private tabContainer: TabContainer;
    private unsplash: Unsplash;

    constructor(props) {
        super(props);
        this.state = {
            tabId: libraryTabStore.state.images
        };
    }

    @listenTo(libraryTabStore)
    onTabChanged() {
        this.setState({ tabId: libraryTabStore.state.images });
    }

    onSearch = (term) => {
        if (term) {
            if (this.tabContainer.state.tabId !== "2") {
                this.tabContainer.changeTabById("2");
            }
        } else if (this.tabContainer.state.tabId !== "1") {
            this.tabContainer.changeTabById("1");
        }
        this.unsplash.onSearch(term);
    }

    render() {
        return <TabContainer ref={t => this.tabContainer = t} id="images-page" className="gui-page__content" currentTabId={this.state.tabId} onTabChanged={tabId => dispatchAction({ type: "Library_Tab", area: "images", tabId })}>
            <SearchContainer>
                <Search query={this.state.query} onQuery={this.onSearch} placeholder="@images.find" ref="search" />
            </SearchContainer>

            <TabAreaStyled id="icons-page__pages">
                <TabPageStyled tabId="1">
                    <UserImages ref="tab1" />
                </TabPageStyled>
                <TabPageStyled tabId="2">
                    <Unsplash ref={u => this.unsplash = u} />
                </TabPageStyled>
                {/* <TabPageStyled tabId="4">
                    <SearchImages ref="tab4"/>
                </TabPageStyled> */}
            </TabAreaStyled>
        </TabContainer>
    }
}

const SearchContainer = styled.div`

`;
