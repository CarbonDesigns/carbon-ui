import * as React from "react";
import * as cx from "classnames";
import * as Immutable from "immutable";

import EditorComponent, { IEditorProps } from "../EditorComponent";
import NumericEditor from "../NumericEditor";
import { richApp } from "../../../RichApp";

import { ISize, Brush } from "carbon-core";
import { PropertyNameContainer, PropertyTupleContainer, PropertyListHeader, PropertyListContainer, PropertyLineContainer } from "../../PropertyStyles";
import { FormattedMessage } from "react-intl";
import Slider from "../../../components/Slider";

import styled from "styled-components";
import BrushEditor from "../BrushEditor";
import { dispatchAction } from "../../../CarbonFlux";

interface INumericEditorProps extends IEditorProps {
}

interface IFillsEditorState {
    value: number | undefined;
}

export default class StrokesEditor extends EditorComponent<ISize, IEditorProps, IFillsEditorState> {
    render() {
        var p = this.props.p;
        var e = this.props.e;

        var value = p.get("value");
        var opacityProp = Immutable.Map({
            descriptor: {
                name: "opacity",
                displayName: "@opacity"
            },
            options: {
                min: 0,
                max: 100,
                step: 1
            },
            value: value.o
        });

        var widthProp = Immutable.Map({
            descriptor: {
                name: "strokeWidth",
                displayName: "@strokeWidth"
            },
            options: {
                min: 0,
                max: 100,
                step: 1
            },
            value: e.strokeWidth()
        });

        return <PropertyListContainer>
            <PropertyListHeader>
                <FormattedMessage id="@strokes" />
            </PropertyListHeader>

            <PropertyLineContainer>
                <BrushEditor e={this.props.e} p={this.props.p} />
                <SliderContainer>
                    <Slider value={value.o * 100}
                        valueChanged={this.onValueChanged}
                        valueChanging={this.onValueChanging}
                    />
                    <NumericEditor e={this.props.e} p={opacityProp}
                        onSettingValue={this.changeOpacityProperty}
                        type="subproperty"
                        uom="%"
                        onPreviewingValue={this.previewOpacityProperty} />
                </SliderContainer>
            </PropertyLineContainer>
            <PropertyLineContainer>
                <div></div>
                <NumericEditor e={this.props.e} p={widthProp}
                        onSettingValue={this.changeStrokeWidthProperty}
                        type="subproperty"
                        uom="px"
                        onPreviewingValue={this.previewStrokeWidthProperty} />
            </PropertyLineContainer>

        </PropertyListContainer>
    }

    onValueChanged = (value) => {
        this.changeOpacityProperty(value, this.props.p);
    }

    onValueChanging = (value) => {
        this.previewOpacityProperty(null, value);
        return value;
    }

    changeOpacityProperty = (value, p) => {
        var brush = Brush.extend(this.props.p.get('value'), { o: value / 100 });

        this.setValueByCommand(brush);
        return false;
    };

    previewOpacityProperty(name, value) {
        var brush = Brush.extend(this.props.p.get('value'), { o: value / 100 });

        this.previewValue(value);
        return false;
    }

    changeStrokeWidthProperty = (value, p) => {
        this.setPropValueByCommand("strokeWidth", value);
        return false;
    };

    previewStrokeWidthProperty(name, value) {
        this.previewPropValue("strokeWidth", value);
        return false;
    }

    setPropValueByCommand = (propName, value, async = false) => {
        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }

        var changes = {};
        changes[propName] = value;

        dispatchAction({ type: "Properties_Changed", changes, async });
    };

    previewPropValue(propName, value){
        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }

        var changes = {};
        changes[propName] = value;

        dispatchAction({ type: "Properties_Preview", changes, async: false });
    }
}

const SliderContainer = styled.div`
    grid-column-gap: 18px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 60px;
    align-items: center;
`;

const BrushLineContainer = styled.div`
    display:grid;
    grid-template-columns:1fr 2fr 1fr;
    grid-column-gap: 10px;
    padding:0 9px;
    margin-top: 9px;
    width:100%;
`;