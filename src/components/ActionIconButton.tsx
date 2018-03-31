import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch, CarbonLabel } from "../CarbonFlux";
import styled, { css } from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "./Icon";
import { app, Selection } from "carbon-core";
import IconButton from "./IconButton";

interface IActionIconButtonProps extends IReactElementProps {
    id:string;
    icon?:any;
}

export default class ActionIconButton extends Component<IActionIconButtonProps, {}> {
    render() {
        var action = app.actionManager.getAction(this.props.id);

        return <IconButton className={this.props.className} icon={this.props.icon} disabled={!app.actionManager.isEnabled(this.props.id, Selection)} onClick={()=>app.actionManager.invoke(this.props.id)}>
            {this.props.children}
        </IconButton>

    }
}
