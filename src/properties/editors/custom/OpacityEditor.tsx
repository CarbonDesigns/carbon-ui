import * as React from "react";
import * as cx from "classnames";
import * as Immutable from "immutable";

import EditorComponent, { IEditorProps } from "../EditorComponent";
import NumericEditor from "../NumericEditor";
import { richApp } from "../../../RichApp";

import { ISize } from "carbon-core";
import { PropertyLineContainer, PropertyNameContainer, PropertyTupleContainer } from "../../PropertyStyles";
import { FormattedMessage } from "react-intl";
import Slider from "../../../components/Slider";

import styled from "styled-components";
import theme from "../../../theme";

interface INumericEditorProps extends IEditorProps {
    selectOnEnter?: boolean;
}

interface INumericEditorState {
    value: number | undefined;
}

export default class OpacityEditor extends EditorComponent<ISize, INumericEditorProps, INumericEditorState> {
    render() {
        var p = this.props.p;
        var value = p.get("value");
        var uom = this.extractOption(this.props, "uom", '');
        var opacityProp = Immutable.Map({
            descriptor: {
                name: "opacity",
                displayName: "@opacity"
            },
            value: value * 100,
            options: {
                min: 0,
                max: 100,
                step: 1
            }
        })

        return <PropertyLineContainer>
            <PropertyNameContainer><FormattedMessage id={this.displayName()} /></PropertyNameContainer>
            <SliderContainer>
                <Slider value={value * 100}
                    valueChanged={this.onValueChanged}
                    valueChanging={this.onValueChanging}
                />
                <NumericEditor e={this.props.e} p={opacityProp}
                    onSettingValue={this.changeOpacityProperty}
                    type="child"
                    uom={uom}
                    onPreviewingValue={this.previewOpacityProperty} />
            </SliderContainer>
        </PropertyLineContainer>
    }

    onValueChanged = (value) => {
        this.changeOpacityProperty(value, this.props.p);
    }

    onValueChanging = (value) => {
        this.previewOpacityProperty(null, value);
        return value;
    }

    changeOpacityProperty = (value, p) => {
        this.setValueByCommand(value / 100);
        return false;
    };

    previewOpacityProperty(name, value) {
        this.previewValue(value / 100);
        return false;
    }
}

const SliderContainer = styled.div`
    display: inline-grid;
    grid-template-columns: 1fr ${theme.rightPropSize};
    grid-column-gap: ${theme.margin2};
    justify-content:space-between;
    align-items:center;
    width:100%;
`;