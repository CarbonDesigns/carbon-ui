import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch, CarbonLabel } from "../CarbonFlux";
import styled, { css } from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "./Icon";

interface ILinkButtonProps extends IReactElementProps {
    icon?: { src: string; width: number; height: number };
    color?: any;
    label?:string;
    hoverColor?: any;
    width?: number;
    height?: number;
    disabled?: boolean;
}

const LinkButtonComponent = styled.div.attrs<{ width?: number, height?: number, color?: any, hoverColor?: any, disabled?: any }>({}) `
    height:${props => props.height}px;
    width:${props=>props.width?props.width+'px' : '100%'};
    cursor:pointer;
    padding:${theme.link_padding};
    color: ${theme.text_color};
    font:${theme.link_font};
    color: ${props => !props.disabled?(props.color || theme.button_default):theme.button_disabled};

    ${props => props.disabled ? '' : css`
        &:hover {
            color: ${props => props.hoverColor || theme.button_hover};
        }
    `}
`

export default class LinkButton extends Component<ILinkButtonProps, {}> {
    render() {
        var { icon, color, width, height, ...props } = this.props;

        return <LinkButtonComponent width={width} height={height} {...props}>
            <CarbonLabel id={this.props.label}/>
        </LinkButtonComponent>;
    }
}
