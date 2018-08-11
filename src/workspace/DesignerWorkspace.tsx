import Breadcrumbs from './bottomBar/breadcrumbs';
import HotKeyListener from "../HotkeyListener";

import * as React from "react";
import * as PropTypes from "prop-types";

import { app, Selection, RenderLoop, SystemExtensions, IDisposable, AutoDisposable, IsolationContext } from "carbon-core";
import ContextMenu from "../shared/ContextMenu";

import ImageDrop from "./ImageDrop";

import { richApp } from "../RichApp";
import { listenTo, ComponentWithImmutableState, handles, dispatch, dispatchAction, CarbonLabel } from "../CarbonFlux";
import { Record } from "immutable";
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
    activeMode: null,
    prototypeMode: null,
    isolationActive:false
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

const ExitIsolationbutton = styled.div`
    position:absolute;
    top: 20px;
    left:80px;
    height:25px;
    line-height: 25px;
    min-width:30px;
    cursor:pointer;
    margin:0;
    color: ${theme.text_color};
    background-image: linear-gradient(to right, #ff4295 0%, #ff292c 100%);
    border-radius: 1px;
    border: 0;
    padding:0 ${theme.margin2};
    outline: 0;
`;


class DesignerWorkspace extends ComponentWithImmutableState<any, any> implements ICancellationHandler {
    private _renderLoop = new RenderLoop();
    private _imageDrop;
    private _unloadSubscriptionToken: IDisposable;
    private systemExtensions: SystemExtensions = new SystemExtensions();
    private dispatchDisposables = new AutoDisposable();

    static childContextTypes = {
        workspace: PropTypes.object
    }

    refs: {
        contextMenu: any;
        animationSettings: any;
    };

    private viewport: HTMLElement;
    private workspace = { view: null, controller: null };

    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                activeMode: appStore.state.activeMode,
                prototypeMode: appStore.state.prototypeMode,
                isolationActive: IsolationContext.isActive
            })
        };
    }

    @listenTo(richApp.workspaceStore, appStore)
    onChange() {
        if (!this.mounted) {
            return;
        }

        if (app.isLoaded && this._imageDrop && !this._imageDrop.active() && this._renderLoop.isAttached()) {
            this._imageDrop.setup(this._renderLoop.viewContainer);
        }
        this.mergeStateData({
            isolationActive: IsolationContext.isActive
        });
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

        dispatch({ type: "Carbon_ScaleChanged", scale: view.scale(), async: true });
        dispatch(CarbonActions.toolChanged(controller.currentTool));
        app.actionManager.invoke("restoreWorkspaceState");
        this.initExtensions();

        // must be attached the last, after all extensions initialized
        app.onLoad(() => {
            HotKeyListener.attach(view, controller);
        });
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

    exitisolation=()=> {
        this.mergeStateData({
            isolationActive: false
        });
        app.actionManager.invoke("exitisolation");
    }

    render() {
        return (
            <WorkspaceStyled>
                <Tools key="tools" />
                <Viewport id="viewport" innerRef={x => { this.viewport = x }} key="viewport">
                    {/* canvases and view container will be inserted here */}

                    {/* <div id="workspace-top-edge" className="rulers">
                        <WindowControls key="windowcontrols" />
                        <ContextBar key="contextBar" />
                    </div> */}

                    <BottomBar>
                        {/* <PagesBar key="boards" /> */}
                        <Breadcrumbs key="breadcrumbs" />
                    </BottomBar>

                    <ContextMenu ref="contextMenu" onBuildMenu={this._buildContextMenu.bind(this)} />
                    <AnimationSettings ref="animationSettings" />
                </Viewport>
                {this.state.data.isolationActive && <ExitIsolationbutton onClick={this.exitisolation}><CarbonLabel id="@action.exitisolation"/></ExitIsolationbutton>}
            </WorkspaceStyled>);
    }
}

export default class DesignerWorkspaceWithCode extends ComponentWithImmutableState<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                activeMode: appStore.state.activeMode,
                prototypeMode: appStore.state.prototypeMode
            })
        };
    }


    @listenTo(appStore)
    onChange() {
        this.mergeStateData({
            activeMode: appStore.state.activeMode,
            prototypeMode: appStore.state.prototypeMode
        });
    }

    render() {
        if (this.state.data.activeMode === "prototype" && this.state.data.prototypeMode === "code") {
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

const BottomBar = styled.div`
    height: 28px;
    display:flex;
    background:${theme.panel_background};
    border-radius:2px;
    position:absolute;
    user-select: none;
    bottom : 0;
    left   : 0;
    right  : 0;
    z-index: 2;
`;
