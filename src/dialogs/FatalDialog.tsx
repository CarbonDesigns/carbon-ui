import * as React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import { GuiButton, GuiTextArea } from "../shared/ui/GuiComponents";
import DialogRegistry from "./DialogRegistry";
import Dialog from "./Dialog";
import { FormattedMessage } from "react-intl";
import { Markup, MarkupLine } from "../shared/ui/Markup";
import { GuiProgressButton } from "../shared/ui/GuiProgressButton";
import { logger } from "carbon-api";

type FatalDialogState = {
    message: string;
    loading: boolean;
}

export class FatalDialog extends Dialog<{}, FatalDialogState> {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            loading: false
        }
    }

    canClose() {
        return false;
    }

    private onMessageChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ message: e.currentTarget.value });
    }

    private onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            this.onReload();
        }
    }

    private onReload = () => {
        this.setState({ loading: true });

        if (this.state.message) {
            logger.trackEvent("fatalReason", { message: this.state.message });
        }

        logger.flush();

        //give it some time to flush everything
        setTimeout(() => {
            location.reload(true);
        }, 3000);
    }

    renderHeader() {
        return <FormattedMessage id="@fatal.header" tagName="p" />;
    }

    renderBody() {
        return <div className="fatal-dialog">
            <MarkupLine>
                <FormattedMessage id="@fatal.message" tagName="p" />
            </MarkupLine>
            <MarkupLine>
                <FormattedMessage id="@fatal.message2" tagName="p" />
            </MarkupLine>
            <MarkupLine mods="stretch">
                <GuiTextArea value={this.state.message} onChange={this.onMessageChanged} onKeyDown={this.onKeyDown} autoFocus placeholder="@fatal.reason" />
            </MarkupLine>
            <MarkupLine>
                <GuiProgressButton loading={this.state.loading} onClick={this.onReload} caption={this.state.message ? "@fatal.sendAndReload" : "@fatal.reload"} mods="submit" />
            </MarkupLine>
        </div>
    }
}

DialogRegistry.register("FatalDialog", FatalDialog);