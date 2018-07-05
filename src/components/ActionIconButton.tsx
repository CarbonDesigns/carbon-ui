import * as React from "react";
import * as cx from "classnames";
import { Component } from "../CarbonFlux";
import { app, Selection } from "carbon-core";
import IconButton from "./IconButton";

interface IActionIconButtonProps extends IReactElementProps {
    id:string;
    icon?:any;
}

export default class ActionIconButton extends Component<IActionIconButtonProps, {}> {
    render() {
        let disabled =!app.actionManager.isEnabled(this.props.id, Selection);
        let classname = cx(this.props.className, {disabled: disabled});

        return <IconButton className={classname} icon={this.props.icon} disabled={disabled} onClick={()=>app.actionManager.invoke(this.props.id)}>
            {this.props.children}
        </IconButton>

    }
}
