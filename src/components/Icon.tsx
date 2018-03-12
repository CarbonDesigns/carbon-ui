import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import {backend} from "carbon-core"

interface IIconProps extends IReactElementProps {
    src?:string;
    color?:string;
    width?:number;
    height?:number;
}

const IconStyled = styled.div.attrs<{src?:any, color?:any, width?:any, height?:any}>({})`
    mask: url(${props => props.src});
    background-color: ${props=>props.color};
    background-repeat: no-repeat;
    width:${props=>props.width}px;
    height:${props=>props.height}px;
    mask-repeat: no-repeat;
`;

export default class Icon extends Component<IIconProps, {}> {
    render() {
        var {src, color, className, ...props} = this.props;
        return <IconStyled src={src} color={color} className={className} {...props} >
        </IconStyled>;
    }
}
