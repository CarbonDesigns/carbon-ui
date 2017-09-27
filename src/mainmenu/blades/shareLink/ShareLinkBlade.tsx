import React from "react";
import cx from 'classnames';
import { Markup, MarkupLine } from "../../../shared/ui/Markup";
import { BladeBody } from "../BladePage";
import { app, backend, ShareRole, ShareCode } from "carbon-core";
import { Component } from "../../../CarbonFlux";
import { FormattedMessage } from "react-intl";
import { GuiContentLoader } from "../../../shared/ui/GuiContentLoader";
import ShareForm from "./ShareForm";

export type ShareCodesLoader = new (props) => GuiContentLoader<{codes: ShareCode[]}>;
export const ShareCodesLoader = GuiContentLoader as ShareCodesLoader;

type ShareLinkBladeState = {
    codes: ShareCode[];
    addingCode: boolean;
}

export default class ShareLinkBlade extends Component<{}, ShareLinkBladeState> {
    constructor(props) {
        super(props);
        this.state = {
            codes: [],
            addingCode: false
        };
    }

    private onLoad = () => {
        return backend.shareProxy.getCodes(app.companyId(), app.id());
    }

    private renderContent = (data: {codes: ShareCode[]}) => {
        return <ShareForm codes={data.codes}/>;
    }

    render() {
        return (
            <BladeBody>
                <MarkupLine>
                    <FormattedMessage id="@share.desc" tagName="p" />
                </MarkupLine>
                <ShareCodesLoader onLoad={this.onLoad} onRenderContent={this.renderContent} />

                {/* <MarkupLine>
                    <GuiCheckbox label="Allow solve comments" />
                </MarkupLine> */}

                {/* <MarkupLine>
                    <div className="cap">Post the link in socials</div>
                </MarkupLine>

                <MarkupLine>
                    <button>facebook</button>
                    <button>twitter</button>
                    <button>linkedin</button>
                </MarkupLine>*/}
            </BladeBody>
        )
    }
}
