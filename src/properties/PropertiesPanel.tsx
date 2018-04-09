import * as React from "react";
import { Component, listenTo } from "../CarbonFlux";
import { richApp } from "../RichApp";
import Panel from '../layout/Panel'
import ScrollContainer from "../shared/ScrollContainer";

import { PropertyHeader as NameAndLockProps } from "./PropertyHeader";
import { PropertyGroup } from "./PropertyGroup";

import PropertyStore from "./PropertyStore";
import Immutable from 'immutable';
import { TabContainer, TabPage, TabArea } from "../shared/TabContainer";
import { PropertiesTab } from "./PropertyActions";
import SymbolGroupsPanel from "./SymbolGroupsPanel";
import { MarkupLine, Markup } from "../shared/ui/Markup";
import { GuiButton } from "../shared/ui/GuiComponents";
import { FormattedMessage } from "react-intl";
import icons from "../theme-icons";
import ArrangeCommands from './ArrangeCommands';
import { TabAreaStyled, TabPageStyled } from "../components/CommonStyle";

interface IPropertiesPanelProps {
}

interface IPropertiesPanelState {
    groups?: any;
    element?: any,
    nameProperty?: any;
    lockedProperty?: any;
    tabId: PropertiesTab;
}

class PropertiesPanel extends Component<IPropertiesPanelProps, IPropertiesPanelState> {
    constructor(props) {
        super(props);
        this.state = {
            tabId: "1"
        };
    }

    @listenTo(PropertyStore)
    onChange() {
        this.setState({
            element: PropertyStore.state.selection,
            groups: PropertyStore.state.groups,
            nameProperty: PropertyStore.state.nameProperty,
            lockedProperty: PropertyStore.state.lockedProperty,
            tabId: PropertyStore.state.tabId
        });
    }

    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if (!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        var panel: any = this.refs["panel"];
        panel.updateSizeClasses();
    }

    render() {
        let { children, ...rest } = this.props;
        return (
            <Panel ref="panel" {...rest} icon={icons.p_properties} header="Properties" id="edit-panel">
                <TabContainer currentTabId={this.state.tabId}>
                    <TabAreaStyled>
                        <TabPageStyled tabId="1">
                            {this.renderProperties()}
                        </TabPageStyled>
                        <TabPageStyled tabId="2">
                            <SymbolGroupsPanel />
                        </TabPageStyled>
                    </TabAreaStyled>
                </TabContainer>
            </Panel>
        );
    }

    private renderProperties() {
        if (!this.state) {
            return null;
        }

        var content = null;
        var propGroups = this.state.groups;
        if (propGroups) {
            content = propGroups.map(prop_group => {
                if (prop_group.get("hidden")) {
                    return null;
                }
                return <PropertyGroup e={this.state.element} g={prop_group} key={prop_group.get("label")} />;
            })
        }

        if (!content || content.isEmpty()) {
            return <Markup>
                <MarkupLine mods="center">
                    <FormattedMessage tagName="p" id="@properties.empty" />
                </MarkupLine>
            </Markup>
        }

        return <ScrollContainer id="edit__properties" className="thin dark">
            {/* <NameAndLockProps
                e={this.state.element}
                nameProperty={this.state.nameProperty}
                lockedProperty={this.state.lockedProperty}
            /> */}
            <ArrangeCommands/>
            {content}
        </ScrollContainer>
    }
}

export default PropertiesPanel;
