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

export default class ShadowsEditor extends EditorComponent<Shadow, IShadowEditorProps, IShadowEditorState> {
    private _lastShadow: Shadow;

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
                <ShadowsList items={items} onPreview={this.onPreview} onConfirmed={this.onConfirmed}
                             onCancelled={this.onCancelled} onEnableChanged={this.onEnableChanged}
                             onDeleted={this.onDeleted}/>

                <FlyoutButton
                    renderContent={ShadowsEditor.renderSelectedValue}
                    position={ShadowsEditor.FlyoutPosition}
                    onOpened={this.onOpened}
                    onClosed={this.onClosed}
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

    onOpened = () => {
        var newShadow = Object.assign({id: createUUID()}, Shadow.Default);
        this.patchValueByCommand(PatchType.Insert, this.state.newShadow, true);
        this.setState({newShadow: newShadow});
        this._lastShadow = null;
    };

    onClosed = ()=> {
        if (this._lastShadow) {
            this.patchValueByCommand(PatchType.Change, this._lastShadow, true);
        }
    }


    onPreview = (shadow)=> {
        this.previewPatchValue(PatchType.Change, shadow);
        this._lastShadow = shadow;
    }

    onEnableChanged = (shadow) => {
        this.patchValueByCommand(PatchType.Change, shadow, true);
    }

    onConfirmed = (shadow) => {
        this.patchValueByCommand(PatchType.Change, shadow, true);
    };
    onCancelled = () => {
        this.cancelEdit();
        this._lastShadow = null;
    };

    onDeleted = (shadowItem) => {
        this.patchValueByCommand(PatchType.Remove, shadowItem.shadow, true);
    }
}