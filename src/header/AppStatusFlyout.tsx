import React from "react";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction } from "../CarbonFlux";
import { Markup, MarkupLine } from "../shared/ui/Markup";
import { ConnectionState, app, backend } from "carbon-core";

type AppStatusFlyoutProps = {
    state: ConnectionState;
    lastSaveResult: boolean;
    status: string;
}
type AppStatusFlyoutState = {
    secondsToRetry: number;
    message: string;
}

export default class AppStatusFlyout extends Component<AppStatusFlyoutProps, AppStatusFlyoutState> {
    private timer: number = 0;

    constructor(props: AppStatusFlyoutProps) {
        super(props);
        this.state = {
            secondsToRetry: AppStatusFlyout.getSecondsToRetry(props.state),
            message: AppStatusFlyout.getMessage(props.state, props.lastSaveResult)
        };

        if (props.state.type === "waiting" && props.state.timeout) {
            this.timer = setInterval(this.onTick, 1000);
        }
    }

    //lifecycle functions
    componentWillReceiveProps(nextProps: Readonly<AppStatusFlyoutProps>) {
        if (nextProps.state.type === "waiting" && nextProps.state.timeout && !this.timer) {
            this.timer = setInterval(this.onTick, 1000);
            this.setState({ secondsToRetry: AppStatusFlyout.getSecondsToRetry(nextProps.state) });
        }
        else if (nextProps.state.type !== "waiting" && this.timer) {
            clearInterval(this.timer);
            this.setState({ secondsToRetry: -1 });
            this.timer = 0;
        }

        let message = AppStatusFlyout.getMessage(nextProps.state, nextProps.lastSaveResult);
        this.setState({ message });
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
    }

    private static getMessage(state: ConnectionState, lastSaveResult: boolean) {
        let message = "@status.connected";

        if (!lastSaveResult && state.type === "connected") {
            message = "@status.saveFailed";
        }
        else if (state.type === "connected") {
            message = app.isDirty() ? "@status.savingSoon" : "@status.connected";
        }
        else if (state.type === "reconnecting") {
            message = "@status.reconnecting";
        }
        else if (state.type === "connecting") {
            message = "@status.connecting";
        }

        return message;
    }

    private static getSecondsToRetry(state: ConnectionState) {
        if (state.type === "waiting") {
            let timeLeft = state.startTime.valueOf() + state.timeout - new Date().valueOf();
            timeLeft = Math.max(0, timeLeft);
            return Math.ceil(timeLeft / 1000);
        }
        return -1;
    }

    //handlers
    private onTick = () => {
        this.setState({ secondsToRetry: AppStatusFlyout.getSecondsToRetry(this.props.state) });
    }

    private onTryNow = () => {
        backend.startConnection();
    }

    //render functions
    private renderContent() {
        if (this.props.state.type === "waiting") {
            if (this.state.secondsToRetry > 0) {
                return [<FormattedMessage id="@status.willRetry" values={{ seconds: this.state.secondsToRetry }} />,
                    <a href="#" onClick={this.onTryNow}>{this.formatLabel("@status.tryNow")}</a>]
            }
            return <FormattedMessage id="@status.reconnecting" />
        }

        return <FormattedMessage id={this.state.message} />
    }

    render() {
        return <Markup className="flyout__content appstatus__flyout">
            <MarkupLine>
                {this.renderContent()}
            </MarkupLine>
        </Markup>
    }
}