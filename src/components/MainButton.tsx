import * as React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch, CarbonLabel } from "../CarbonFlux";
import styled, { css } from "styled-components";
import { FormattedMessage, defineMessages } from 'react-intl';
import * as cx from "classnames";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "./Icon";
import { MainButtonComponent } from "../components/CommonStyle";

interface IMainButtonProps extends IReactElementProps {
    label: string;
}


export default class MainButton extends Component<IMainButtonProps, {}> {
    render() {
        var { ...props } = this.props;

        return <MainButtonComponent {...props}>
            <CarbonLabel id={this.props.label} />
        </MainButtonComponent>;
    }
}
