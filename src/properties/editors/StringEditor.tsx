import * as React from "react";
import EditorComponent, {IEditorProps} from "./EditorComponent";
import * as cx from "classnames";
import {FormattedMessage} from "react-intl";
import EnterInput from "../../shared/EnterInput";
import { app } from "carbon-core";

interface IStringEditorProps extends IEditorProps{
    selectOnMount?: boolean;
    onComplete?: (value: string) => void;
}

export default class StringEditor extends EditorComponent<string, IStringEditorProps> {
    render(){
        var p = this.props.p;
        var classes = cx("prop prop_textinput textbox");
        return <div className={classes}>
            {this.renderPropertyName(p)}
            <EnterInput value={this.propertyValue()} className="prop__input"
                divOnBlur={true}
                onValueEntered={this.onValueEntered}
                onUndo={StringEditor.onUndo}
                onRedo={StringEditor.onRedo}
            />
        </div>;
    }
    getValue(){
        return this.propertyValue() || "";
    }
    renderPropertyName(p){
        var displayName = p.get("descriptor").displayName;
        if(displayName) {
            return <div className="prop__name"><FormattedMessage id={displayName}/></div>;
        }
    }
    onValueEntered=(value)=>{
        this.props.onComplete && this.props.onComplete(this.getValue());
        this.setValueByCommand(value);
    }
    static onUndo() {
        app.actionManager.invoke("undo");
    }
    static onRedo() {
        app.actionManager.invoke("redo");
    }
}