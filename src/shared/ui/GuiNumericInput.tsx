import * as React from "react";
import { Component } from "../../CarbonFlux";
import { IGuiInputProps, GuiInput } from "./GuiComponents";

interface GuiNumericInputProps extends IGuiInputProps {
    onValueChanged: (value: number) => void;
}

type GuiNumericInputState = {
    value: any;
}

export default class GuiNumericInput extends Component<GuiNumericInputProps, GuiNumericInputState> {
    constructor(props: GuiNumericInputProps) {
        super(props);

        this.state = { value: props.value };
    }

    componentWillReceiveProps(nextProps: Readonly<GuiNumericInputProps>) {
        this.setState({ value: nextProps.value });
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange && this.props.onChange(e);

        let value = e.target.value;
        let parsed = parseFloat(value);
        if (!isNaN(parsed)) {
            this.props.onValueChanged(parsed);
        }

        this.setState({ value });
    }

    render() {
        var { onValueChanged, value, onChange, ...rest } = this.props;
        return <GuiInput value={this.state.value} onChange={this.onChange} {...rest} />
    }
}