import * as React from "react";
import * as PropTypes from "prop-types";
import SymbolsPage from "./symbols/SymbolsPage";
import IconsPage from "./icons/IconsPage";
import ImagesPage from "./images/ImagesPage";
import DataPage from "./data/DataPage";
import { TabContainer, TabTabs, TabArea, TabHeader, TabPage } from "../shared/TabContainer";
import Progress from "../shared/Progress";
import Panel from '../layout/Panel'
import { richApp } from "../RichApp";
import { listenTo, Component, dispatch, dispatchAction } from '../CarbonFlux';
import { FormattedMessage, defineMessages } from 'react-intl';
import libraryTabStore from "./LibraryTabStore";
import icons from "../theme-icons";
import { TabAreaStyled, TabPageStyled } from "../components/CommonStyle";
import styled from "styled-components";
import theme from "../theme";

export default class LibraryPanel extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            progressVisible: richApp.libraryProgressStore.isVisible(),
            tabId: libraryTabStore.state.library
        };
    }

    @listenTo(richApp.libraryProgressStore)
    onProgressChanged() {
        this.setState({ progressVisible: richApp.libraryProgressStore.isVisible() });
    }

    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if (!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        (this.refs.panel as any).updateSizeClasses();
    }

    @listenTo(libraryTabStore)
    onTabChanged() {
        this.setState({ tabId: libraryTabStore.state.library });
    }

    render() {
        return (
            <Panel ref="panel" {...this.props} icon={icons.p_symbols} header="Library" id="library-panel">
                <TabContainer currentTabId={this.state.tabId} onTabChanged={tabId => dispatchAction({ type: "Library_Tab", area: "library", tabId })}>

                    <LibraryTabs>
                        <LibraryTab tabId="1"><FormattedMessage id="@library.symbols" /></LibraryTab>
                        <LibraryTab tabId="2"><FormattedMessage id="@library.images" /></LibraryTab>
                        <LibraryTab tabId="3"><FormattedMessage id="@library.icons" /></LibraryTab>
                        <LibraryTab tabId="4"><FormattedMessage id="@library.data" /></LibraryTab>
                    </LibraryTabs>

                    <TabAreaStyled>
                        <TabPageStyled tabId="1">
                            <SymbolsPage />
                        </TabPageStyled>
                        <TabPageStyled tabId="2">
                            <ImagesPage />
                        </TabPageStyled>
                        <TabPageStyled tabId="3">
                            <IconsPage />
                        </TabPageStyled>
                        <TabPageStyled tabId="4">
                            <DataPage />
                        </TabPageStyled>
                    </TabAreaStyled>
                </TabContainer>
            </Panel>
        );
    }
}

const LibraryTabs = styled.div`
    height:45px;
    width:100%;
    margin-top:${theme.margin1};
    display:grid;
    padding:0 ${theme.margin1};
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-column-gap: ${theme.margin1};
    align-content:center;
    justify-items:center;
    text-align:center;
`;

class LibraryTab extends React.Component<any>{
    static contextTypes = {
        activeTabId: PropTypes.string,
        oldTabId: PropTypes.string,
        tabContainer: PropTypes.any
    }

    render() {
        return <LibraryTabContainer
            active={this.props.tabId === this.context.activeTabId}
            data-target-tab={this.props.tabId}
            onClick={this.context.tabContainer.changeTab}
        >{this.props.children}</LibraryTabContainer>;
    }
}

const LibraryTabContainer = styled.div.attrs<any>({}) `
    height:35px;
    display:flex;
    justify-content: center;
    align-items: center;
    width:100%;
    border-radius:3px;
    cursor:pointer;
    font:${theme.tab_font};
    color:${theme.text_color};
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.09);
    background-color: ${p => p.active ? theme.button_active : theme.button_normal};
`;
