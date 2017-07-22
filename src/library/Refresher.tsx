import React from "react";
import { Component } from "../CarbonFlux";
import bem from "../utils/commonUtils";
import { GuiButton } from "../shared/ui/GuiComponents";

type RefresherProps = {
    visible: boolean;
    onClick: () => void;
}

export default class Refresher extends Component<RefresherProps> {
    render() {
        var cn = bem("stencils-refresher", null, { hidden: !this.props.visible });
        return <div className={cn}>
            <GuiButton onClick={this.props.onClick}
                mods={['small', 'hover-white']}
                icon="refresh"
                caption="refresh.toolbox"/>
        </div>
    }
}