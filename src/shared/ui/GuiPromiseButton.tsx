import * as React from "react";
import { IGuiButtonProps, GuiButton, GuiSpinner } from "./GuiComponents";
import { Component } from "../../CarbonFlux";
import bem from "../../utils/commonUtils";
import { Operation } from "../Operation";

export interface GuiPromiseButtonProps<T> extends IGuiButtonProps {
    onClick: () => Promise<T>;
    onDone: (data: T) => void;
}

type GuiPromiseButtonState = {
    loading: boolean;
}

/**
 * A button which shows a spinner while its onClick promise is in progress.
 */
export class GuiPromiseButton<T = {}> extends Component<GuiPromiseButtonProps<T>, GuiPromiseButtonState> {
    constructor(props: GuiPromiseButtonProps<T>) {
        super(props);
        this.state = { loading: false };
    }

    private onClick = () => {
        if (this.state.loading) {
            return;
        }

        this.setState({ loading: true });
        let operation = new Operation();
        operation.start()
            .then(() => this.props.onClick())
            .then(data => operation.stop(data))
            .then(data => this.props.onDone(data))
            .finally(() => this.setState({ loading: false }));
    }

    render() {
        let { onClick, onDone, ...rest } = this.props;

        return <div className={bem("gui-btn-loading", null, { loading: this.state.loading })}>
            <GuiButton onClick={this.onClick} {...rest} />
            {this.state.loading ? <GuiSpinner /> : null}
        </div>
    }
}