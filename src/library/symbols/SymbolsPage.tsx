import * as React from "react";
import Symbols from "./Symbols";
import RecentSymbols from "./RecentSymbols";
import SearchSymbols from "./SearchSymbols";
import { listenTo, Component, dispatch, dispatchAction } from "../../CarbonFlux";
import { TabContainer, TabTabs, TabArea, TabPage } from "../../shared/TabContainer";
import bem from '../../utils/commonUtils';

import libraryTabStore from "../LibraryTabStore";
import { TabAreaStyled, TabPageStyled } from "../../components/CommonStyle";


export default class SymbolsPage extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            tabId: libraryTabStore.state.stencils
        };
    }

    @listenTo(libraryTabStore)
    onTabChanged() {
        this.setState({ tabId: libraryTabStore.state.stencils });
    }

    render() {
        return <TabContainer id="stencils-page" className="gui-page__content" currentTabId={this.state.tabId} onTabChanged={tabId => dispatchAction({ type: "Library_Tab", area: "stencils", tabId })}>
            <TabTabs
                items={[
                    <i className="ico-library" />,
                    <i className="ico-recent" />,
                    <i className="ico-search" />
                ]}
                tabMods="level2"
            />
            <TabAreaStyled id="stencils-page__pages">
                <TabPageStyled tabId="1">
                    <Symbols ref="tab1" />
                </TabPageStyled>
                <TabPageStyled tabId="2">
                    <RecentSymbols ref="tab2" />
                </TabPageStyled>
                <TabPageStyled tabId="3">
                    <SearchSymbols ref="tab4" />
                </TabPageStyled>
            </TabAreaStyled>
        </TabContainer>;
    }
}
