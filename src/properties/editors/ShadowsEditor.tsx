import React from "react";
import {Component} from "../../CarbonFlux";
import EditorComponent, {IEditorProps} from "./EditorComponent";
import ShadowPopup from "./ShadowPopup";
import FlyoutButton, { FlyoutPosition } from "../../shared/FlyoutButton";
import ShadowsList from "./ShadowsList";
import {Shadow, PatchType, createUUID} from "carbon-core";
import AddButton from "../../shared/ui/AddButton";

interface IShadowEditorState {
    newShadow: Shadow;
}

interface IShadowEditorProps extends IEditorProps{
    items: any[];
}

export default class ShadowsEditor extends EditorComponent<Shadow[], IShadowEditorProps, IShadowEditorState> {
    private initialShadows: Shadow[];

    constructor(props) {
        super(props);
        this.state = {newShadow: Object.assign({id: createUUID()}, Shadow.Default)};
    }

    private static FlyoutPosition: FlyoutPosition = {targetVertical: "bottom", disableAutoClose: true};

    render() {
        var items = this.props.p.get('value');
        var classes = this.prop_cn(null, this.widthClass(this.props.className || "prop_width-1-1"));

        return (<div className={classes} style={{height: "auto"}}>
            <div className={ this.b('editor') }>
                <ShadowsList items={items} onOpened={this.onOpenedExisting} onPreview={this.onPreview} onConfirmed={this.onConfirmed}
                             onCancelled={this.onCancelled} onEnableChanged={this.onEnableChanged}
                             onDeleted={this.onDeleted}/>

                <FlyoutButton
                    renderContent={ShadowsEditor.renderSelectedValue}
                    position={ShadowsEditor.FlyoutPosition}
                    onOpened={this.onOpenedNew}
                    ref="add">
                    <ShadowPopup
                        className="flyout__content"
                        value={this.state.newShadow}
                        onConfirmed={this.onConfirmed}
                        onPreview={this.onPreview}
                        onCancelled={this.onCancelled}/>
                </FlyoutButton>
            </div>

        </div>);
    }

    static renderSelectedValue = () => {
        return <AddButton caption="@addshadow" />;
    };

    onOpenedNew = () => {
        this.saveInitialShadows();

        var newShadow = Object.assign({id: createUUID()}, Shadow.Default);
        this.patchValueByCommand(PatchType.Insert, this.state.newShadow, true);
        this.setState({newShadow: newShadow});
    }

    onOpenedExisting = () => {
        this.saveInitialShadows();
    }

    onPreview = (shadow)=> {
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

    private saveInitialShadows() {
        this.initialShadows = this.propertyValue().slice();
    }
}