import * as React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch, CarbonLabel } from "../CarbonFlux";
import styled, { css } from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import * as cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "./Icon";
import SvgIcon from "./SvgIcon";

interface IIconButtonProps extends IReactElementProps {
    icon?: { src: string; width: number; height: number };
    color?: any;
    hoverColor?: any;
    width?: number;
    height?: number;
    disabled?: boolean;
    label?: string;
}

export default class IconButton extends Component<IIconButtonProps, {}> {
    render() {
        var { icon, color, width, height, disabled,title,children, label, ...props } = this.props;

        if(typeof icon === 'string') {
            icon = icons[icon];
        }

        if(title && title[0] === '@') {
            title = this.context.intl.formatMessage({id:title});
        }

        return <IconButtonComponent title={title} width={width} height={height} disabled={disabled} {...props}>
            {!this.props.icon?children:<Icon className="icon" icon={icon} color={color || theme.button_default}/>}
            {!this.props.label?[]:<div className="_label"><CarbonLabel id={this.props.label}/></div>}
        </IconButtonComponent>;
    }
}

const IconButtonComponent = styled.div.attrs<{ width?: number, height?: number, color?: any, hoverColor?: any, disabled?: any }>({}) `
    width:${props => props.width}px;
    height:${props => props.height}px;
    cursor:pointer;
    display:flex;
    align-items: center;
    justify-content:center;
    position: relative;
    ._label {
        position:absolute;
        bottom:0;
        left:0;
        right: 0;
        color: ${theme.text_color};
        font: ${theme.button_caption_font};
        text-align:center;
    }

    & > .icon {
        background-color: ${props => !props.disabled ? (props.color || theme.button_default) : theme.button_disabled};
    }

    ${props => props.disabled ? '' : css`
        &:hover > .icon {
            background-color: ${props => props.hoverColor || theme.button_hover}
        }
    `}
`;


