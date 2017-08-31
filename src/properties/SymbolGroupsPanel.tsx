import React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import EditableList from "../shared/EditableList";
import { SymbolGroup, IArtboardPage, app, PatchType, IArtboardPageProps, createUUID } from "carbon-core";
import { CarbonAction } from "../CarbonActions";
import AddButton from "../shared/ui/AddButton";
import { MarkupLine, Markup } from "../shared/ui/Markup";
import BackButton from "../shared/ui/BackButton";
import Sortable from "../shared/collections/Sortable";

type SymbolGroupList = new (props) => EditableList<SymbolGroup>;
const SymbolGroupList = EditableList as SymbolGroupList;

type SymbolGroupSortable = new (props) => Sortable<SymbolGroup>;
const SymbolGroupSortable = Sortable as SymbolGroupSortable;

type SymbolGroupsPanelState = {
    groups: SymbolGroup[];
    editingGroup?: SymbolGroup;
}

export default class SymbolGroupsPanel extends Component<{}, SymbolGroupsPanelState> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            groups: (app.activePage as IArtboardPage).props.symbolGroups
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
                if (action.element === app.activePage && props.symbolGroups) {
                    this.setState({ groups: props.symbolGroups });
                }
                return;
        }
    }

    private symbolGroupId(group: SymbolGroup) {
        return group.id;
    }
    private symbolGroupName(group: SymbolGroup) {
        return group.name;
    }

    private canDeleteSymbolGroup = (group: SymbolGroup) => {
        return group.id !== "default";
    }

    private deleteSymbolGroup = (group: SymbolGroup) => {
        app.activePage.patchProps(PatchType.Remove, "symbolGroups", group);
        this.setState({ editingGroup: null });
    }

    private renameSymbolGroup = (name: string, group: SymbolGroup) => {
        let newGroup: SymbolGroup = { id: group.id, name };
        app.activePage.patchProps(PatchType.Change, "symbolGroups", newGroup);
        this.setState({ editingGroup: null });
    }

    private reorderSymbolGroups = (newGroups: SymbolGroup[]) => {
        app.activePage.setProps({ symbolGroups: newGroups });
        this.setState({ editingGroup: null });
    }

    private addSymbolGroup = () => {
        let page = app.activePage as IArtboardPage;
        let i = 1;
        let label = this.formatLabel("@page.symbolGroup") + " ";
        while (page.props.symbolGroups.find(x => x.name === label + i)) {
            ++i;
        }
        let newGroup: SymbolGroup = { id: createUUID(), name: label + i };
        app.activePage.patchProps(PatchType.Insert, "symbolGroups", newGroup);
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
            <SymbolGroupSortable data={page.props.symbolGroups} onSorted={this.reorderSymbolGroups}>
                <SymbolGroupList data={page.props.symbolGroups} idGetter={this.symbolGroupId} nameGetter={this.symbolGroupName}
                    editingItem={this.state.editingGroup}
                    onRename={this.renameSymbolGroup}
                    canDelete={this.canDeleteSymbolGroup}
                    onDelete={this.deleteSymbolGroup} />
            </SymbolGroupSortable>
            <AddButton caption="@page.newSymbolGroup" onClick={this.addSymbolGroup} />
        </div>
    }
}