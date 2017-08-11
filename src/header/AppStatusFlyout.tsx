import React from "react";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction } from "../CarbonFlux";
import { Markup, MarkupLine } from "../shared/ui/Markup";
import { ConnectionState, app, backend } from "carbon-core";
import { GuiButton } from "../shared/ui/GuiComponents";

type AppStatusFlyoutProps = {
    state: ConnectionState;
    lastSaveResult: boolean;
    lastSaveTime: Date;
    status: string;
}
type AppStatusFlyoutState = {
    secondsToRetry: number;
}

export default class AppStatusFlyout extends Component<AppStatusFlyoutProps, AppStatusFlyoutState> {
    private timer: number = 0;

    constructor(props: AppStatusFlyoutProps) {
        super(props);
        this.state = {
            secondsToRetry: AppStatusFlyout.getSecondsToRetry(props.state)
        };

        if (props.state.type === "waiting") {
            this.timer = setInterval(this.onTick, 1000);
        }
    }

    //lifecycle functions
    componentWillReceiveProps(nextProps: Readonly<AppStatusFlyoutProps>) {
        if (nextProps.state.type === "waiting" && !this.timer) {
            this.timer = setInterval(this.onTick, 1000);
            this.setState({ secondsToRetry: AppStatusFlyout.getSecondsToRetry(nextProps.state) });
        }
        else if (nextProps.state.type !== "waiting" && this.timer) {
            clearInterval(this.timer);
            this.setState({ secondsToRetry: -1 });
            this.timer = 0;
        }
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
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
                return <div>
                    <MarkupLine>
                        <FormattedMessage id="@status.connectionLost" />
                    </MarkupLine>
                    <MarkupLine mods="horizontal">
                        <FormattedMessage id="@status.willRetry" values={{ seconds: this.state.secondsToRetry }} />
                        <GuiButton className="appstatus__tryNow" mods={["link-hover", "link"]} caption="@status.tryNow"
                            onClick={this.onTryNow} />
                    </MarkupLine>
                </div>;
            }
            return <MarkupLine>
                <FormattedMessage id="@status.reconnecting" />
            </MarkupLine>
        }

        if (app.serverless()) {
            return <div>
                <MarkupLine>
                    <FormattedMessage id="@status.serverless" />
                </MarkupLine>
                <MarkupLine>
                    <FormattedMessage id="@status.serverless2" />
                </MarkupLine>
            </div>
        }

        if (!this.props.lastSaveResult && this.props.state.type === "connected" && this.props.lastSaveTime > this.props.state.connectionTime) {
            return <div>
                <MarkupLine>
                    <FormattedMessage id="@status.saveFailed" />
                </MarkupLine>
                <MarkupLine>
                    <FormattedMessage id="@status.saveFailed2" />
                </MarkupLine>
            </div>
        }

        if (this.props.state.type === "connected") {
            return <div>
                <MarkupLine>
                    <FormattedMessage id="@status.connected" />
                </MarkupLine>
                <MarkupLine>
                    <FormattedMessage id="@status.connected2" values={{ time: this.props.lastSaveTime.toLocaleTimeString() }} />
                </MarkupLine>
            </div>
        }

        if (this.props.state.type === "reconnecting") {
            return <div>
                <MarkupLine>
                    <FormattedMessage id="@status.reconnecting" />
                </MarkupLine>
                <MarkupLine>
                    <FormattedMessage id="@status.reconnecting2" />
                </MarkupLine>
            </div>
        }

        if (this.props.state.type === "connecting") {
            return <div>
                <MarkupLine>
                    <FormattedMessage id="@status.connecting" />
                </MarkupLine>
            </div>
        }

        return null;
    }

    render() {
        return <Markup className={"flyout__content appstatus__flyout appstatus__flyout_" + this.props.status} mods="space">
            {this.renderContent()}
        </Markup>
    }
}