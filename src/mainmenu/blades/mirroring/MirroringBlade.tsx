import * as React from "react";
import { app, backend, MirrorCode } from "carbon-core";
import { Component } from "../../../CarbonFlux";
import { Markup, MarkupLine } from "../../../shared/ui/Markup";
import * as cx from "classnames";
import { FormattedMessage } from "react-intl"
import { BladeBody } from "../BladePage";
import { GuiContentLoader } from "../../../shared/ui/GuiContentLoader";
import { MirrorForm } from "./MirrorForm";

type MirrorCodeLoader = new (props) => GuiContentLoader<MirrorCode>;
const MirrorCodeLoader = GuiContentLoader as MirrorCodeLoader;

export default class MirroringBlade extends Component {
    private onLoad = () => {
        return backend.shareProxy.mirrorCode(app.companyId(), app.id, false);
    }

    private renderContent = (data: MirrorCode) => {
        app.mirroringCode(data.code); //?
        return <MirrorForm code={data.code} />;
    }

    render() {
        return <BladeBody>
            <MarkupLine>
                <FormattedMessage id="mirroringblade.helptext" tagName="p" />
            </MarkupLine>
            <MirrorCodeLoader onLoad={this.onLoad} onRenderContent={this.renderContent} />
        </BladeBody>;
    }
}
