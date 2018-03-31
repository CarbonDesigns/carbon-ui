import * as React from "react";
import * as cx from "classnames";
import FlyoutButton from '../../shared/FlyoutButton';

import EditorComponent from "./EditorComponent";
import BrushSelector from "./BrushSelector";

import {Brush} from "carbon-core";
import {FormattedMessage} from "react-intl";

export default class BrushEditor extends EditorComponent<Brush> {
    private _initialValue: Brush;

    renderSelectedValue: any = () => {
        return <q style={Brush.toCss(this.propertyValue())}></q>;
    };
    saveInitialBrush = () => {
        this._initialValue = this.propertyValue();
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
    private onPreview = value => {
        this.previewValue(value);
    }

    render(){
        var p = this.props.p;
        var classes = cx("prop prop_colorpicker", this.widthClass(this.props.className || "prop_width-1-2"));
        var showGradient = this.extractOption(this.props, "gradient", false);
        return <div className={classes}>
            <div className="prop__name"><FormattedMessage id={this.displayName()}/></div>
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
                    brush={this.propertyValue()}
                    hasGradient={showGradient}
                    onSelected={this.setValueByCommand}
                    onPreview={this.onPreview}
                    onCancelled={this.revertChanges}
                />
            </FlyoutButton>
        </div>;
    }

}