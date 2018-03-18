import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled from "styled-components";
import { app } from "carbon-core";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import appStore from "../AppStore";
import theme from "../theme";
import icons from "../theme-icons";
import IconButton from "../components/IconButton";
import ZoomBar from "./zoomBar";

interface IActionHeaderProps extends IReactElementProps {

}

interface IActionHeaderState {
}

export default class ActionHeader extends Component<IActionHeaderProps, IActionHeaderState> {
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);
        this.state = {}
    }

    undoAction = () => {
        app.actionManager.invoke("undo");
    }

    redoAction = () => {
        app.actionManager.invoke("redo");
    }

    render() {
        return <ActionHeaderComponent>
            <IconButton icon={icons.undo} width={46} height={46} color="white" onClick={this.undoAction}/>
            <IconButton icon={icons.redo} width={46} height={46} color="white" onClick={this.redoAction}/>
            <ZoomBar/>
        </ActionHeaderComponent>;
    }
}

const ActionHeaderComponent = styled.div`
    white-space: nowrap;
    padding: 0 10px;
    position: relative;
    display: flex;
    height:100%;
`;
