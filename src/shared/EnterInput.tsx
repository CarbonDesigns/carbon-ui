import React from "react";
import ReactDom from "react-dom";

export default class EnterInput extends React.Component<any, any>{
    refs: any;

    constructor(props){
        super(props);
        this.state = {value: props.value};
    }
    focus(){
        this.refs.input.focus();
    }
    getValue(){
        if (this.props["data-type"] === "int"){
            var value = this.state.value;
            if (value === undefined || value === ""){
                value = 0;
            }
            return value;
        }
        return this.state.value;
    }
    setValue(value){
        this.setState({value});
    }
    onBlur = () => {
        if (this.props.changeOnBlur !== false){
            this._fireOnChange();
        }
    };
    onKeyDown = (e) => {
        if (e.key === "Enter"){
            this._fireOnChange();
            e.currentTarget.select();
        }
    };
    onFocus = e => {
        e.currentTarget.select();
    };
    onChange = e => {
        var value = this._validateValue(e.currentTarget.value);
        this.setState({value: value});
    };
    _fireOnChange(){
        if (this.props.onChange){
            this.props.onChange(this.getValue());
        }
    }
    _validateValue(value){
        if (this.props["data-type"] === "int"){
            if (value === undefined || value === ""){
                return value;
            }
            var parsed = parseInt(value);
            if (isNaN(parsed)){
                return this.state.value;
            }
            return parsed;
        }
        return value;
    }
    render(){
        var { onChange, value, type, changeOnBlur, ...other } = this.props;

        return <input ref="input"
                      value={this.state.value}
                      onChange={this.onChange}
                      onFocus={this.onFocus}
                      onBlur={this.onBlur}
                      onKeyDown={this.onKeyDown}
                      {...other}/>;
    }
}
