import {Component, handles, dispatch, listenTo} from '../../CarbonFlux';
import React from 'react';
import {app, PropertyTracker} from "carbon-core";
import Navigateable from "../../shared/Navigateable";
import {FormattedHTMLMessage, defineMessages} from 'react-intl';
import CustomProviders from './CustomProviders';
import CatalogView from './CatalogView';
import {default as TabContainer, TabTabs, TabArea, TabPage} from "../../shared/TabContainer";
import bem from '../../utils/commonUtils';
import {GuiButton} from "../../shared/ui/GuiComponents";
import libraryTabStore from "../LibraryTabStore";
import LibraryActions from "../LibraryActions";

require("./DataStore");

export default class DataPanel extends Component {
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

        return <div {...this.props} id="data_page" className="data">
            <TabContainer className="gui-page__content" currentTabId={this.state.tabId} onTabChanged={s => dispatch(LibraryActions.changeTab("data", s.tabId))}>
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
                        <Navigateable className="navigateable" getCategoryNode={c => this.refs["catalog"].refs[c]} config={builtInConfig}>
                            <CatalogView ref="catalog" config={builtInConfig} templateType="data"/>
                        </Navigateable>
                    </TabPage>
                    <TabPage tabId="2" className="gui-page"> <CustomProviders/> </TabPage>
                    <TabPage tabId="3" className="gui-page"> <span>json</span> </TabPage>
                    <TabPage tabId="4" className="gui-page"> <span>search</span> </TabPage>
                </TabArea>
            </TabContainer>
        </div>;
    }
}
