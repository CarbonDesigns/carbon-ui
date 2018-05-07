import * as React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import * as cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import { backend } from "carbon-core"

interface IIconProps extends IReactElementProps {
    icon?: {src:string;width:number;height:number};
    color?: string;
}

const IconStyled = styled.div.attrs<{ src?: any, defaultColor?: any, width?: any, height?: any }>({}) `
    mask: url(${props => props.src});
    background-color: ${props => props.defaultColor};
    background-repeat: no-repeat;
    width:${props => props.width}px;
    height:${props => props.height}px;
    mask-repeat: no-repeat;
`;

export default class Icon extends Component<IIconProps, {}> {
    render() {
        var { icon, color, className, ...props } = this.props;
        if(typeof icon === 'string') {
            icon = icons[src];
        }

        var { src, width, height } = icon || { src: "", width: 0, height: 0 };

        return <IconStyled src={src} width={width} height={height} defaultColor={color} className={className} {...props}>
        </IconStyled>;
    }
}
