import * as React from "react";
import * as cx from "classnames";
import * as Immutable from "immutable";

import EditorComponent, { IEditorProps } from "../EditorComponent";
import NumericEditor from "../NumericEditor";
import { richApp } from "../../../RichApp";

import { ISize } from "carbon-core";
import { PropertyLineContainer, PropertyNameContainer, PropertyTupleContainer } from "../../PropertyStyles";
import { FormattedMessage } from "react-intl";

interface ITupleEditorProps extends IEditorProps {
    properties?: any[];
}

export default class TupleEditor extends EditorComponent<ISize, ITupleEditorProps> {
    render() {
        var p = this.props.p;
        var tuple = p.get("value");
        var properties = this.props.properties;

        return <PropertyLineContainer>
            <PropertyNameContainer><FormattedMessage id={this.displayName()} /></PropertyNameContainer>
            <PropertyTupleContainer>
                {properties.map((p, index) => {
                    return <NumericEditor e={this.props.e} p={p} key={index}
                        onSettingValue={this.changeTupleProperty}
                        subproperty={true}
                        onPreviewingValue={this.previewTupleProperty} />
                })}
            </PropertyTupleContainer>
        </PropertyLineContainer>
    }

    changeTupleProperty = (value, p) => {
        var changes = {};
        changes[p.get("descriptor").name] = value;
        var newBox = Object.assign({}, this.propertyValue(), changes);
        this.setValueByCommand(newBox);
        return false;
    };
    previewTupleProperty(name, value) {
        var changes = {};
        changes[this.props.p.get("descriptor").name] = value;
        var newBox = Object.assign({}, this.propertyValue(), changes);
        this.previewValue(newBox);
        return false;
    }
}