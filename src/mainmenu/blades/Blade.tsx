import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { Component, dispatchAction } from "../../CarbonFlux";
import BladeContainer from "./BladeContainer";

export abstract class Blade<TProps = {}, TState = {}> extends Component<TProps, TState> {
    context: {
        bladeContainer: BladeContainer
    }

    static contextTypes = {
        intl: PropTypes.object,
        bladeContainer: PropTypes.any
    }

    closeLast() {
        this.context.bladeContainer.closeLast();
    }
}