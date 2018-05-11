//require("./__workspace.less");
import WindowControls from './topBar/windowControls';
import ContextBar from './topBar/contextbar';
// import Tools          from './topBar/tools';
import Breadcrumbs from './bottomBar/breadcrumbs';
import PagesBar from './bottomBar/pagesbar';
import HotKeyListener from "../HotkeyListener";

import * as React from "react";
import * as PropTypes from "prop-types";

import { app, Selection, Environment, RenderLoop } from "carbon-core";
import ContextMenu from "../shared/ContextMenu";

import ImageDrop from "./ImageDrop";

import { richApp } from "../RichApp";
import { listenTo, Component, ComponentWithImmutableState, handles, dispatch } from "../CarbonFlux";
import { Clipboard } from "carbon-core";
import { Record } from "immutable";
import * as cx from "classnames";
import AnimationSettings from "../animation/AnimationSetting";

import appStore from "../AppStore";
import { cancellationStack, ICancellationHandler } from "../shared/ComponentStack";
import styled from "styled-components";
import theme from "../theme";
import Tools from '../tools/tools';
import CarbonActions from '../CarbonActions';
import Toolbox from '../library/Toolbox';

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

    static childContextTypes = {
        workspace: PropTypes.object
    }

    refs: {
        contextMenu: any;
        animationSettings: any;
    };

    private viewport: HTMLElement;
    private workspace = {view:null, controller:null};

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

    onAction(action: any) {
        if (action.type === CarbonActions.inlineEditModeChanged) {
            if (action.mode) {
                HotKeyListener.suspend();
            }
            else {
                HotKeyListener.resume();
            }
        }
    }

    onCancel() {
        app.actionManager.invoke("cancel");
    }

    getChildContext() {
        return {workspace:this.workspace};
    }

    _buildContextMenu(event) {
        var menu = { items: [] };
        var context = {
            selectComposite: Selection.selectComposite(),
            eventData: Environment.controller.createEventData(event)
        };
        app.onBuildMenu.raise(context, menu, this._renderLoop.view);

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
        app.actionManager.attach(this._renderLoop.view, this._renderLoop.controller);
        Toolbox.attach(this._renderLoop.view, this._renderLoop.controller);
        this.workspace.view = this._renderLoop.view;
        this.workspace.controller = this._renderLoop.controller;

        cancellationStack.push(this);
        HotKeyListener.attach(Environment);

        dispatch({ type: "Carbon_ScaleChanged", scale:this._renderLoop.view.scale(), async:true });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        HotKeyListener.detach();

        this._renderLoop.unmount();
        app.actionManager.detach();

        this._imageDrop.destroy();
        this.refs.contextMenu.unbind(this._renderLoop.viewContainer);
        this.refs.animationSettings.detach();
        Toolbox.detach();

        this.workspace.view = null;
        this.workspace.controller = null;

        cancellationStack.pop();
    }

    render() {
        var status_text = 'saved2';
        return (
            <WorkspaceStyled>
                <Tools key="tools" />
                <Viewport id="viewport" innerRef={x => { this.viewport = x }} key="viewport">
                    {/* canvases and view container will be inserted here */}

                    {/* <div id="workspace-top-edge" className="rulers">
                        <WindowControls key="windowcontrols" />
                        <ContextBar key="contextBar" />
                    </div> */}

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
