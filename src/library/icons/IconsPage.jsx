import React from "react";

import StandardIcons from "./StandardIcons";
import InternalIcons from "./InternalIcons";
import RecentIcons from "./RecentIcons";
import IconFinder from "./IconFinder";
import SearchIcons from "./SearchIcons";
import {listenTo, Component, dispatch} from '../../CarbonFlux';
import {default as TabContainer, TabArea, TabTabs, TabPage} from "../../shared/TabContainer";
import bem from '../../utils/commonUtils';
import libraryTabStore from "../LibraryTabStore";
import LibraryActions from "../LibraryActions";
import InternalIconsStore from "./InternalIconsStore";

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
        return <TabContainer id="icons-page" className="gui-page__content" currentTabId={this.state.tabId} onTabChanged={s => dispatch(LibraryActions.changeTab("icons", s.tabId))}>
            <TabTabs
                items={[
                    <i className="ico--library"/>,
                    <i className="ico--recent"/>,
                    <i className="ico--earth"/>,
                    <i className="ico--search"/>
                ]}
                tabMods="level2"
            />
            <TabArea className="gui-pages" id="icons-page__pages">
                <TabPage tabId="1" className="gui-page">
                    <InternalIcons ref="tab1"/>
                </TabPage>
                <TabPage tabId="2" className="gui-page">
                    <RecentIcons ref="tab2"/>
                </TabPage>
                <TabPage tabId="3" className="gui-page web-icons">
                    <IconFinder ref="tab3"/>
                </TabPage>
                <TabPage tabId="4" className="gui-page tab-page_search">
                    <SearchIcons ref="tab4"/>
                </TabPage>
            </TabArea>
        </TabContainer>
    }
}
