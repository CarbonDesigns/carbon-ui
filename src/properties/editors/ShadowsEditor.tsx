import * as React from "react";
import * as Immutable from "immutable";
import { Component, CarbonLabel } from "../../CarbonFlux";
import EditorComponent, { IEditorProps } from "./EditorComponent";
import FlyoutButton, { FlyoutPosition } from "../../shared/FlyoutButton";
import ShadowsList from "./ShadowsList";
import { Shadow, PatchType, createUUID } from "carbon-core";
import IconButton from "../../components/IconButton";
import theme from "../../theme";
import icons from "../../theme-icons";
import { PropertyNameContainer, PropertyTupleContainer, PropertyListHeader, PropertyListContainer, PropertyLineContainer } from "../PropertyStyles";

interface IShadowEditorState {
    newShadow: Shadow;
}

interface IShadowEditorProps extends IEditorProps {
    items: any[];
}

export default class ShadowsEditor extends EditorComponent<Shadow[], IShadowEditorProps, IShadowEditorState> {
    private initialShadows: Shadow[];

    constructor(props) {
        super(props);
    }

    _addShadow = () => {
        var newShadow = Object.assign({ id: createUUID() }, Shadow.Default);
        this.patchValueByCommand(PatchType.Insert, newShadow, true);
    }

    _addInnerShadow = () => {
        var newShadow = Object.assign({ id: createUUID() }, Shadow.Default, {inset:true});
        this.patchValueByCommand(PatchType.Insert, newShadow, true);
    }


    render() {
        let items = this.props.p.get('value');
        let shadows = items.filter(x=>!x.inset);
        let innerShadows = items.filter(x=>x.inset);

        return [<PropertyListContainer>
            <PropertyListHeader>
                <CarbonLabel id="@outerShadows" />
                <IconButton icon={icons.add} onClick={this._addShadow}></IconButton>
            </PropertyListHeader>
            <ShadowsList items={shadows} onPreview={this.onPreview} onConfirmed={this.onConfirmed}
                onCancelled={this.onCancelled} onEnableChanged={this.onEnableChanged}
                onDeleted={this.onDeleted} />
        </PropertyListContainer>,
        <PropertyListContainer>
            <PropertyListHeader>
                <CarbonLabel id="@innerShadows" />
                <IconButton icon={icons.add} onClick={this._addInnerShadow}></IconButton>
            </PropertyListHeader>
            <ShadowsList items={innerShadows} onPreview={this.onPreview} onConfirmed={this.onConfirmed}
                onCancelled={this.onCancelled} onEnableChanged={this.onEnableChanged}
                onDeleted={this.onDeleted} />
        </PropertyListContainer>
        ]
    }

    onPreview = (shadow) => {
        this.previewPatchValue(PatchType.Change, shadow);
    }

    onEnableChanged = (shadow) => {
        this.patchValueByCommand(PatchType.Change, shadow, true);
    }

    onConfirmed = (shadow) => {
        this.patchValueByCommand(PatchType.Change, shadow, true);
    };
    onCancelled = () => {
        if (this.initialShadows) {
            this.setValueByCommand(this.initialShadows);
        }
    };

    onDeleted = (shadowItem) => {
        this.patchValueByCommand(PatchType.Remove, shadowItem.shadow, true);
    }
}