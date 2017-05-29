import React from 'react';
import cx from 'classnames';
import Immutable from "immutable";

import EditorComponent, {IEditorProps, IEditorState} from "../EditorComponent";
import NumericEditor from "../NumericEditor";
import {richApp} from "../../../RichApp";

import {Box} from "carbon-core";

export default class BoxEditor extends EditorComponent<IEditorProps, IEditorState<Box>> {
    render(){
        var p = this.props.p;
        var box = p.get("value");
        var properties = [
            Immutable.Map({
                name: "left",
                displayName: "Left",
                value: box.left
            }),
            Immutable.Map({
                name: "top",
                displayName: "Top",
                value: box.top
            }),
            Immutable.Map({
                name: "right",
                displayName: "Right",
                value: box.right
            }),
            Immutable.Map({
                name: "bottom",
                displayName: "Bottom",
                value: box.bottom
            })
        ];

        return <div>
            {properties.map(p => {
                return <NumericEditor e={this.props.e} p={p} className="prop_width-1-4" key={p.get("descriptor").name}
                                      onSettingValue={this.changeBoxProperty}
                                      onPreviewingValue={this.previewBoxProperty}/>
            })}
        </div>
    }

    changeBoxProperty = (value, p) => {
        var changes = {};
        changes[p.get("descriptor").name] = value;
        var newBox = Object.assign({}, this.state.value, changes);
        this.setValueByCommand(newBox);
        return false;
    };
    previewBoxProperty(name, value){
        var changes = {};
        changes[this.props.p.get("descriptor").name] = value;
        var newBox = Object.assign({}, this.state.value, changes);
        this.previewValue(newBox);
        return false;
    }
}