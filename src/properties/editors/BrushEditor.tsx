import React, {ReactHTMLElement} from 'react';
import cx from "classnames";
import FlyoutButton from '../../shared/FlyoutButton';

import EditorComponent, {IEditorProps, IEditorState} from "./EditorComponent";
import BrushSelector from "./BrushSelector";

import {Brush} from "carbon-core";
import {FormattedHTMLMessage} from "react-intl";

export default class BrushEditor extends EditorComponent<IEditorProps, IEditorState<Brush>> {
    private _initialValue: Brush;

    renderSelectedValue: any = () => {
        return <q style={Brush.toCss(this.state.value)}></q>;
    };
    saveInitialBrush = () => {
        this._initialValue = this.state.value;
    };
    onClosed = () => {
        //setting value from closed might not work, because selection may have been gone already
        delete this._initialValue;
    };
    revertChanges = () => {
        if (this._initialValue){
            this.setValueByCommand(this._initialValue);
        }
    };
    render(){
        var p = this.props.p;
        var classes = cx("prop prop_colorpicker", this.widthClass(this.props.className || "prop_width-1-2"));
        return <div className={classes}>
            <div className="prop__name"><FormattedHTMLMessage id={this.displayName()}/></div>
            <FlyoutButton
                className="prop__value"
                ref="flyout"
                renderContent={this.renderSelectedValue}
                position={{targetVertical: "bottom", disableAutoClose: true}}
                onOpened={this.saveInitialBrush}
                onClosed={this.onClosed}
            >
                <BrushSelector
                    className="flyout__content" ref="selector"
                    brush={this.state.value}
                    onSelected={this.setValueByCommand}
                    onCancelled={this.revertChanges}
                />
            </FlyoutButton>
        </div>;
    }

}