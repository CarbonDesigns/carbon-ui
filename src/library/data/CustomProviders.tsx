import * as React from "react";
import * as cx from "classnames";
import { GuiButton, GuiInput, GuiCheckbox, GuiTextArea } from "../../shared/ui/GuiComponents";
import { Component, StoreComponent, dispatchAction } from "../../CarbonFlux";
import CatalogView from "./CatalogView";
import customCatalogStore, { CustomCatalogStoreState } from "./CustomCatalogStore";
import { Markup, MarkupLine, MarkupSubmit } from "../../shared/ui/Markup";

export default class CustomProviders extends StoreComponent<{}, CustomCatalogStoreState> {
    refs: {
        name: GuiInput;
        text: GuiTextArea;
    }

    constructor(props) {
        super(props, customCatalogStore);
    }

    _addCatalog = () => {
        dispatchAction({ type: "Data_AddCatalog" });
    };

    _saveCatalog = () => {
        var name = this.refs.name.getValue();
        var data = this.refs.text.getValue();
        dispatchAction({ type: "Data_SaveCatalog", name, data });
    };

    _cancelEditing = () => {
        dispatchAction({ type: "Data_CancelCatalog" });
    };

    render() {
        if (this.state.editing) {
            return this._renderEdit();
        }
        return <div className="fill">
            <GuiButton mods={["full", "hover-success"]} onClick={this._addCatalog} caption="button.addDataset" defaultMessage="Add dataset" bold />
            <CatalogView config={this.state.config} templateType={customCatalogStore.storeType} />
        </div>;
    }

    _renderEdit() {
        return <Markup>
            <MarkupLine mods="stretch">
                <GuiInput ref="name" type="text" placeholder="@data.customName" mods="small" autoFocus />
            </MarkupLine>
            <MarkupLine mods={["fill", "slim", "stretch"]}>
                <GuiTextArea ref="text" placeholder="@data.customBody" mods={["small", "fill"]} />
            </MarkupLine>

            <MarkupLine mods="horizontal">
                <GuiButton mods={["hover-success"]} onClick={this._saveCatalog} caption="button.save" defaultMessage="Save" bold />
                <GuiButton mods={["hover-cancel"]} onClick={this._cancelEditing} caption="button.cancel" defaultMessage="Cancel" bold />
            </MarkupLine>
        </Markup>;
    }
}