import * as React from "react";
import * as PropTypes from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled from "styled-components";
import { app, Selection, ISelectComposite } from "carbon-core";
import { FormattedMessage, defineMessages } from 'react-intl';
import * as cx from "classnames";
import appStore from "../AppStore";
import theme from "../theme";
import icons from "../theme-icons";
import IconButton from "../components/IconButton";
import ZoomBar from "./zoomBar";
import FlyoutButton from "../shared/FlyoutButton";
import CarbonActions, { CarbonAction } from "../CarbonActions";
import LinkButton from "../components/LinkButton";
import ActionLinkButton from "../components/ActionLinkButton";
import { FlyoutBody, HorizontalGroup, VerticalGroup } from "../components/CommonStyle";
import FlyoutHeader from "../components/FlyoutHeader";
import TextInput from "../components/TextInput";
import MainButton from "../components/MainButton";
import Slider from "../components/Slider";
import RepeatDropButton from "./RepeateDropButton";

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
            <ZoomBar />
            <RepeatDropButton/>
            <FlyoutButton
                position={{ targetVertical: "bottom", targetHorizontal: "center" }}
                renderContent={() =>
                    <IconButton icon={icons.symbols_small} width={46} height={46} title="@symbol.menu"/>
                }>
                <FlyoutBody>
                    <FlyoutHeader icon={icons.symbols_small} label="@symbols"/>
                    <VerticalGroup>
                        <ActionLinkButton id="symbols.create"/>
                        <ActionLinkButton id="symbols.markAsText"/>
                        <ActionLinkButton id="symbols.markAsBackground"/>
                        <ActionLinkButton id="symbols.editMaster"/>
                        <ActionLinkButton id="symbols.detach"/>
                    </VerticalGroup>
                </FlyoutBody>
            </FlyoutButton>
            <FlyoutButton
                position={{ targetVertical: "bottom", targetHorizontal: "center" }}
                renderContent={() =>
                    <IconButton icon={icons.symbols_small} width={46} height={46} title="@arrange.menu"/>
                }>
                <FlyoutBody>
                    <FlyoutHeader icon={icons.symbols_small} label="@arrange"/>
                    <VerticalGroup>
                        <ActionLinkButton id="bringToFront"/>
                        <ActionLinkButton id="sendToBack"/>
                        <ActionLinkButton id="bringForward"/>
                        <ActionLinkButton id="sendBackward"/>
                    </VerticalGroup>
                </FlyoutBody>
            </FlyoutButton>
            <FlyoutButton
                position={{ targetVertical: "bottom", targetHorizontal: "center" }}
                renderContent={() =>
                    <IconButton icon={icons.path_binary} width={46} height={46} />
                }>
                <FlyoutBody>
                    <FlyoutHeader icon={icons.symbols_small} label="@path.operations"/>
                    <HorizontalGroup>
                        <IconButton icon={icons.path_union} width={46} height={46} onClick={this.pathUnion} />
                        <IconButton icon={icons.path_intersect} width={46} height={46} onClick={this.pathIntersect} />
                        <IconButton icon={icons.path_difference} width={46} height={46} onClick={this.pathDifference} />
                        <IconButton icon={icons.path_subtract} width={46} height={46} onClick={this.pathSubtract} />
                    </HorizontalGroup>
                    <VerticalGroup>
                        <ActionLinkButton id="pathFlatten"/>
                        <ActionLinkButton id="convertToPath"/>
                    </VerticalGroup>
                </FlyoutBody>
            </FlyoutButton>

            <FlyoutButton
                position={{ targetVertical: "bottom", targetHorizontal: "center" }}
                renderContent={() =>
                    <IconButton icon={icons.group} width={46} height={46} title="@group.menu"/>
                }>
                <FlyoutBody>
                    <FlyoutHeader icon={icons.symbols_small} label="@group.operations"/>
                    <VerticalGroup>
                        <ActionLinkButton id="group"/>
                        <ActionLinkButton id="ungroup"/>
                        <ActionLinkButton id="group.mask"/>
                        <ActionLinkButton id="group.vstack"/>
                        <ActionLinkButton id="group.hstack"/>
                        <ActionLinkButton id="group.canvas"/>
                    </VerticalGroup>
                </FlyoutBody>
            </FlyoutButton>
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


