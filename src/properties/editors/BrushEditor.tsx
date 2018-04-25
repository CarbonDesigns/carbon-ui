import * as React from "react";
import * as cx from "classnames";
import FlyoutButton from '../../shared/FlyoutButton';

import EditorComponent from "./EditorComponent";
import BrushSelector from "./BrushSelector";

import { Brush } from "carbon-core";
import { FormattedMessage } from "react-intl";

import styled from "styled-components";
import theme from "../../theme";

export default class BrushEditor extends EditorComponent<Brush> {
    private _initialValue: Brush;

    renderSelectedValue: any = () => {
        return <BrushIndicator><div style={Brush.toCss(this.propertyValue())}></div></BrushIndicator>;
    };
    saveInitialBrush = () => {
        this._initialValue = this.propertyValue();
    };
    onClosed = () => {
        //setting value from closed might not work, because selection may have been gone already
        delete this._initialValue;
    };
    revertChanges = () => {
        if (this._initialValue) {
            this.setValueByCommand(this._initialValue);
        }
    };
    private onPreview = value => {
        this.previewValue(value);
    }

    render() {
        var p = this.props.p;
        var showGradient = this.extractOption(this.props, "gradient", false);
        return <FlyoutButton
            renderContent={this.renderSelectedValue}
            position={{ targetVertical: "bottom", disableAutoClose: true }}
            onOpened={this.saveInitialBrush}
            onClosed={this.onClosed}
        >
            <BrushSelector
                brush={this.propertyValue()}
                hasGradient={showGradient}
                onSelected={this.setValueByCommand}
                onPreview={this.onPreview}
                onCancelled={this.revertChanges}
            />
        </FlyoutButton>;
    }
}

const BrushIndicator = styled.div`
    width:47px;
    height:28px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.11);
    border-radius: 3px;
    background:${theme.input_background};
    display: flex;
    justify-content: center;
    align-items: center;

    & div {
        width: 35px;
        height: 21px;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.11);
        border-radius: 2px;
    }
`;