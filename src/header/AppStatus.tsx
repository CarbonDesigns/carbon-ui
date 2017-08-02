import React from "react";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction } from "../CarbonFlux";
import { app, backend, ConnectionState, IDisposable } from "carbon-core";
import FlyoutButton, { FlyoutPosition } from "../shared/FlyoutButton";
import bem from "../utils/commonUtils";
import { Markup, MarkupLine } from "../shared/ui/Markup";
import AppStatusFlyout from "./AppStatusFlyout";

type AppStatusProps = {}
type AppStatusState = {
    state: ConnectionState;
    status: "ok" | "warning" | "error";
    lastSaveResult: boolean;
}

export default class AppStatus extends Component<AppStatusProps, AppStatusState> {
    private tokens: IDisposable[] = [];

    constructor(props: AppStatusProps) {
        super(props);
        this.state = {
            state: {type: "notStarted"},
            status: "ok",
            lastSaveResult: true
        };
    }

    //lifecycle functions
    componentDidMount() {
        super.componentDidMount();

        this.tokens.push(backend.connectionStateChanged.bind(this.onConnectionStateChanged));
        this.tokens.push(app.actionManager.subscribe("save", this.onSaved));
    }

    componentWillUnmount() {
        this.tokens.forEach(x => x.dispose());
        this.tokens.length = 0;
    }

    //handlers
    private onConnectionStateChanged = (state: ConnectionState) => {
        let status = this.state.status;

        if (state.type === "connected") {
            status = "ok";
        }
        else if (state.type === "reconnecting") {
            status = "warning";
        }
        else if (state.type === "waiting") {
            status = state.timeout === 0 ? "ok" : "error";
        }

        this.setState({ status, state });
    }

    private onSaved = (action: string, result: boolean) => {
        let status = this.state.status;

        if (result) {
            status = "ok";
        }
        else {
            status = "error";
        }

        this.setState({ status, lastSaveResult: result });
    }

    //render functions
    private renderIcon = () => {
        return <i className={"ico ico--star appstatus__icon_" + this.state.status}/>
    }

    private static FlyoutPosition: FlyoutPosition = { targetVertical: "bottom", targetHorizontal: "right" };

    render() {
        return <FlyoutButton className="appstatus" renderContent={this.renderIcon} position={AppStatus.FlyoutPosition}>
            <AppStatusFlyout lastSaveResult={this.state.lastSaveResult} state={this.state.state} status={this.state.status}/>
        </FlyoutButton>
    }
}