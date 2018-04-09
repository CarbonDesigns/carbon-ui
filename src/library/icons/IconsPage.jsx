import * as React from "react";

import InternalIcons from "./InternalIcons";
import RecentIcons from "./RecentIcons";
import IconFinder from "./IconFinder";
import SearchIcons from "./SearchIcons";
import {listenTo, Component, dispatch, dispatchAction} from '../../CarbonFlux';
import {TabContainer, TabArea, TabTabs, TabPage} from "../../shared/TabContainer";
import bem from '../../utils/commonUtils';
import libraryTabStore from "../LibraryTabStore";
import InternalIconsStore from "./InternalIconsStore";
import { TabAreaStyled, TabPageStyled } from "../../components/CommonStyle";

export default class IconsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabId: libraryTabStore.state.icons
        };
    }

    @listenTo(libraryTabStore)
    onTabChanged(){
        this.setState({tabId: libraryTabStore.state.icons});
    }

    render(){
        return <TabContainer id="icons-page" className="gui-page__content" currentTabId={this.state.tabId} onTabChanged={tabId => dispatchAction({type: "Library_Tab", area: "icons", tabId})}>
            <TabTabs
                items={[
                    <i className="ico-library"/>,
                    <i className="ico-recent"/>,
                    <i className="ico-earth"/>,
                    <i className="ico-search"/>
                ]}
                tabMods="level2"
            />
            <TabAreaStyled id="icons-page__pages">
                <TabPageStyled tabId="1">
                    <InternalIcons ref="tab1"/>
                </TabPageStyled>
                <TabPageStyled tabId="2">
                    <RecentIcons ref="tab2"/>
                </TabPageStyled>
                <TabPageStyled tabId="3">
                    <IconFinder ref="tab3"/>
                </TabPageStyled>
                <TabPageStyled tabId="4">
                    <SearchIcons ref="tab4"/>
                </TabPageStyled>
            </TabAreaStyled>
        </TabContainer>
    }
}
