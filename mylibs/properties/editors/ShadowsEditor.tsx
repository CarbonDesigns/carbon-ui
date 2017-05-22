import React from "react";
import {Component} from "../../CarbonFlux";
import EditorComponent, {IEditorProps, IEditorState} from "./EditorComponent";
import ShadowPopup from "./ShadowPopup";
import FlyoutButton from "../../shared/FlyoutButton";
import AddButton from "./AddButton";
import ShadowsList from "./ShadowsList";
import {Shadow, PatchType, createUUID} from "carbon-core";

interface IShadowEditorState extends IEditorState<Shadow>{
    newShadow: Shadow;
}

interface IShadowEditorProps extends IEditorProps{
    items: any[];
}

export default class ShadowsEditor extends EditorComponent<IShadowEditorProps, IShadowEditorState> {
    private _lastShadow: Shadow;

    constructor(props) {
        super(props);
        this.state = {newShadow: Object.assign({id: createUUID()}, Shadow.Default)};
    }

    render() {
        // var items = this.option(this.props, "items", [
        //     { id: '1', enabled: false,   inset: true,   color: "grey",   x:   0,  y: 2,  size: 0,  blur: 4  },
        //     { id: '2', enabled: true ,   inset: false,  color: "red" ,   x: -80,  y: 2,  size: 2,  blur: 4  },
        // ]);

        var items = this.props.p.get('value');

        var classes = this.prop_cn(null, this.widthClass(this.props.className || "prop_width-1-1"));

        return (<div className={classes} style={{height: "auto"}}>
            {this._renderPropName()}
            <div className={ this.b('editor') }>
                <ShadowsList items={items} onPreview={this.onPreview} onConfirmed={this.onConfirmed}
                             onCancelled={this.onCancelled} onEnableChanged={this.onEnableChanged}/>

                <FlyoutButton
                    renderContent={this.renderSelectedValue}
                    position={{targetVertical: "bottom", disableAutoClose: true}}
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

    renderSelectedValue = () => {
        return <AddButton caption="@addshadow" defaultMessage="add shadow"/>;
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
}