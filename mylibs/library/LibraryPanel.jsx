import React from "react";
import StencilsPage from "./stencils/StencilsPage";
import IconsPage from "./icons/IconsPage";
import ImagesPage from "./images/ImagesPage";
import DataPage from "./data/DataPage";
import {default as TabContainer, TabTabs, TabArea, TabHeader, TabPage} from "../shared/TabContainer";
import Progress from "../shared/Progress";
import Panel from '../layout/Panel'
import {richApp} from "../RichApp";
import {listenTo, Component, dispatch} from '../CarbonFlux';
import {FormattedHTMLMessage, defineMessages} from 'react-intl';
import libraryTabStore from "./LibraryTabStore";
import LibraryActions from "./LibraryActions";

const messages = defineMessages({
    Stencils: {
        defaultMessage: 'Stencils',
        id: 'Stencils'
    },
    Icons: {
        defaultMessage: 'Icons',
        id: 'Icons'
    },
    Images: {
        defaultMessage: 'Images',
        id: 'Images'
    },
    Data: {
        defaultMessage: 'Data',
        id: 'Data'
    }
});

export default class LibraryPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progressVisible:richApp.libraryProgressStore.isVisible(),
            tabId: libraryTabStore.state.library
        };
    }

    @listenTo(richApp.libraryProgressStore)
    onProgressChanged(){
        this.setState({progressVisible:richApp.libraryProgressStore.isVisible()});
    }

    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if(!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        this.refs.panel.updateSizeClasses();
    }

    @listenTo(libraryTabStore)
    onTabChanged(){
        this.setState({tabId: libraryTabStore.state.library});
    }

    render() {
        return (
            <Panel ref="panel" {...this.props} header="Library" id="library-panel">
                <TabContainer currentTabId={this.state.tabId} onTabChanged={s => dispatch(LibraryActions.changeTab("library", s.tabId))}>
                    <TabTabs
                        tabMods="level1"
                        insertBefore={this.state.progressVisible ? <Progress /> : null}
                        items={[
                            <FormattedHTMLMessage tagName="h5" {...messages.Stencils}/>,
                            <FormattedHTMLMessage tagName="h5" {...messages.Icons}/>,
                            <FormattedHTMLMessage tagName="h5" {...messages.Images}/>,
                            <FormattedHTMLMessage tagName="h5" {...messages.Data}/>
                        ]}
                    />

                    <TabArea className="gui-pages panel__stretcher">
                        <TabPage tabId="1" className="gui-page">
                            <StencilsPage />
                        </TabPage>
                        <TabPage tabId="2" className="gui-page">
                            <IconsPage />
                        </TabPage>
                        <TabPage tabId="3" className="gui-page">
                            <ImagesPage />
                        </TabPage>
                        <TabPage tabId="4" className="gui-page">
                            <DataPage />
                        </TabPage>
                    </TabArea>
                </TabContainer>

            </Panel>
        );
    }
}
