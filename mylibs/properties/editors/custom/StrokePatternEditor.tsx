import React from 'react';
import DropDownEditor from "../DropdownEditor";
import EditorComponent, {IEditorProps, IEditorState} from "../EditorComponent";


function formatValue(stroke_type) {
    if (stroke_type == null)
        stroke_type = 'solid';

    return <hr key={'stroke-'+stroke_type} className={"prop__border-style  prop__border-style_" + stroke_type}/>
}

export default class StrokePatternEditor extends EditorComponent<IEditorProps, IEditorState<any>> {
    render() {
        return <DropDownEditor
            e={this.props.e}
            p={this.props.p.set('options', {
                size: 1/2,
                items: ['solid','dashed','dotted'].map(stroke_type=>{return {
                    value           : stroke_type ,
                    name            : stroke_type ,
                    selectedContent : formatValue(stroke_type),
                    content         : formatValue(stroke_type)
                }})
            })}
            formatSelectedValue={formatValue}
        />
    }
}