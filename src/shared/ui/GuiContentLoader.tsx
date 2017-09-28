import React from "react";
import { Component } from "../../CarbonFlux";
import bem from "../../utils/commonUtils";
import { GuiSpinner } from "./GuiComponents";
import { MinPerceivedTime } from "../../Constants";

export interface GuiContentLoaderProps<T> {
    onRenderContent: (data: T) => JSX.Element;
    onLoad: () => Promise<T>;
}
export type GuiContentLoaderState<T> = {
    loading: boolean;
    result?: T;
}

/**
 * A component which shows a loading spinner until the content is loaded.
 */
export class GuiContentLoader<T> extends Component<GuiContentLoaderProps<T>, GuiContentLoaderState<T>> {
    constructor(props: GuiContentLoaderProps<T>) {
        super(props);
        this.state = { loading: true };
    }

    componentDidMount() {
        super.componentDidMount();

        let startTime = new Date();

        this.props.onLoad()
            .then(data => {
                let endTime = new Date();
                let spent = new Date().getTime() - startTime.getTime();
                if (spent < MinPerceivedTime) {
                    return Promise.resolve(data).delay(MinPerceivedTime - spent);
                }
                return data;
            })
            .then(data => this.setState({ loading: false, result: data }));
    }

    render() {
        return <div className={bem("loader", null, { loading: this.state.loading })}>
            {this.state.loading ? <GuiSpinner /> : this.props.onRenderContent(this.state.result)}
        </div>
    }
}