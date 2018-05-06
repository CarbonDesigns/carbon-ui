import * as React from "react";
import EditorComponent, { IEditorProps } from "./EditorComponent";
import * as cx from "classnames";
import { FormattedMessage } from "react-intl";
import EnterInput from "../../shared/EnterInput";
import { app } from "carbon-core";
import styled from "styled-components";
import theme from "../../theme";
import { PropertyNameContainer, PropertyLineContainer, PropertyWithSubtitleContainer, PropertySmallNameContainer } from "../PropertyStyles";

interface INumericEditorProps extends IEditorProps {
    selectOnEnter?: boolean;
    type?: "child" | "subproperty";
    step?: number;
    uom?: string;
    disabled?:boolean;
}

interface INumericEditorState {
    value: number | undefined;
}

export default class NumericEditor extends EditorComponent<number, INumericEditorProps, INumericEditorState> {
    private step: number;
    private miniStep: number;
    private timeoutId: any;
    private _holding: boolean;

    constructor(props: INumericEditorProps) {
        super(props);
        this.state = { value: props.p.get("value") };
    }

    componentWillReceiveProps(nextProps: Readonly<INumericEditorProps>) {
        super.componentWillReceiveProps(nextProps);
        var nextValue = nextProps.p.get("value");
        if (nextValue !== this.state.value) {
            this.setState({ value: nextValue });
        }
    }

    init(props) {
        super.init(props);
        this.step = this.extractOption(props, "step", 1);
        this.miniStep = this.extractOption(props, "miniStep", 0);
        this._holding = false;
    }

    validateNewValue(value, roundToMajorStep = false) {
        var min = this.extractOption(this.props, "min");
        if (min !== undefined && value < min) {
            return min;
        }
        var max = this.extractOption(this.props, "max");
        if (max !== undefined && value > max) {
            return max;
        }
        return this.round(value, roundToMajorStep);
    }

    round(value, toMajorStep = false) {
        if (isNaN(value)) {
            return value;
        }
        var precision = (toMajorStep || !this.miniStep)
            ? this.step
            : this.miniStep
            ;

        var m = 1 / precision;
        return Math.round((value - 0) * m) / m;
    }

    formatValue(value) {
        var parsed = parseFloat(value);
        if (isNaN(parsed) || (typeof value === "string" && value.endsWith("."))) {
            return value;
        }
        return this.round(value);
    }

    selectOnFocus(e) {
        e.target.select();
    }

    onValueEntered = (value: number, valid: boolean) => {
        if (value !== this.propertyValue()) {
            let validatedValue = this.validateNewValue(value);
            this.setValueByCommand(validatedValue);
            this.setState({ value: validatedValue });
        }
        else if (!valid) {
            this.forceUpdate();
        }
    }

    static onUndo() {
        app.actionManager.invoke("undo");
    }
    static onRedo() {
        app.actionManager.invoke("redo");
    }

    onKeyDown = (event) => {
        if (event.keyCode === 38 || event.keyCode === 40) {
            var value: number = this.state.value || 0;
            var factor = event.keyCode === 38 ? 1 : -1;
            var newValue = value + this.getDelta(event) * factor;
            newValue = this.validateNewValue(newValue, !event.altKey);
            this.setState({ value: newValue });

            event.preventDefault();
        }
    };

    onKeyUp = event => {
        if (event.keyCode === 38 || event.keyCode === 40) {
            this.setValueByCommand(this.state.value);
        }
    };

    holdMouse(delta) {
        this.previewValue(this.state.value + delta);
        if (this._holding) {
            this.timeoutId = setTimeout(() => this.holdMouse(delta), 0);
        }
    };
    releaseMouse(event, delta) {
        clearTimeout(this.timeoutId);
        if (this._holding) {
            this._holding = false;
            this.setValueByCommand(this.state.value);

        }
        else if (event.type === "mouseup") {
            this.setValueByCommand(this.state.value + delta);
        }
    };

    holdMouseValueDown = (event) => {
        this.timeoutId = setTimeout(() => {
            this._holding = true;
            this.holdMouse(-this.getDelta(event));
        }, 150);
    };

    releaseMouseValueDown = (event) => {
        this.releaseMouse(event, -this.getDelta(event));
    };

    holdMouseValueUp = (event) => {
        this.timeoutId = setTimeout(() => {
            this._holding = true;
            this.holdMouse(this.getDelta(event));
        }, 150);
    };

    releaseMouseValueUp = (event) => {
        this.releaseMouse(event, this.getDelta(event));
    };

    getDelta(event) {
        var s = this.step;
        if (event.altKey && this.miniStep) {
            s = this.miniStep;
        }
        return event.shiftKey ? 10 * s : s;
    }

    render() {
        var prop = this.props.p;
        var value = this.state.value;
        value = value !== undefined ? this.formatValue(value) : '';

        var inputRender = (<InputStyled
            dataType="float"
            value={value}
            divOnBlur={true}
            onValueEntered={this.onValueEntered}
            onUndo={NumericEditor.onUndo}
            onRedo={NumericEditor.onRedo}
            onKeyDown={this.onKeyDown}
            onKeyUp={this.onKeyUp}
            tabIndex={1}
        />);

        if (this.props.type === "subproperty") {
            return <PropertyWithSubtitleContainer className={this.props.className}>
                <InputContainer subproperty={this.props.type === "subproperty"}>
                    {inputRender}
                    {this.props.uom?(<Uom>{this.props.uom}</Uom>):null}
                </InputContainer>
                <PropertySmallNameContainer><FormattedMessage id={this.displayName()} /></PropertySmallNameContainer>
            </PropertyWithSubtitleContainer>;
        }

        if (this.props.type === "child") {
            return <InputContainer>
                {inputRender}
                <Uom>{this.props.uom}</Uom>
            </InputContainer>;
        }

        return <PropertyLineContainer className={this.props.className}>
            <PropertyNameContainer><FormattedMessage id={this.displayName()} /></PropertyNameContainer>
            <InputContainer>
                {inputRender}
                <Uom>{this.props.uom}</Uom>
            </InputContainer>
        </PropertyLineContainer>;
    }
}

const InputStyled = styled(EnterInput)`
    height:24px;
    padding: 5px 0;
    color: ${theme.text_color};
    font: ${theme.input_font};
    width:100%;
    background:transparent;
    text-align:center;
`;

const InputContainer = styled.div.attrs<any>({}) `
    height:24px;
    background-color: ${theme.input_background};
    border-radius: 1px;
    width:100%;
    display:flex;
    align-items: center;
    text-align:center;
`;

const Uom = styled.div`
    line-height:24px;
    color: ${theme.text_color};
    font: ${theme.input_font};
    padding-right:8px;
`;
