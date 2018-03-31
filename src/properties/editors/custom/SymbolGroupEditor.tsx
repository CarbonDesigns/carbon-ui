import * as React from "react";
import DropDownEditor from "../DropdownEditor";
import EditorComponent, { IEditorProps, IProperty } from "../EditorComponent";
import { app, IArtboardPage } from "carbon-core";
import { dispatchAction } from "../../../CarbonFlux";
import { PropertiesTab } from "../../PropertyActions";

type SymbolGroupEditorState = {
    property: IProperty;
}

const ManageOption = "_manage";

export default class SymbolGroupEditor extends EditorComponent<string, IEditorProps, SymbolGroupEditorState> {
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
            items: artboardPage.props.symbolGroups
                .map(x => {return { name: x.name, value: x.id }})
                .concat([{ name: this.formatLabel("@page.manageGroups"), value: ManageOption }])
        }
        return props.p.set("options", options);
    }

    private onSettingValue = value => {
        if (value === ManageOption) {
            dispatchAction({ type: "Properties_ChangeTab", tabId: "2" as PropertiesTab });
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