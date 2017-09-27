import React from "react";
import { Component } from "../../CarbonFlux";
import { IGuiInputProps, GuiInput, GuiInputMod } from "./GuiComponents";
import bem from "../../utils/commonUtils";

type GuiCopyInputState = {
    value: string;
    message: boolean;
}

/**
 * An input with a button to copy its content.
 */
export class GuiCopyInput extends Component<IGuiInputProps, GuiCopyInputState> {
    refs: {
        input: GuiInput
    }

    constructor(props: IGuiInputProps, context) {
        super(props, context);
        this.state = {
            value: this.getValueFromProps(props),
            message: false
        };
    }

    componentWillReceiveProps(nextProps: Readonly<IGuiInputProps>) {
        this.setState({
            value: this.getValueFromProps(nextProps)
        });
    }

    private getValueFromProps(props: IGuiInputProps) {
        if (props.value) {
            return props.value.toString();
        }
        return "";
    }

    private onInputClick = () => {
        this.refs.input.select();
    }

    private onCopyClick = () => {
        this.refs.input.select();
        try {
            document.execCommand("copy");
            this.setTempMessage("@input.copied");
            this.refs.input.blur();
        }
        catch(e) {
            this.setTempMessage("@input.copyManually");
        }
    }

    private setTempMessage(message: string) {
        let orig = this.state.value;
        this.setState({
            value: this.formatLabel(message),
            message: true
        });
        setTimeout(() => this.setState({value: orig, message: false}), 2000);
    }

    render() {
        let {mods, onClick, value, ...rest} = this.props;
        let inputMods = this.state.message ? GuiCopyInput.InputModsMessage : GuiCopyInput.InputModsNormal;
        return <div className="gui-input-copy">
            <GuiInput value={this.state.value} mods={inputMods} ref="input" onClick={this.onInputClick} {...rest} />
            <div className="gui-input-copy__icon" onClick={this.onCopyClick}>
                <i className="ico ico-copy big-icon"/>
            </div>
        </div>;
    }

    private static InputModsNormal: GuiInputMod[] = ["fill", "suffix"];
    private static InputModsMessage: GuiInputMod[] = ["fill", "suffix", "center"];
}