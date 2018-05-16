//require("./__workspace.less");
import WindowControls from './topBar/windowControls';
import ContextBar from './topBar/contextbar';
// import Tools          from './topBar/tools';
import Breadcrumbs from './bottomBar/breadcrumbs';
import PagesBar from './bottomBar/pagesbar';
import HotKeyListener from "../HotkeyListener";

import * as React from "react";
import * as PropTypes from "prop-types";

import { app, Selection, Workspace, RenderLoop, SystemExtensions, IDisposable, AutoDisposable } from "carbon-core";
import ContextMenu from "../shared/ContextMenu";

import ImageDrop from "./ImageDrop";

import { richApp } from "../RichApp";
import { listenTo, Component, ComponentWithImmutableState, handles, dispatch, dispatchAction } from "../CarbonFlux";
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
import { MonacoEditor } from '../editor/MonacoEditor';

require("./IdleDialog");

const State = Record({
    activeMode: null
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


class DesignerWorkspace extends ComponentWithImmutableState<any, any> implements ICancellationHandler {
    private _renderLoop = new RenderLoop();
    private _imageDrop;
    private _unloadSubscriptionToken: IDisposable;
    private systemExtensions: SystemExtensions = new SystemExtensions();
    private dispatchDisposables = new AutoDisposable();
    private mounted = false;

    static childContextTypes = {
        workspace: PropTypes.object
    }

    refs: {
        contextMenu: any;
        animationSettings: any;
    };

    private viewport: HTMLElement;
    private workspace = { view: null, controller: null };


    @listenTo(richApp.workspaceStore, appStore)
    onChange() {
        if (!this.mounted) {
            return;
        }

        if (app.isLoaded && this._imageDrop && !this._imageDrop.active() && this._renderLoop.isAttached()) {
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
        return { workspace: this.workspace };
    }

    _buildContextMenu(event) {
        var menu = { items: [] };
        var context = {
            selectComposite: Selection.selectComposite(),
            eventData: this._renderLoop.controller.createEventData(event)
        };
        app.onBuildMenu.raise(context, menu, this._renderLoop.view);

        return Promise.resolve(menu);
    }

    initExtensions() {
        let view = this._renderLoop.view;
        let controller = this._renderLoop.controller;

        app.onLoad(() => {
            this.systemExtensions.initExtensions(app, view, controller);

            this._unloadSubscriptionToken = app.onUnload(() => {
                this.systemExtensions.detachExtensions();
                this.initExtensions();
            })
        }, true)
    }

    componentDidMount() {
        super.componentDidMount();
        this.mounted = true;

        // at this point view and controller will be created
        this._renderLoop.mountDesignerView(app, this.viewport);
        let view = this._renderLoop.view;
        let controller = this._renderLoop.controller;
        this.workspace.view = view;
        this.workspace.controller = controller;
        this.registerDispatchEvents(view, controller);

        this._imageDrop = new ImageDrop(controller);

        if (app.isLoaded && !this._imageDrop.active()) {
            this._imageDrop.setup(this._renderLoop.viewContainer);
        }

        this.refs.contextMenu.bind(this._renderLoop.viewContainer);
        this.refs.animationSettings.attach();

        app.actionManager.attach(view, controller);
        Toolbox.attach(view, controller);

        cancellationStack.push(this);
        HotKeyListener.attach(view, controller);

        dispatch({ type: "Carbon_ScaleChanged", scale: view.scale(), async: true });
        dispatch(CarbonActions.toolChanged(controller.currentTool));
        app.actionManager.invoke("restoreWorkspaceState");
        this.initExtensions();
    }

    registerDispatchEvents(view, controller) {
        if (controller.inlineEditModeChanged) {
            let token = controller.inlineEditModeChanged.bindAsync(mode => dispatch(CarbonActions.inlineEditModeChanged(mode)));
            this.dispatchDisposables.add(token);
        }

        if (view.activeLayerChanged) {
            let token = view.activeLayerChanged.bindAsync(layer => dispatch(CarbonActions.activeLayerChanged(layer)));
            this.dispatchDisposables.add(token);
        }

        let token = controller.onArtboardChanged.bindAsync((newArtboard, oldArtboard) =>
            dispatch(CarbonActions.activeArtboardChanged(oldArtboard, newArtboard)));
        this.dispatchDisposables.add(token);

        if (controller.currentToolChanged) {
            token = controller.currentToolChanged.bindAsync((tool) => {
                dispatch(CarbonActions.toolChanged(tool));
            });
            this.dispatchDisposables.add(token);
        }

        if (view.scaleChanged) {
            let token = view.scaleChanged.bindAsync(scale => dispatchAction({ type: "Carbon_ScaleChanged", scale }));
            this.dispatchDisposables.add(token);
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.mounted = false;

        Selection.makeSelection([]);

        this.dispatchDisposables.dispose();

        if (this._unloadSubscriptionToken) {
            this._unloadSubscriptionToken.dispose();
            this._unloadSubscriptionToken = null;
        }

        this.systemExtensions.detachExtensions();

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

export default class DesignerWorkspaceWithCode extends ComponentWithImmutableState<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                activeMode: appStore.state.activeMode
            })
        };
    }


    @listenTo(appStore)
    onChange() {
        this.mergeStateData({
            activeMode: appStore.state.activeMode
        });
    }

    render() {
        if (this.state.data.activeMode === "prototype") {
            return (
                <MonacoContainer>
                    <MonacoEditor value="test" language="ts" onChange={() => { }} />
                </MonacoContainer>
            )
        }

        return <DesignerWorkspace />
    }
}

const MonacoContainer = styled(WorkspaceStyled)`
    display:flex;
    width:100%;
    height:100%;
    flex: auto;
`;
