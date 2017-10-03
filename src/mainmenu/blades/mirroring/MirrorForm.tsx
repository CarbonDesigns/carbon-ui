import React from "react";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction } from "../../../CarbonFlux";
import { MarkupLine } from "../../../shared/ui/Markup";
import { GuiCopyInput } from "../../../shared/ui/GuiCopyInput";
import { ShareCode, backend, app, ShareRole, MirrorCode } from "carbon-core";
import { GuiProgressButton } from "../../../shared/ui/GuiProgressButton";
import QRCode from "qrcode.react";

export type AddShareCodeButton = new (props) => GuiProgressButton<MirrorCode>;
export const AddShareCodeButton = GuiProgressButton as AddShareCodeButton;

type MirrorFormProps = {
    code: string;
}
type MirrorFormState = {
    code: string;
}

export class MirrorForm extends Component<MirrorFormProps, MirrorFormState> {
    constructor(props: MirrorFormProps) {
        super(props);
        this.state = { code: props.code };
    }

    componentWillReceiveProps(nextProps: MirrorFormProps) {
        this.setState({ code: nextProps.code });
    }

    private getUrl() {
        return location.origin + "/m/" + this.state.code;
    }

    //handlers
    private onShareClick = () => {
        return backend.shareProxy.mirrorCode(app.companyId(), app.id(), true);
    }
    private onShared = (data: MirrorCode) => {
        this.setState({ code: data.code });
        app.mirroringCode(data.code);
    }

    private onDisableSharingClick = () => {
        return backend.shareProxy.disableMirroring(app.companyId(), app.id());
    }
    private onSharingDisabled = () => {
        this.setState({ code: null });
        app.mirroringCode(null);
    }

    private renderCode() {
        if (!this.state.code) {
            return null;
        }

        let url = this.getUrl();

        return <div>
            <MarkupLine>
                <FormattedMessage tagName="p" id="mirroringblade.scancodehelp" />
            </MarkupLine>
            <MarkupLine mods="center">
                <QRCode value={url} size={256} bgColor="rgba(0,0,0,0)" fgColor="#fff" />
            </MarkupLine>
            <MarkupLine>
                <FormattedMessage id="mirroring.urllabel" tagName="p" />
            </MarkupLine>
            <MarkupLine mods="stretch">
                <GuiCopyInput value={url} />
            </MarkupLine>
        </div>;
    }

    //render functions
    render() {
        return <div>
            <MarkupLine>
                {this.state.code ?
                    <GuiProgressButton mods="delete" caption="btn.disableMirroring"
                        onClick={this.onDisableSharingClick} onDone={this.onSharingDisabled} /> :
                    <AddShareCodeButton mods="submit" caption="btn.enableMirroring"
                        onClick={this.onShareClick} onDone={this.onShared} />
                }
            </MarkupLine>
            {this.renderCode()}
        </div>
    }
}