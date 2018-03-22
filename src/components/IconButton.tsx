import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled, { css } from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "./Icon";

interface IIconButtonProps extends IReactElementProps {
    icon?: { src: string; width: number; height: number };
    color?: any;
    hoverColor?: any;
    width?: number;
    height?: number;
    disabled?: boolean;
}

const IconButtonComponent = styled.div.attrs<{ width?: number, height?: number, color?: any, hoverColor?: any, disabled?: any }>({}) `
    width:${props => props.width}px;
    height:${props => props.height}px;
    cursor:pointer;
    display:flex;
    align-items: center;
    justify-content:center;
    & > .icon {
        background-color: ${props => props.color || theme.button_default};
    }

    ${props => props.disabled ? '' : css`
        &:hover > .icon {
            background-color: ${props => props.hoverColor || theme.button_hover}
        }
    `}
`

export default class IconButton extends Component<IIconButtonProps, {}> {
    render() {
        var { icon, color, width, height, ...props } = this.props;

        return <IconButtonComponent width={width} height={height} {...props}>
            <Icon className="icon" icon={icon}>
            </Icon>
        </IconButtonComponent>;
    }
}
