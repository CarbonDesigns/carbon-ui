import React from "react";
import { IGuiButtonProps, GuiButton, GuiSpinner } from "./GuiComponents";
import { Component } from "../../CarbonFlux";
import bem from "../../utils/commonUtils";
import { MinPerceivedTime } from "../../Constants";

export interface GuiProgressButtonProps<T> extends IGuiButtonProps {
    onClick: () => Promise<T>;
    onDone: (data: T) => void;
}

type GuiProgressButtonState = {
    loading: boolean;
}

/**
 * A button which shows a spinner while its onClick promise is in progress.
 */
export class GuiProgressButton<T = {}> extends Component<GuiProgressButtonProps<T>, GuiProgressButtonState> {
    constructor(props: GuiProgressButtonProps<T>) {
        super(props);
        this.state = { loading: false };
    }

    private onClick = () => {
        if (this.state.loading) {
            return;
        }

        this.setState({ loading: true });
        let startTime = new Date();

        this.props.onClick()
            .then(data => {
                let endTime = new Date();
                let spent = new Date().getTime() - startTime.getTime();
                if (spent < MinPerceivedTime) {
                    return Promise.resolve(data).delay(MinPerceivedTime - spent);
                }
                return data;
            })
            .then(data => this.props.onDone(data))
            .finally(() => this.setState({ loading: false }));
    }

    render() {
        let { onClick, onDone, ...rest } = this.props;

        return <div className={bem("gui-btn-loading", null, { loading: this.state.loading })}>
            <GuiButton onClick={this.onClick} {...rest} />
            {this.state.loading && <GuiSpinner />}
        </div>
    }
}