import * as React from "react";
import UserImages from "./UserImages";
import RecentImages from "./RecentImages";
//import RecentIcons from "./RecentIcons";
import Unsplash from "./Unsplash";
//import SearchIcons from "./SearchIcons";
import {richApp} from "../../RichApp";
import { listenTo, Component, dispatch, dispatchAction } from "../../CarbonFlux";
import {TabContainer, TabTabs, TabArea, TabPage} from "../../shared/TabContainer";
import bem from '../../utils/commonUtils';

import libraryTabStore from "../LibraryTabStore";
import SearchImages from "./SearchImages";
import { TabAreaStyled, TabPageStyled } from "../../components/CommonStyle";

export default class ImagesPage extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            tabId: libraryTabStore.state.images
        };
    }

    @listenTo(libraryTabStore)
    onTabChanged(){
        this.setState({tabId: libraryTabStore.state.images});
    }

    render(){
        return <TabContainer id="images-page" className="gui-page__content" currentTabId={this.state.tabId} onTabChanged={tabId => dispatchAction({ type: "Library_Tab", area: "images", tabId})}>
            <TabTabs
                items={[
                    <i className="ico-users"/>,
                    <i className="ico-recent"/>,
                    <i className="ico-earth"/>,
                    <i className="ico-search"/>
                ]}
                tabMods="level2"
            />

            <TabAreaStyled id="icons-page__pages">
                <TabPageStyled tabId="1">
                    <UserImages ref="tab1"/>
                </TabPageStyled>
                <TabPageStyled tabId="2">
                    <RecentImages ref="tab2"/>
                </TabPageStyled>
                <TabPageStyled tabId="3">
                    <Unsplash ref="tab3"/>
                </TabPageStyled>
                <TabPageStyled tabId="4">
                    <SearchImages ref="tab4"/>
                </TabPageStyled>
            </TabAreaStyled>
        </TabContainer>
    }
}
