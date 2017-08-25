import React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import EditableList from "../shared/EditableList";
import { ToolboxGroup, IArtboardPage, app, PatchType, IArtboardPageProps, createUUID } from "carbon-core";
import { CarbonAction } from "../CarbonActions";
import AddButton from "../shared/ui/AddButton";
import { MarkupLine, Markup } from "../shared/ui/Markup";
import BackButton from "../shared/ui/BackButton";
import Sortable from "../shared/collections/Sortable";

type ToolboxGroupList = new (props) => EditableList<ToolboxGroup>;
const ToolboxGroupList = EditableList as ToolboxGroupList;

type ToolboxGroupSortable = new (props) => Sortable<ToolboxGroup>;
const ToolboxGroupSortable = Sortable as ToolboxGroupSortable;

type ToolboxGroupsPanelState = {
    groups: ToolboxGroup[];
    editingGroup?: ToolboxGroup;
}

export default class ToolboxGroupsPanel extends Component<{}, ToolboxGroupsPanelState> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            groups: (app.activePage as IArtboardPage).props.toolboxGroups
        }
    }

    componentDidMount() {
        super.componentDidMount();
        app.activePage.enablePropsTracking();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        app.activePage.disablePropsTracking();
    }

    canHandleActions() {
        return true;
    }

    onAction(action: CarbonAction) {
        switch (action.type) {
            case "Carbon_PropsChanged":
                let props = action.props as Partial<IArtboardPageProps>;
                if (action.element === app.activePage && props.toolboxGroups) {
                    this.setState({ groups: props.toolboxGroups });
                }
                return;
        }
    }

    private toolboxGroupId(group: ToolboxGroup) {
        return group.id;
    }
    private toolboxGroupName(group: ToolboxGroup) {
        return group.name;
    }

    private canDeleteToolboxGroup = (group: ToolboxGroup) => {
        return group.id !== "default";
    }

    private deleteToolboxGroup = (group: ToolboxGroup) => {
        app.activePage.patchProps(PatchType.Remove, "toolboxGroups", group);
        this.setState({ editingGroup: null });
    }

    private renameToolboxGroup = (name: string, group: ToolboxGroup) => {
        let newGroup: ToolboxGroup = { id: group.id, name };
        app.activePage.patchProps(PatchType.Change, "toolboxGroups", newGroup);
        this.setState({ editingGroup: null });
    }

    private reorderToolboxGroups = (newGroups: ToolboxGroup[]) => {
        app.activePage.setProps({ toolboxGroups: newGroups });
        this.setState({ editingGroup: null });
    }

    private addToolboxGroup = () => {
        let page = app.activePage as IArtboardPage;
        let i = 1;
        let label = this.formatLabel("@page.toolboxGroup") + " ";
        while (page.props.toolboxGroups.find(x => x.name === label + i)) {
            ++i;
        }
        let newGroup: ToolboxGroup = { id: createUUID(), name: label + i };
        app.activePage.patchProps(PatchType.Insert, "toolboxGroups", newGroup);
        this.setState({ editingGroup: newGroup });
    }

    private goBack() {
        dispatchAction({ type: "Properties_ChangeTab", tabId: "1" });
    }

    render() {
        let page = app.activePage as IArtboardPage;
        return <div>
            <Markup>
                <MarkupLine>
                    <BackButton onClick={this.goBack} caption="@back" />
                </MarkupLine>
            </Markup>
            <ToolboxGroupSortable data={page.props.toolboxGroups} onSorted={this.reorderToolboxGroups}>
                <ToolboxGroupList data={page.props.toolboxGroups} idGetter={this.toolboxGroupId} nameGetter={this.toolboxGroupName}
                    editingItem={this.state.editingGroup}
                    onRename={this.renameToolboxGroup}
                    canDelete={this.canDeleteToolboxGroup}
                    onDelete={this.deleteToolboxGroup} />
            </ToolboxGroupSortable>
            <AddButton caption="@page.newToolboxGroup" onClick={this.addToolboxGroup} />
        </div>
    }
}