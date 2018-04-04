import * as React from "react";
import { Component } from "../../CarbonFlux";
import { IGuiInputProps } from "./GuiComponents";

export interface ArrowKeyModifierProps {
    value: number;

    step?: number;
    smallStep?: number;
    bigStep?: number;

    min?: number;
    max?: number;

    onChanging?: (newValue: number) => void;
    onChanged: (newValue: number) => void;
}

type ArrowKeyModifierState = {
    value: number;
}

/**
 * Higher order component for changing values with Up/Down arrow keys.
 */
export default class ArrowKeyModifier extends Component<ArrowKeyModifierProps, ArrowKeyModifierState> {
    static defaultProps: Partial<ArrowKeyModifierProps> = {
        step: 1,
        bigStep: 10
    }

    constructor(props: ArrowKeyModifierProps) {
        super(props);

        this.state = {
            value: props.value
        };
    }

    componentWillReceiveProps(nextProps: Readonly<ArrowKeyModifierProps>) {
        this.setState({ value: nextProps.value });
    }

    private onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.keyCode === 38 || event.keyCode === 40) {
            var value: number = this.state.value || 0;
            var factor = event.keyCode === 38 ? 1 : -1;
            var newValue = value + this.getDelta(event) * factor;
            newValue = this.validateNewValue(newValue, !event.altKey);
            this.setState({ value: newValue });
            this.props.onChanging && this.props.onChanging(newValue);

            event.preventDefault();
        }
    }

    private onKeyUp = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.keyCode === 38 || event.keyCode === 40) {
            this.props.onChanged(this.state.value);

            event.preventDefault();
        }
    }

    private getDelta(event: React.KeyboardEvent<HTMLElement>) {
        var s = this.props.step;
        if (event.altKey && this.props.smallStep) {
            s = this.props.smallStep;
        }
        else if (event.shiftKey && this.props.bigStep) {
            s = this.props.bigStep;
        }
        return s;
    }

    private round(value, toMajorStep = false) {
        if (isNaN(value)) {
            return value;
        }
        var precision = (toMajorStep || !this.props.smallStep)
            ? this.props.step
            : this.props.smallStep;

        var m = 1 / precision;
        return Math.round(value * m) / m;
    }

    private validateNewValue(value, roundToRegularStep = false) {
        var min = this.props.min;
        if (min !== undefined && value < min) {
            return min;
        }
        var max = this.props.max;
        if (max !== undefined && value > max) {
            return max;
        }
        return this.round(value, roundToRegularStep);
    }

    render() {
        return <div onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}>
            {this.props.children}
        </div>
    }
}