import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled from "styled-components";
import { app, Selection, ISelectComposite } from "carbon-core";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import appStore from "../AppStore";
import theme from "../theme";
import icons from "../theme-icons";
import IconButton from "../components/IconButton";
import ZoomBar from "./zoomBar";
import FlyoutButton from "../shared/FlyoutButton";
import CarbonActions, { CarbonAction } from "../CarbonActions";

interface IActionHeaderProps extends IReactElementProps {

}

interface IActionHeaderState {
    selection: any[];
}

export default class ActionHeader extends Component<IActionHeaderProps, IActionHeaderState> {
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);
        this.state = { selection: Selection.selectComposite().elements }
    }

    canHandleActions() {
        return true;
    }

    onAction(action: CarbonAction) {
        switch (action.type) {
            case "Carbon_Selection":
                this.onElementSelected();
                return;
        }
    }

    onElementSelected() {
        this.setState({ selection: Selection.selectComposite().elements });
    }

    undoAction() {
        app.actionManager.invoke("undo");
    }

    redoAction() {
        app.actionManager.invoke("redo");
    }

    pathUnion() {
        app.actionManager.invoke("pathUnion");
    }

    pathIntersect() {
        app.actionManager.invoke("pathIntersect");
    }

    pathDifference() {
        app.actionManager.invoke("pathDifference");
    }

    pathSubtract() {
        app.actionManager.invoke("pathSubtract");
    }

    render() {
        var hasSelection = this.state.selection.length > 0;
        return <ActionHeaderComponent>
            <IconButton icon={icons.undo} width={46} height={46} onClick={this.undoAction} />
            <IconButton icon={icons.redo} width={46} height={46} onClick={this.redoAction} />
            <FlyoutButton
                position={{ targetVertical: "bottom", targetHorizontal: "center" }}
                disabled={!hasSelection}
                renderContent={() =>
                    <IconButton icon={icons.path_binary} width={46} height={46} disabled={!hasSelection} />
                }>
                <ButtonHorizontalGroup>
                    <IconButton icon={icons.path_binary} width={46} height={46} onClick={this.pathUnion} />
                    <IconButton icon={icons.path_binary} width={46} height={46} onClick={this.pathIntersect} />
                    <IconButton icon={icons.path_binary} width={46} height={46} onClick={this.pathDifference} />
                    <IconButton icon={icons.path_binary} width={46} height={46} onClick={this.pathSubtract} />
                </ButtonHorizontalGroup>
            </FlyoutButton>
            <ZoomBar />
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

const ButtonHorizontalGroup = styled.div`
    display:flex;
    background: ${theme.flyout_background};
    box-shadow: ${theme.flyout_shadow};
`;
