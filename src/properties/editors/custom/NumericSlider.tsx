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

interface INumericEditorProps extends IEditorProps {
    selectOnEnter?: boolean;
}

interface INumericEditorState {
    value: number | undefined;
}

export default class NumericSliderEditor extends EditorComponent<ISize, INumericEditorProps, INumericEditorState> {
    render() {
        var p = this.props.p;
        var value = p.get("value");

        return <PropertyLineContainer>
            <PropertyNameContainer><FormattedMessage id={this.displayName()} /></PropertyNameContainer>
            <SliderContainer>
                <Slider value={value * 100}
                    valueChanged={this.onValueChanged}
                    valueChanging={this.onValueChanging}
                />
                <NumericEditor e={this.props.e} p={p}
                    onSettingValue={this.changeTupleProperty}
                    type="child"
                    onPreviewingValue={this.previewTupleProperty} />
            </SliderContainer>
        </PropertyLineContainer>
    }

    onValueChanged = (value) => {
        this.changeTupleProperty(value / 100, this.props.p);
    }

    onValueChanging = (value) => {
        this.previewTupleProperty(null, value / 100);
        return value;
    }

    changeTupleProperty = (value, p) => {
        this.setValueByCommand(value);
        return false;
    };

    previewTupleProperty(name, value) {
        this.previewValue(value);
        return false;
    }
}

const SliderContainer = styled.div`
    display: inline-grid;
    grid-template-columns: 2fr 1fr;
    grid-column-gap: 18px;
    justify-content:space-between;
    align-items:center;
`;