import { Component, handles, dispatch, listenTo, dispatchAction } from '../../CarbonFlux';
import * as React from "react";
import { app, PropertyTracker } from "carbon-core";
import Navigatable from "../../shared/Navigatable";
import { FormattedMessage, defineMessages } from 'react-intl';
import CustomProviders from './CustomProviders';
import CatalogView from './CatalogView';
import { TabContainer, TabTabs, TabArea, TabPage } from "../../shared/TabContainer";
import bem from '../../utils/commonUtils';
import { GuiButton } from "../../shared/ui/GuiComponents";
import libraryTabStore from "../LibraryTabStore";
import BuiltInProviders from "./BuiltInProviders";
import NotReady from "../../shared/NotReady";
import DataSearch from "./DataSearch";
import { TabAreaStyled, TabPageStyled } from '../../components/CommonStyle';

require("./DataStore");

type DataPanelState = {
    tabId: string;
}

export default class DataPanel extends Component<{}, DataPanelState> {
    refs: {
        catalog: Navigatable;
    }

    constructor(props) {
        super(props);
        this.state = {
            tabId: libraryTabStore.state.data
        };
    }

    @listenTo(libraryTabStore)
    onTabChanged() {
        this.setState({ tabId: libraryTabStore.state.data });
    }

    render() {
        var { children, ...rest } = this.props;

        return <TabContainer className="gui-page__content data" currentTabId={this.state.tabId} onTabChanged={tabId => dispatchAction({ type: "Library_Tab", area: "data", tabId})}>
            <TabTabs
                items={[
                    <i className="ico-library" />,
                    <i className="ico-users" />,
                    <i className="ico-earth" />,
                    <i className="ico-search" />
                ]}
                tabMods="level2"
            />
            <TabAreaStyled>
                <TabPageStyled tabId="1"> <BuiltInProviders /></TabPageStyled>
                <TabPageStyled tabId="2"> <CustomProviders /> </TabPageStyled>
                <TabPageStyled tabId="3"> <NotReady feature="dataJson"/> </TabPageStyled>
                <TabPageStyled tabId="4"> <DataSearch/> </TabPageStyled>
            </TabAreaStyled>
        </TabContainer>;
    }
}

