import React from 'react';
import DropDownEditor from "../DropdownEditor";
import EditorComponent, { IEditorProps, IProperty } from "../EditorComponent";
import { app, IArtboardPage } from "carbon-core";
import { dispatchAction } from "../../../CarbonFlux";

type ToolboxGroupEditorState = {
    property: IProperty;
}

const ManageOption = "_manage";

export default class ToolboxGroupEditor extends EditorComponent<string, IEditorProps, ToolboxGroupEditorState> {
    constructor(props: IEditorProps, context) {
        super(props, context);

        this.state = {
            property: this.getProperty(props, context)
        }
    }

    componentWillReceiveProps(nextProps: Readonly<IEditorProps>, nextContext) {
        this.setState({ property: this.getProperty(nextProps, nextContext) });
    }

    private getProperty(props, context) {
        let artboardPage = app.activePage as IArtboardPage;
        let options = {
            items: artboardPage.props.toolboxGroups
                .map(x => {return { name: x.name, value: x.id }})
                .concat([{ name: this.formatLabel("@page.manageGroups"), value: ManageOption }])
        }
        return props.p.set("options", options);
    }

    private onSettingValue = value => {
        if (value === ManageOption) {
            dispatchAction({ type: "Properties_ChangeTab", tabId: "2" });
            return false;
        }
        return true;
    }

    render() {
        return <DropDownEditor
            e={this.props.e}
            p={this.state.property}
            onSettingValue={this.onSettingValue}
        />
    }
}