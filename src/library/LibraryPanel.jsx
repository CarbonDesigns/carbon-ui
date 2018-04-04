import * as React from "react";
import SymbolsPage from "./symbols/SymbolsPage";
import IconsPage from "./icons/IconsPage";
import ImagesPage from "./images/ImagesPage";
import DataPage from "./data/DataPage";
import {TabContainer, TabTabs, TabArea, TabHeader, TabPage} from "../shared/TabContainer";
import Progress from "../shared/Progress";
import Panel from '../layout/Panel'
import {richApp} from "../RichApp";
import {listenTo, Component, dispatch, dispatchAction} from '../CarbonFlux';
import {FormattedMessage, defineMessages} from 'react-intl';
import libraryTabStore from "./LibraryTabStore";
import icons from "../theme-icons";

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
            <Panel ref="panel" {...this.props} icon={icons.p_symbols} header="Library" id="library-panel">
                <TabContainer currentTabId={this.state.tabId} onTabChanged={tabId => dispatchAction({type: "Library_Tab", area: "library", tabId})}>
                    <TabTabs
                        tabMods="level1"
                        insertBefore={this.state.progressVisible ? <Progress /> : null}
                        items={[
                            <FormattedMessage tagName="h5" id="@library.symbols"/>,
                            <FormattedMessage tagName="h5" id="@library.icons"/>,
                            <FormattedMessage tagName="h5" id="@library.images"/>,
                            <FormattedMessage tagName="h5" id="@library.data"/>
                        ]}
                    />

                    <TabArea className="gui-pages">
                        <TabPage tabId="1" className="gui-page">
                            <SymbolsPage />
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
