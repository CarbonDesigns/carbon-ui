import React from 'react';
import EditorComponent, {IEditorProps, IEditorState} from "./EditorComponent";
import cx from 'classnames';
import {FormattedHTMLMessage} from "react-intl";

interface IStringEditorProps extends IEditorProps{
    selectOnMount?: boolean;
    onComplete?: (value: string, e: any) => void;
    onChange?: (value: string) => void;
}

export default class StringEditor extends EditorComponent<IStringEditorProps, IEditorState<string>> {
    render(){
        var p = this.props.p;
        var classes = cx("prop prop_textinput textbox", this.widthClass(this.props.className || "prop_width-1-1"));
        return <div className={classes}>
            <div className="wrap">
                <input ref="textNode" type="text" value={this.getValue()}
                       onChange={this.onChange}
                       onFocus={this.selectOnFocus}
                       onKeyDown={this.onKeyDown}
                       onBlur={this.onBlur}
                />
            </div>
            {this.renderPropertyName(p)}
        </div>;
    }
    getValue(){
        return this.state.value || "";
    }
    renderPropertyName(p){
        var displayName = p.get("descriptor").displayName;
        if(displayName) {
            return <div className="prop__name"><FormattedHTMLMessage id={displayName}/></div>;
        }
    }
    componentDidMount(){
        super.componentDidMount();
        if(this.props.selectOnMount) {
            //setTimeout(()=>this.refs.textNode.select(), 1);
        }
    }
    selectOnFocus(e){
        e.target.select();
    }
    onKeyDown=(e)=>{
        if(e.keyCode === 13) {
            this.props.onComplete && this.props.onComplete(this.getValue(), e);
        }
    }
    onBlur=(e)=>{
        this.props.onComplete && this.props.onComplete(this.getValue(), e);
    }
    onChange = e => {
        var value = e.target.value;
        if(this.props.onChange){
            this.props.onChange(value);
            return;
        }

        this.updateState(value);
        this.previewValue(value);
        this.setValueByCommandDelayed(value);
    };
}