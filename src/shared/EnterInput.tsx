import React from "react";
import ReactDom from "react-dom";
import { Component } from "../CarbonFlux";
import { platform } from "carbon-api";

interface EnterInputProps extends React.HTMLAttributes<HTMLInputElement> {
    value?: string | number;
    onValueEntered?: (value, valid: boolean) => void;
    onUndo?: () => void;
    onRedo?: () => void;
    dataType?: "int" | "float";
    changeOnBlur?: boolean;
    divOnBlur?: boolean;
}

type EnterInputState = {
    value: string | number;
    focused?: boolean;
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

    componentDidUpdate(prevProps: Readonly<EnterInputProps>, prevState: Readonly<EnterInputState>) {
        if (this.state.focused && this.state.focused !== prevState.focused) {
            this.refs.input.focus();
        }
    }

    focus() {
        this.refs.input.focus();
    }
    private getResult() {
        if (this.props.dataType === "int") {
            let value = this.state.value;
            if (!value) {
                return {value: this.props.value || 0, valid: false};
            }
            let parsed = parseInt(value as string);
            if (isNaN(parsed)) {
                return {value: this.props.value || 0, valid: false};
            }
            return {value: parsed, valid: true};
        }
        if (this.props.dataType === "float") {
            let value = this.state.value;
            if (!value) {
                return {value: this.props.value || 0, valid: false};
            }
            let parsed = parseFloat(value as string);
            if (isNaN(parsed)) {
                return {value: this.props.value || 0, valid: false};
            }
            return {value: parsed, valid: true};
        }
        return {value: this.state.value, valid: true};
    }
    getValue() {
        return this.state.value;
    }
    setValue(value) {
        this.setState({ value });
    }
    onBlur = () => {
        if (this.props.changeOnBlur !== false) {
            this.fireOnChange();
        }
        this.setState({ focused: false });
    };
    onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            this.fireOnChange();
            e.currentTarget.select();
        }
        else if ((e.ctrlKey || e.metaKey) && e.keyCode === 90) {
            if (e.shiftKey) {
                this.onRedo();
            }
            else {
                this.onUndo();
            }
            e.preventDefault();
        }
        else if (e.ctrlKey && e.keyCode === 89) {
            //just disabling browser's redo on windows
            e.preventDefault();
        }
        else if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }
    private onUndo() {
        if (this.state.value !== this.props.value) {
            this.setState({ value: this.props.value });
        }
        else if (this.props.onUndo) {
            this.props.onUndo();
        }
    }
    private onRedo() {
        if (this.props.onRedo) {
            this.props.onRedo();
        }
    }
    private onActivated = () => {
        this.setState({ focused: true });
    }
    onFocus = e => {
        e.currentTarget.select();
    }
    onChange = e => {
        this.setState({ value: e.currentTarget.value });
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    };
    private fireOnChange() {
        if (this.props.onValueEntered) {
            let result = this.getResult();
            this.props.onValueEntered(result.value, result.valid);
        }
    }
    render() {
        var { onValueEntered, divOnBlur, onUndo, onRedo, value, dataType, changeOnBlur, onKeyDown, ...other } = this.props;

        if (divOnBlur && !this.state.focused) {
            return <div className={this.props.className} tabIndex={this.props.tabIndex}
                onClick={this.onActivated}
                onFocus={this.onActivated}>
                {value}
            </div>;
        }

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
