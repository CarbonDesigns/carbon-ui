import * as React from "react";
import { Component } from "../CarbonFlux";
import bem from "../utils/commonUtils";
import { GuiButton } from "../shared/ui/GuiComponents";
import { GuiProgressButton } from "../shared/ui/GuiProgressButton";

type RefresherProps = {
    visible: boolean;
    loading: boolean;
    onClick: () => void;
}

export default class Refresher extends Component<RefresherProps> {
    render() {
        var cn = bem("stencils-refresher", null, { hidden: !this.props.visible });
        return <div className={cn}>
            <GuiProgressButton loading={this.props.loading} onClick={this.props.onClick}
                mods={['small', 'hover-white']}
                icon="refresh"
                caption="refresh.toolbox"/>
        </div>
    }
}