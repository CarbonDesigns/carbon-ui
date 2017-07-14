import {Component, handles, dispatch, listenTo} from '../../CarbonFlux';
import React from 'react';
import {app, PropertyTracker} from "carbon-core";
import Navigatable from "../../shared/Navigatable";
import {FormattedHTMLMessage, defineMessages} from 'react-intl';
import CustomProviders from './CustomProviders';
import CatalogView from './CatalogView';
import {default as TabContainer, TabTabs, TabArea, TabPage} from "../../shared/TabContainer";
import bem from '../../utils/commonUtils';
import {GuiButton} from "../../shared/ui/GuiComponents";
import libraryTabStore from "../LibraryTabStore";
import LibraryActions from "../LibraryActions";

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
    onTabChanged(){
        this.setState({tabId: libraryTabStore.state.data});
    }

    render(){
        var builtInConfig = app.dataManager.getBuiltInProvider().getConfig();
        var {children, ...rest} = this.props;

        return <TabContainer className="gui-page__content data" currentTabId={this.state.tabId} onTabChanged={tabId => dispatch(LibraryActions.changeTab("data", tabId))}>
                <TabTabs
                    items={[
                        <i className="ico--library"/>,
                        <i className="ico--users"/>,
                        <i className="ico--earth"/>,
                        <i className="ico--search"/>
                    ]}
                    tabMods="level2"
                />
                <TabArea className="gui-pages">
                    <TabPage tabId="1" className="gui-page">
                        <Navigatable className="Navigatable" getCategoryNode={c => this.refs.catalog.refs[c]} config={builtInConfig}>
                            <CatalogView ref="catalog" config={builtInConfig} templateType="data"/>
                        </Navigatable>
                    </TabPage>
                    <TabPage tabId="2" className="gui-page"> <CustomProviders/> </TabPage>
                    <TabPage tabId="3" className="gui-page"> <span>json</span> </TabPage>
                    <TabPage tabId="4" className="gui-page"> <span>search</span> </TabPage>
                </TabArea>
            </TabContainer>;
    }
}

