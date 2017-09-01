import React from "react";
import Symbols from "./Symbols";
import RecentSymbols from "./RecentSymbols";
import SearchSymbols from "./SearchSymbols";
import {domUtil} from "carbon-core";
import { listenTo, Component, dispatch, dispatchAction } from "../../CarbonFlux";
// import {default as TabContainer, TabArea, TabHeader, TabPage} from "../../shared/TabContainer";
import {default as TabContainer, TabTabs, TabArea, TabPage} from "../../shared/TabContainer";
import bem from '../../utils/commonUtils';

import libraryTabStore from "../LibraryTabStore";


export default class SymbolsPage extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            tabId: libraryTabStore.state.stencils
        };
    }

    @listenTo(libraryTabStore)
    onTabChanged(){
        this.setState({tabId: libraryTabStore.state.stencils});
    }

    render(){
        return <TabContainer id="stencils-page" className="gui-page__content" currentTabId={this.state.tabId} onTabChanged={tabId => dispatchAction({ type: "Library_Tab", area: "stencils", tabId})}>
            <TabTabs
                items={[
                    <i className="ico-library"/>,
                    <i className="ico-recent"/>,
                    <i className="ico-search"/>
                ]}
                tabMods="level2"
            />
            <TabArea className="gui-pages" id="stencils-page__pages">
                <TabPage tabId="1" className="gui-page">
                    <Symbols ref="tab1"/>
                </TabPage>
                <TabPage tabId="2" className="gui-page">
                    <RecentSymbols ref="tab2" />
                </TabPage>
                <TabPage tabId="3" className="gui-page tab-page_search">
                    <SearchSymbols ref="tab4" />
                </TabPage>
            </TabArea>
        </TabContainer>;
    }
}
