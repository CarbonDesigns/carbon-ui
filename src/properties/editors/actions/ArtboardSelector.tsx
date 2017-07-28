import React from 'react';
import ReactDom from "react-dom";
import cx from 'classnames';

import { IDropdownEditorProps, BaseDropdownEditor } from "../DropdownEditor";

interface IArtboardSelectorProps extends IDropdownEditorProps{
    actions: any[];
    i: number;
}

export default class ArtboardSelector extends BaseDropdownEditor<any, IArtboardSelectorProps> {
    onOptionSelected = e =>{
        var actions = this.props.actions.slice();
        var a = actions[this.props.i];
        var name = e.currentTarget.dataset.name;
        var items = this.extractOption(this.props, "items");
        for (var i = 0; i < items.length; i++){
            var item = items[i];
            if (item.name === name){
                actions[this.props.i] = extend({}, a, {artboardId:item.value});

                this.setValueByCommand(actions);
                break;
            }
        }
    };
}