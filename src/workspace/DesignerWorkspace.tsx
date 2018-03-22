//require("./__workspace.less");
import WindowControls from './topBar/windowControls';
import ContextBar from './topBar/contextbar';
// import Tools          from './topBar/tools';
import Breadcrumbs from './bottomBar/breadcrumbs';
import PagesBar from './bottomBar/pagesbar';

import React from 'react';

import { app, Selection, Environment, RenderLoop } from "carbon-core";
import ContextMenu from "../shared/ContextMenu";

import ImageDrop from "./ImageDrop";

import { richApp } from "../RichApp";
import { listenTo, Component, ComponentWithImmutableState } from "../CarbonFlux";
import { Clipboard } from "carbon-core";
import { Record } from "immutable";
import cx from 'classnames';
import AnimationSettings from "../animation/AnimationSetting";

import appStore from "../AppStore";
import { cancellationStack, ICancellationHandler } from "../shared/ComponentStack";
import styled from "styled-components";
import theme from "../theme";
import Tools from '../tools/tools';

require("./IdleDialog");

const State = Record({
    activeTool: null,
    attached: false
})

const WorkspaceStyled = styled.div`
    position:absolute;
    top:0;
    bottom:0;
    left:0;
    right:0;
    background-color: ${theme.workspace_background};
    background-color: ${theme.workspace_background};
    overflow: hidden;
    user-select: none;
`;

const Viewport = styled.div`
    position:absolute;
    top:0;
    bottom:0;
    left:58px;
    right:0;
    /* background-color: ${theme.workspace_background}; */
    overflow: hidden;
    user-select: none;
`;


class Workspace extends ComponentWithImmutableState<any, any> implements ICancellationHandler {
    private _renderLoop = new RenderLoop();
    private _imageDrop = new ImageDrop();

    refs: {
        contextMenu: any;
        animationSettings: any;
    };

    private viewport: HTMLElement;

    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                activeTool: appStore.state.activeTool
            })
        };
    }

    @listenTo(richApp.workspaceStore, appStore)
    onChange() {
        this.mergeStateData({ activeTool: appStore.state.activeTool });

        if (app.isLoaded && !this._imageDrop.active() && this._renderLoop.isAttached()) {
            this._imageDrop.setup(this._renderLoop.viewContainer);
        }
    }

    onCancel() {
        app.actionManager.invoke("cancel");
    }

    _buildContextMenu(event) {
        var menu = { items: [] };
        var context = {
            selectComposite: Selection.selectComposite(),
            eventData: Environment.controller.createEventData(event)
        };
        app.onBuildMenu.raise(context, menu);

        return Promise.resolve(menu);
    }

    componentDidMount() {
        super.componentDidMount();

        this._renderLoop.mountDesignerView(app, this.viewport);

        if (app.isLoaded && !this._imageDrop.active()) {
            this._imageDrop.setup(this._renderLoop.viewContainer);
        }

        this.refs.contextMenu.bind(this._renderLoop.viewContainer);
        this.refs.animationSettings.attach();

        cancellationStack.push(this);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        this._renderLoop.unmount();

        this._imageDrop.destroy();
        this.refs.contextMenu.unbind(this._renderLoop.viewContainer);
        this.refs.animationSettings.detach();

        cancellationStack.pop();
    }

    render() {
        var status_text = 'saved2';
        return (
            <WorkspaceStyled>
                <Tools key="tools" />
                <Viewport id="viewport" innerRef={x => { this.viewport = x }} key="viewport">
                    {/* canvases and view container will be inserted here */}

                    <div id="workspace-top-edge" className="rulers">
                        {/* <Tools key="tools"/> */}
                        <WindowControls key="windowcontrols" />
                        <ContextBar key="contextBar" />
                        {/*<AltContext key="altContext"/>*/}
                    </div>

                    <div id="workspace-bottom-edge">
                        <PagesBar key="boards" />
                        <Breadcrumbs key="breadcrumbs" />
                    </div>

                    <ContextMenu ref="contextMenu" onBuildMenu={this._buildContextMenu.bind(this)} />
                    <AnimationSettings ref="animationSettings" />
                </Viewport>
            </WorkspaceStyled>);
    }

}

export default Workspace;
