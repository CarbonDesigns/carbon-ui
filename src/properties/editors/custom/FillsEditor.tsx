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
import { GuiCheckbox } from "../../../shared/ui/GuiComponents";
import theme from "../../../theme";

interface INumericEditorProps extends IEditorProps {
}

interface IFillsEditorState {
    value: number | undefined;
}

export default class FillsEditor extends EditorComponent<ISize, IEditorProps, IFillsEditorState> {
    _enableChanged = (event) => {
        var newBrush = Brush.extend(this.props.p.get('value') as any, { e: event.target.checked });
        this.setValueByCommand(newBrush);
    }

    render() {
        var p = this.props.p;
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
            value: value.o * 100
        });

        // "strokeWidth", "strokePosition", "dashPattern", "miterLimit", "lineCap", "lineJoin"
        return <PropertyListContainer>
            <PropertyListHeader>
                <FormattedMessage id="@fills" />
            </PropertyListHeader>

            <PropertyFillLineContainer>
                <GuiCheckbox labelless={true} checked={value.e} onChange={this._enableChanged}/>
                <BrushEditor e={this.props.e} p={this.props.p} />
                <SliderContainer>
                    <Slider value={value.o * 100}
                        valueChanged={this.onValueChanged}
                        valueChanging={this.onValueChanging}
                    />
                    <NumericEditor e={this.props.e} p={opacityProp}
                        onSettingValue={this.changeOpacityProperty}
                        uom={'%'}
                        type="subproperty"
                        onPreviewingValue={this.previewOpacityProperty} />
                </SliderContainer>
            </PropertyFillLineContainer>

        </PropertyListContainer>
    }

    onValueChanged = (value) => {
        this.changeOpacityProperty(value, this.props.p.get('value'));
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

        this.previewValue(brush);
        return false;
    }
}

const SliderContainer = styled.div`
    grid-column-gap: 18px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr ${theme.rightPropSize};
    align-items: center;
`;

const PropertyFillLineContainer = styled.div`
    display:grid;
    grid-template-columns:26px 54px 1fr;
    align-items:center;
    grid-column-gap: ${theme.margin1};
    padding:0 ${theme.margin1};
    width:100%;
`;