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
import LinkButton from "./LinkButton";

interface IActionLinkButtonProps {
    id:string;
}

export default class ActionLinkButton extends Component<IActionLinkButtonProps, {}> {
    render() {
        var action = app.actionManager.getAction(this.props.id);

        return <LinkButton label={action.name} disabled={!app.actionManager.isEnabled(this.props.id, Selection)} onClick={()=>app.actionManager.invoke(this.props.id)}/>
    }
}
