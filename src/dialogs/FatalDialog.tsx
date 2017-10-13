import React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import { GuiButton } from "../shared/ui/GuiComponents";
import DialogRegistry from "./DialogRegistry";
import Dialog from "./Dialog";
import { FormattedMessage } from "react-intl";
import { Markup, MarkupLine } from "../shared/ui/Markup";

export class FatalDialog extends Dialog {
    canClose() {
        return false;
    }

    private onReload(){
        location.reload(true);
    }

    renderHeader(){
        return <FormattedMessage id="@fatal.header" tagName="p"/>;
    }

    renderBody(){
        return <div className="fatal-dialog">
            <MarkupLine>
                <FormattedMessage id="@fatal.message" tagName="p"/>
            </MarkupLine>
            <MarkupLine>
                <FormattedMessage id="@fatal.message2" tagName="p"/>
            </MarkupLine>
            <MarkupLine>
                <GuiButton onClick={this.onReload} caption="@fatal.reload" mods="submit"/>
            </MarkupLine>
        </div>
    }
}

DialogRegistry.register("FatalDialog", FatalDialog);