import * as React from "react";
import PropTypes, { bool } from "prop-types";
import { Component} from "../CarbonFlux";
import styled from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';

interface IIconProps extends IReactElementProps {
    icon?: { src: string; width: number; height: number };
}

export default class SvgIcon extends Component<IIconProps, {}> {
    render() {
        var { icon, className, ...props } = this.props;
        var { src, width, height } = icon || { src: "", width: 0, height: 0 };
        return <object type="image/svg+xml" className={className} data={src} width={width} height={height} {...props}>
        </object>
    }
}
