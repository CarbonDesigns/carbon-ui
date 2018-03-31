import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction } from "../../../CarbonFlux";
import { MarkupLine } from "../../../shared/ui/Markup";
import { GuiCopyInput } from "../../../shared/ui/GuiCopyInput";
import { ShareCode, backend, app, ShareRole } from "carbon-core";
import { GuiPromiseButton } from "../../../shared/ui/GuiPromiseButton";

export type AddShareCodeButton = new (props) => GuiPromiseButton<ShareCode>;
export const AddShareCodeButton = GuiPromiseButton as AddShareCodeButton;

type ShareFormProps = {
    codes: ShareCode[];
}
type ShareFormState = {
    codes: ShareCode[];
}

export default class ShareForm extends Component<ShareFormProps, ShareFormState> {
    constructor(props: ShareFormProps) {
        super(props);
        this.state = { codes: props.codes };
    }

    componentWillReceiveProps(nextProps: ShareFormProps) {
        this.setState({ codes: nextProps.codes });
    }

    //handlers
    private onShareClick = () => {
        return backend.shareProxy.addCode(app.companyId(), app.id, ShareRole.Edit);
    }
    private onShared = (code: ShareCode) => {
        let codes = this.state.codes.slice();
        codes.push({ code: code.code, role: ShareRole.Edit });
        this.setState({ codes });
    }

    private onDisableSharingClick = () => {
        return backend.shareProxy.deleteAllCodes(app.companyId(), app.id);
    }
    private onSharingDisabled = () => {
        this.setState({ codes: [] });
    }

    //render functions
    render() {
        return <div>
            <MarkupLine>
                {this.state.codes.length ?
                    <GuiPromiseButton mods="delete" caption="@share.disable"
                        onClick={this.onDisableSharingClick} onDone={this.onSharingDisabled} /> :
                    <AddShareCodeButton mods="submit" caption="@share.generate"
                        onClick={this.onShareClick} onDone={this.onShared} />
                }
            </MarkupLine>
            <MarkupLine mods="stretch">
                {this.state.codes.length ? <GuiCopyInput value={location.origin + "/q/" + this.state.codes[0].code} /> : null}
            </MarkupLine>
        </div>
    }
}