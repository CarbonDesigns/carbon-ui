import React from "react";
import { IGuiButtonProps, GuiButton, GuiSpinner } from "./GuiComponents";
import { Component } from "../../CarbonFlux";
import bem from "../../utils/commonUtils";
import { Operation } from "../Operation";

interface GuiProgressButtonProps extends IGuiButtonProps {
    loading: boolean;
}

/**
 * A button which shows a spinner when instructed.
 */
export class GuiProgressButton extends Component<GuiProgressButtonProps> {
    constructor(props: GuiProgressButtonProps) {
        super(props);
        this.state = { loading: props.loading };
    }

    componentWillReceiveProps(nextProps: GuiProgressButtonProps) {
        this.setState({ loading: nextProps.loading });
    }

    render() {
        let { loading, ...rest } = this.props;

        return <div className={bem("gui-btn-loading", null, { loading: loading })}>
            <GuiButton {...rest} />
            {loading ? <GuiSpinner /> : null}
        </div>
    }
}