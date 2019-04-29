import * as React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch, CarbonLabel } from "../CarbonFlux";
import styled, { css } from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import * as cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "./Icon";

interface ITextInputProps extends IReactElementProps {
    type:"text"|"email"|"number";
    placeholder?:string;
    innerRef?:React.RefObject<HTMLInputElement>;
    min?:number;
    max?:number;
}

const TextInputComponent = styled.input<{ width?: number, height?: number, color?: any, hoverColor?: any, disabled?: any }>`
    height:22px;
    min-width:30px;
    cursor:pointer;
    padding: 5px 8px;
    color: ${theme.text_color};
    font: ${theme.input_font};
    background-color: ${theme.input_background};
    border-radius: 1px;
`

export default class TextInput extends Component<ITextInputProps, {}> {
    render() {
        return <TextInputComponent {...this.props} ref={this.props.innerRef}>
        </TextInputComponent>;
    }
}
