import * as React from "react";
import { Component } from "../CarbonFlux";
import styled from "styled-components";
import icons from "../theme-icons";

interface IIconProps extends IReactElementProps {
    icon?: {src:string;width:number;height:number};
    color?: string;
}

const IconStyled = styled.div<{ src?: any, defaultColor?: any, width?: any, height?: any }>`
    mask: url(${props => props.src});
    background-color: ${props => props.defaultColor};
    background-repeat: no-repeat;
    width:${props => props.width}px;
    height:${props => props.height}px;
    mask-repeat: no-repeat;
`;

const RawIconStyled = styled.div<{ src?: any, defaultColor?: any, width?: any, height?: any }>`
    background-image: url(${props => props.src});
    background-color: unset;
    background-repeat: no-repeat;
    width:${props => props.width}px;
    height:${props => props.height}px;
`;

export default class Icon extends Component<IIconProps, {}> {
    render() {
        var { icon, color, className, ...props } = this.props;
        if(typeof icon === 'string') {
            icon = icons[src];
        }

        var { src, width, height } = icon || { src: "", width: 0, height: 0 };

        if (color)
        {
             return <IconStyled src={src} width={width} height={height} defaultColor={color} className={className} {...props}>
                     </IconStyled>;
        }

        return <RawIconStyled src={src} width={width} height={height} className={className} {...props}>
                     </RawIconStyled>;
    }
}
