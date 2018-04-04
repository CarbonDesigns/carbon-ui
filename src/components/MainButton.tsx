import * as React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch, CarbonLabel } from "../CarbonFlux";
import styled, { css } from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import * as cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "./Icon";

interface IMainButtonProps extends IReactElementProps {
    label:string;
}

const MainButtonComponent = styled.button`
    height:24px;
    min-width:30px;
    cursor:pointer;
    color: ${theme.text_color};
    background-image: linear-gradient(to right, #ff4295 0%, #ff292c 100%);
    border-radius: 1px;
`

export default class MainButton extends Component<IMainButtonProps, {}> {
    render() {
        var { ...props } = this.props;

        return <MainButtonComponent {...props}>
            <CarbonLabel id={this.props.label}/>
        </MainButtonComponent>;
    }
}
