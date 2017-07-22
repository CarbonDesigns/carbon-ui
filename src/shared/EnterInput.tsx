import React from "react";
import ReactDom from "react-dom";
import { Component } from "../CarbonFlux";

interface EnterInputProps extends React.HTMLAttributes<HTMLInputElement> {
    value?: string | number;
    onValueEntered?: (value) => void;
    dataType?: "int";
    changeOnBlur?: boolean;
}

type EnterInputState = {
    value: string | number;
}

export default class EnterInput extends Component<EnterInputProps, EnterInputState>{
    refs: {
        input: HTMLInputElement
    }

    constructor(props: EnterInputProps) {
        super(props);
        this.state = { value: props.value };
    }

    componentWillReceiveProps(nextProps: Readonly<EnterInputProps>) {
        if (nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }
    }

    focus() {
        this.refs.input.focus();
    }
    getValue() {
        if (this.props.dataType === "int") {
            var value = this.state.value;
            if (!value) {
                return 0;
            }
            return parseInt(value as string);
        }
        return this.state.value;
    }
    setValue(value) {
        this.setState({ value });
    }
    onBlur = () => {
        if (this.props.changeOnBlur !== false) {
            this._fireOnChange();
        }
    };
    onKeyDown = (e) => {
        if (e.key === "Enter") {
            this._fireOnChange();
            e.currentTarget.select();
        }
        else if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    };
    onFocus = e => {
        e.currentTarget.select();
    };
    onChange = e => {
        this.setState({ value: e.currentTarget.value });
    };
    _fireOnChange() {
        if (this.props.onValueEntered) {
            this.props.onValueEntered(this.getValue());
        }
    }
    _validateValue(value) {
        if (this.props.dataType === "int") {
            if (value === undefined || value === "") {
                return value;
            }
            var parsed = parseInt(value);
            if (isNaN(parsed)) {
                return this.state.value;
            }
            return parsed;
        }
        return value;
    }
    render() {
        var { onValueEntered, value, dataType, changeOnBlur, onKeyDown, ...other } = this.props;

        return <input ref="input"
            value={this.state.value}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onKeyDown={this.onKeyDown}
            maxLength={this.props.size}
            {...other} />;
    }
}
