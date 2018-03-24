import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch, CarbonLabel } from "../CarbonFlux";
import styled, { css } from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "./Icon";

interface ITextInputProps extends IReactElementProps {
    type:"text"|"email"|"number";
}

const TextInputComponent = styled.div.attrs<{ width?: number, height?: number, color?: any, hoverColor?: any, disabled?: any }>({}) `
    height:22px;
    min-width:30px;
    cursor:pointer;
    padding: 5px 8px;

    & > input {
        width:100%;
        height:100%;
        background:none;
        color: ${theme.text_color};
        font: ${theme.input_font};
    }
    background-color: ${theme.input_background};
    border-radius: 1px;
`

export default class TextInput extends Component<ITextInputProps, {}> {
    render() {
        var { type, ...props } = this.props;

        return <TextInputComponent {...props}>
            <input type={this.props.type}/>>
        </TextInputComponent>;
    }
}
