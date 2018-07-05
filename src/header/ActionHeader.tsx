import * as React from "react";
import * as PropTypes from "prop-types";
import { listenTo, Component, handles, dispatch, ComponentWithImmutableState } from "../CarbonFlux";
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
import { Record } from "immutable";
import CodeDesignSwitch from "./CodeDesignSwitch";
import ActionIconButton from "../components/ActionIconButton";

interface IActionHeaderProps extends IReactElementProps {

}

interface IActionHeaderState {
    data: any;
}

const State = Record({
    selection: null,
    activeMode: null,
    prototypeMode: null
})


export default class ActionHeader extends ComponentWithImmutableState<IActionHeaderProps, IActionHeaderState> {
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);

        this.state = {
            data: new State({
                selection: Selection.selectComposite().elements,
                prototypeMode: appStore.state.prototypeMode
            })
        };
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

    @listenTo(appStore)
    onChange() {
        this.mergeStateData({
            activeMode: appStore.state.activeMode,
            prototypeMode: appStore.state.prototypeMode
        });
    }

    onElementSelected() {
        this.mergeStateData({
            selection: Selection.selectComposite().elements
        });
    }

    undoAction() {
        app.actionManager.invoke("undo");
    }

    redoAction() {
        app.actionManager.invoke("redo");
    }

    render() {
        var hasSelection = this.state.data.selection.length > 0;

        if (this.state.data.activeMode === "prototype") {
            return <ActionHeaderComponent>
                <CodeDesignSwitch mode={this.state.data.prototypeMode} />
                {(this.state.data.prototypeMode === "visual") && <ZoomBar />}
            </ActionHeaderComponent>;
        } else {
            return <ActionHeaderComponent>
                <IconButton icon={icons.undo} width={46} height={46} onClick={this.undoAction} />
                <IconButton icon={icons.redo} width={46} height={46} onClick={this.redoAction} />

                <RepeatDropButton />
                <FlyoutButton
                    position={{ targetVertical: "bottom", targetHorizontal: "center" }}
                    renderContent={() =>
                        <IconButton icon={icons.symbols_small} width={46} height={46} title="@symbol.menu" />
                    }>
                    <FlyoutBody>
                        <FlyoutHeader icon={icons.symbols_small} label="@symbols" />
                        <VerticalGroup>
                            <ActionLinkButton id="symbols.create" />
                            <ActionLinkButton id="symbols.markAsText" />
                            <ActionLinkButton id="symbols.markAsBackground" />
                            <ActionLinkButton id="symbols.editMaster" />
                            <ActionLinkButton id="symbols.detach" />
                        </VerticalGroup>
                    </FlyoutBody>
                </FlyoutButton>
                <FlyoutButton
                    position={{ targetVertical: "bottom", targetHorizontal: "center" }}
                    renderContent={() =>
                        <IconButton icon={icons.m_arrange} width={46} height={46} title="@arrange.menu" />
                    }>
                    <FlyoutBody>
                        <FlyoutHeader icon={icons.m_arrange} label="@arrange" />
                        <VerticalGroup>
                            <ActionLinkButton id="bringToFront" />
                            <ActionLinkButton id="sendToBack" />
                            <ActionLinkButton id="bringForward" />
                            <ActionLinkButton id="sendBackward" />
                        </VerticalGroup>
                    </FlyoutBody>
                </FlyoutButton>
                <FlyoutButton
                    position={{ targetVertical: "bottom", targetHorizontal: "center" }}
                    renderContent={() =>
                        <IconButton icon={icons.m_pathop} width={46} height={46} />
                    }>
                    <FlyoutBody>
                        <FlyoutHeader icon={icons.m_pathop} label="@path.operations" />
                        <HorizontalGroup className="pathActions">
                            <ActionIconButtonStyled id="pathUnion">
                                <svg width="24px" height="24px" viewBox="0 0 24 24">
                                    <path fill="#FF386B" fillRule="evenodd" stroke="#000" d="M58.2380952,49 L62.6984127,49 C64.1009524,49 65.2380952,50.1371429 65.2380952,51.5396825 L65.2380952,61.6984127 C65.2380952,63.1009524 64.1009524,64.2380952 62.6984127,64.2380952 L52.5396825,64.2380952 C51.1371429,64.2380952 50,63.1009524 50,61.6984127 L50,58.2380952 L45.5396825,58.2380952 C44.1371429,58.2380952 43,57.1009524 43,55.6984127 L43,45.5396825 C43,44.1371429 44.1371429,43 45.5396825,43 L55.6984127,43 C57.1009524,43 58.2380952,44.1371429 58.2380952,45.5396825 L58.2380952,49 Z" transform="translate(-42 -42)"/>
                                </svg>
                            </ActionIconButtonStyled>
                            <ActionIconButtonStyled id="pathIntersect">
                                <svg width="24px" height="24px" viewBox="0 0 24 24">
                                    <g fill="none" fillRule="evenodd">
                                        <path fill="#FF386B" d="M8,7 L15,7 L15,12 C15,13.6568542 13.6568542,15 12,15 L8,15 L8,7 Z"/>
                                        <path stroke="#FFF" d="M2.53968254,0.5 C1.41328523,0.5 0.5,1.41328523 0.5,2.53968254 L0.5,12.6984127 C0.5,13.82481 1.41328523,14.7380952 2.53968254,14.7380952 L12.6984127,14.7380952 C13.82481,14.7380952 14.7380952,13.82481 14.7380952,12.6984127 L14.7380952,2.53968254 C14.7380952,1.41328523 13.82481,0.5 12.6984127,0.5 L2.53968254,0.5 Z"/>
                                        <path stroke="#FFF" d="M9.53968254,6.5 C8.41328523,6.5 7.5,7.41328523 7.5,8.53968254 L7.5,18.6984127 C7.5,19.82481 8.41328523,20.7380952 9.53968254,20.7380952 L19.6984127,20.7380952 C20.82481,20.7380952 21.7380952,19.82481 21.7380952,18.6984127 L21.7380952,8.53968254 C21.7380952,7.41328523 20.82481,6.5 19.6984127,6.5 L9.53968254,6.5 Z"/>
                                    </g>
                                </svg>
                            </ActionIconButtonStyled>
                            <ActionIconButtonStyled id="pathDifference">
                                <svg width="24px" height="24px" viewBox="0 0 24 24">
                                    <g fill="none" fillRule="evenodd" transform="translate(1 1)">
                                        <path stroke="#FF386B" fill="#FF386B" d="M2.53968254,0 C1.13714286,0 0,1.13714286 0,2.53968254 L0,12.6984127 C0,14.1009524 1.13714286,15.2380952 2.53968254,15.2380952 L12.6984127,15.2380952 C14.1009524,15.2380952 15.2380952,14.1009524 15.2380952,12.6984127 L15.2380952,2.53968254 C15.2380952,1.13714286 14.1009524,0 12.6984127,0 L2.53968254,0 Z"/>
                                        <path fill="#292929" stroke="#FFF" d="M9.53968254,6 C8.13714286,6 7,7.13714286 7,8.53968254 L7,18.6984127 C7,20.1009524 8.13714286,21.2380952 9.53968254,21.2380952 L19.6984127,21.2380952 C21.1009524,21.2380952 22.2380952,20.1009524 22.2380952,18.6984127 L22.2380952,8.53968254 C22.2380952,7.13714286 21.1009524,6 19.6984127,6 L9.53968254,6 Z"/>
                                    </g>
                                </svg>
                            </ActionIconButtonStyled>
                            <ActionIconButtonStyled id="pathSubtract">
                                <svg width="24px" height="24px" viewBox="0 0 24 24">
                                    <g fill="none" fillRule="evenodd">
                                        <path stroke="#FF386B" fill="#FF386B" d="M9.5,6 C8.119375,6 7,7.119375 7,8.5 L7,18.5 C7,19.880625 8.119375,21 9.5,21 L19.5,21 C20.880625,21 22,19.880625 22,18.5 L22,8.5 C22,7.119375 20.880625,6 19.5,6 L9.5,6 Z"/>
                                        <path stroke="#FF386B" fill="#FF386B" d="M2.5,0 C1.119375,0 0,1.119375 0,2.5 L0,12.5 C0,13.880625 1.119375,15 2.5,15 L12.5,15 C13.880625,15 15,13.880625 15,12.5 L15,2.5 C15,1.119375 13.880625,0 12.5,0 L2.5,0 Z"/>
                                        <path d="M9.5,6 C8.119375,6 7,7.119375 7,8.5 L7,18.5 C7,19.880625 8.119375,21 9.5,21 L19.5,21 C20.880625,21 22,19.880625 22,18.5 L22,8.5 C22,7.119375 20.880625,6 19.5,6 L9.5,6 Z"/>
                                        <path fill="#292929" stroke="#FFF" d="M8.97909587,6.07689333 L15.032683,6.07689333 L15.032683,14.0700808 C15.032683,14.6223655 14.5849678,15.0700808 14.032683,15.0700808 L6.97909587,15.0700808 L6.97909587,8.07689333 C6.97909587,6.97232383 7.87452637,6.07689333 8.97909587,6.07689333 Z"/>
                                    </g>
                                </svg>
                            </ActionIconButtonStyled>
                        </HorizontalGroup>
                        <VerticalGroup>
                            <ActionLinkButton id="pathFlatten" />
                            <ActionLinkButton id="convertToPath" />
                        </VerticalGroup>
                    </FlyoutBody>
                </FlyoutButton>

                <FlyoutButton
                    position={{ targetVertical: "bottom", targetHorizontal: "center" }}
                    renderContent={() =>
                        <IconButton icon={icons.m_group} width={46} height={46} title="@group.menu" />
                    }>
                    <FlyoutBody>
                        <FlyoutHeader icon={icons.m_group} label="@group.operations" />
                        <VerticalGroup>
                            <ActionLinkButton id="group" />
                            <ActionLinkButton id="ungroup" />
                            <ActionLinkButton id="group.mask" />
                            <ActionLinkButton id="group.vstack" />
                            <ActionLinkButton id="group.hstack" />
                            <ActionLinkButton id="group.canvas" />
                        </VerticalGroup>
                    </FlyoutBody>
                </FlyoutButton>
                <ZoomBar />
            </ActionHeaderComponent>;
        }
    }
}

const ActionHeaderComponent = styled.div`
    white-space: nowrap;
    padding: 0 10px;
    position: relative;
    display: flex;
    height:100%;
    width:100%;
    justify-content:flex-end;
`;

const ActionIconButtonStyled = styled(ActionIconButton).attrs<any>({})`
    background: ${theme.panel_background};
    width:46px;
    height:46px;
    cursor:pointer;

    &.disabled {
        opacity:0.4;
    }

    svg .action {
        fill: url(#linearGradient-h);
    }

    & svg:hover .action {
        fill: url(#linearGradient-h-a);
    }
`;


