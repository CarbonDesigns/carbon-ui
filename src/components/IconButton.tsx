import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";

interface IIconButtonProps extends IReactElementProps {
    icon?: any;
}

const IconStyled = styled.div.attrs<{ src?: any, color?: any, width?: any, height?: any }>({}) `
    mask: url(${props => props.src});
    background-color: ${props => props.color};
    background-repeat: no-repeat;
    width:${props => props.width}px;
    height:${props => props.height}px;
    mask-repeat: no-repeat;
    cursor:pointer;
`;

export default class IconButton extends Component<IIconButtonProps, {}> {
    render() {
        var { icon, ...props } = this.props;
        var { src, width, height } = icon || { src: "", width: 0, height: 0 };
        return <IconStyled src={src} width={width} height={height} {...props}>
        </IconStyled>;
    }
}
