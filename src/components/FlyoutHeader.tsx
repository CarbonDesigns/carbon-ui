import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch, CarbonLabel } from "../CarbonFlux";
import styled, { css } from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "./Icon";

interface IFlyoutHeaderProps extends IReactElementProps {
    icon?: { src: string; width: number; height: number };
    label?:string;
}

const FlyoutHeaderComponent = styled.div`
    width: 100%;
    color: ${theme.text_color};
    font:${theme.link_font};
    display: flex;
    align-items:center;
    margin-bottom:8px;

    &, & > .text {
        height: 14px;
        line-height:14px;
    }

    & > .text {
        flex:1;
    }

    & > .icon {
        margin: 0 14px 0 2px;
        background-color: ${theme.accent};
        background:linear-gradient(to right, ${theme.accent} 0%, ${theme.accent.darken(0.2)} 100%);
    }

    & > .triangle {
        background-color:${theme.text_color};
    }
`

export default class FlyoutHeader extends Component<IFlyoutHeaderProps, {}> {
    render() {
        var { icon, label, ...props } = this.props;

        return <FlyoutHeaderComponent {...props}>
            <Icon className="icon" icon={icon}></Icon>
            <div className="text"><CarbonLabel  id={label}/></div>
            <Icon className="triangle" icon={icons.triangle_down}/>
        </FlyoutHeaderComponent>;
    }
}
