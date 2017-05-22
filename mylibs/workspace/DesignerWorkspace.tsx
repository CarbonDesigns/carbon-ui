//require("./__workspace.less");
import WindowControls from './topBar/windowControls';
import ContextBar     from './topBar/contextbar';
import Tools          from './topBar/tools';
import Breadcrumbs    from './bottomBar/breadcrumbs';
import PagesBar       from './bottomBar/pagesbar';

import React from 'react';
import ZoomBar from './bottomBar/zoomBar';

import {app, Layer, NullPage, DesignerView, DesignerController, Context, Selection, Environment, SelectComposite, DraggingElement, SelectFrame, Keyboard} from "carbon-core";
import ContextMenu from "../shared/ContextMenu";

import ImageDrop from "./ImageDrop";

import {richApp} from "../RichApp";
import {listenTo, Component, ComponentWithImmutableState} from "../CarbonFlux";
import {Clipboard, ViewTool} from "carbon-core";
import {Record} from "immutable";
import cx from 'classnames';
import AnimationSettings from "../animation/AnimationSetting";

import {AltContext}    from './topBar/contextbar';

require("./IdleDialog");

var doRendering = function (continuous) {
    this._renderingRequestId = 0;

    if (continuous) {
        this._renderingRequestId = requestAnimationFrame(this._renderingCallbackContinuous);
    }
    this.draw();
};
function redrawCallback(continuous) {
    if (continuous && !this._renderingRequestContinuous) {
        cancelRedrawCallback.call(this);
    }
    if (!this._renderingRequestId) {
        this._renderingRequestId = requestAnimationFrame(continuous ? this._renderingCallbackContinuous : this._renderingCallback);
    }
    this._renderingRequestContinuous = continuous;
}
function cancelRedrawCallback() {
    if (this._renderingRequestId) {
        cancelAnimationFrame(this._renderingRequestId);
        this._renderingRequestId = 0;
    }
}

function renderingScheduledCallback() {
    return this._renderingRequestId !== 0;
}


const State = Record({
    activeTool: null,
    attached: false
})


class Workspace extends ComponentWithImmutableState<any, any> {
    [name: string]: any;


    refs:{
        contextMenu:any;
        animationSettings:any;
        view:HTMLElement;
        canvas:HTMLCanvasElement;
        viewport:HTMLElement;
        upperCanvas:HTMLCanvasElement;
        gridCanvas: HTMLCanvasElement;
        htmlPanel:HTMLElement;
        isolationCanvas: HTMLCanvasElement;
        htmlLayer: HTMLElement;
    };

    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                activeTool: richApp.appStore.state.activeTool
            })
        };

        this._imageDrop = new ImageDrop();
        this._renderingRequestId = 0;
    }

    @listenTo(richApp.workspaceStore, richApp.appStore)
    onChange() {
        this.mergeStateData({activeTool:richApp.appStore.state.activeTool});
        this.attachToView();

        if (app.isLoaded && !this._imageDrop.active() && this._attached){
            this._imageDrop.setup(this.viewContainer);
        }
    }

    draw() {
        if (app.isLoaded && this.view && this.view.page != null && this.view.page !== NullPage) {
            this.ensureCanvasSize();
            app.relayout();
            this.view.draw();
        }
    }

    _buildContextMenu(event) {
        var menu = {items: []};
        var context = {
            selectComposite: Selection.selectComposite(),
            eventData: Environment.controller.createEventData(event)
        };
        app.onBuildMenu.raise(context, menu);

        return Promise.resolve(menu);
    }

    onViewContainerScroll(e) {
        if (this._scale !== this.view.scale() || e.target !== this.refs.view) {
            return;
        }
        var cw = this.htmlLayer.clientWidth;
        var ch = this.htmlLayer.clientHeight;
        var viewportWidth = this.viewport.clientWidth;
        var viewportHeight = this.viewport.clientHeight;
        var view = this.view;

        if (viewportWidth != (0 | (cw * 1.5)) || viewportHeight != (0 | (ch * 1.5))) {
            return;
        }

        var width = cw / 2;
        var height = ch / 2;
        if (this.htmlLayerWidth === cw && this.htmlLayerHeight === ch) {

            var dx = e.target.scrollLeft - width;
            var dy = e.target.scrollTop - height;

            view.scrollY(view.scrollY() + dy, true);
            view.scrollX(view.scrollX() + dx, true);
        }
        var nw = e.target.scrollLeft = width;
        var nh = e.target.scrollTop = height;

        if (nw === width && nh === height) {
            this.htmlLayerWidth = cw;
            this.htmlLayerHeight = ch;
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.viewContainer = this.refs.view;
        this.viewport      = this.refs.viewport;
        this.upperCanvas   = this.refs.upperCanvas;
        this.gridCanvas  = this.refs.gridCanvas;
        this.htmlPanel     = this.refs.htmlPanel;
        this.isolationCanvas = this.refs.isolationCanvas;
        this.htmlLayer     = this.refs.htmlLayer;
        this._attached = false;

        this.htmlLayer.style.width = '150%';
        this.htmlLayer.style.height = '150%';

        this.context = new Context(this.refs.canvas);
        this.upperContext = new Context(this.upperCanvas);
        this.gridContext = new Context(this.gridCanvas);
        this.isolationContext = new Context(this.isolationCanvas);

        if (app.isLoaded && !this._imageDrop.active()){
            this._imageDrop.setup(this.viewContainer);
        }

        this._renderingCallback = function () {
            doRendering.call(this, false);
        }.bind(this);
        this._renderingCallbackContinuous = function () {
            doRendering.call(this, true);
        }.bind(this);


        this.attachToView();

        // need to do it after next browser relayout
        setTimeout(()=> {
            this.htmlLayerWidth           = this.htmlLayer.clientWidth;
            this.htmlLayerHeight          = this.htmlLayer.clientHeight;
            this.viewContainer.scrollLeft = this.htmlLayerWidth / 2;
            this.viewContainer.scrollTop  = this.htmlLayerHeight / 2;
        }, 0);

        this.refs.contextMenu.bind(this.refs.view);
        this.refs.animationSettings.attach();
    }


    attachToView() {
        if (this.context && !this._attached && this.viewContainer) {
            var view = this.view = new DesignerView(app);

            this.ensureCanvasSize();
            app.platform.detachEvents();
            app.platform.attachEvents(this.viewContainer);
            Keyboard.attach(document.body);
            view.attachToDOM(this.context, this.upperContext, this.isolationContext, this.viewContainer, redrawCallback.bind(this), cancelRedrawCallback.bind(this), renderingScheduledCallback.bind(this));
            this.view.setup({Layer, SelectComposite, DraggingElement, SelectFrame});
            this.view.setActivePage(app.activePage);

            view.gridContext = this.gridContext;
            var controller = new DesignerController(app, view, {SelectComposite, DraggingElement, SelectFrame});
            Environment.set(view, controller);
            Clipboard.attach(app);
            this._attached = true;

            view.contextScale = this.contextScale;
        }
    }

    componentWillUnmount() {
        if (!this._attached) {
            return;
        }
        super.componentWillUnmount();
        this._imageDrop.destroy();
        this._attached = false;
        if(this.view) {
            this.view.detach();
        }
        app.platform.detachEvents();
        Keyboard.detach(this.viewContainer);
        this.refs.contextMenu.unbind(this.refs.view);
        this.refs.animationSettings.detach();
        Clipboard.dispose();
    }

    _recalculateContextScale() {
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio =
            this.context.backingStorePixelRatio ||
            this.context.webkitBackingStorePixelRatio ||
            this.context.mozBackingStorePixelRatio ||
            this.context.msBackingStorePixelRatio ||
            this.context.oBackingStorePixelRatio ||
            1;

        // on some machines it is non integer, it affects rendering
        // browser zoom is also changing this value, so need to make sure it is never 0
        this.contextScale = Math.max(1, Math.round(devicePixelRatio / backingStoreRatio));
    }

    ensureCanvasSize() {
        var canvas = this.refs.canvas;
        if (!this.view || !canvas || !this._attached) {
            return;
        }
        var view = this.view;
        var viewport = this.viewport;

        this._recalculateContextScale();
        view.contextScale = this.contextScale;

        var scale = view.scale()
            , viewWidth = viewport.clientWidth
            , viewHeight = viewport.clientHeight
            , resized = false;

        if (canvas.width !== (0 | (viewWidth * this.contextScale))) {
            canvas.width = viewWidth * this.contextScale;
            canvas.style.width = viewWidth + "px";
            this.upperCanvas.width = viewWidth * this.contextScale;
            this.upperCanvas.style.width = viewWidth + "px";
            this.gridCanvas.width = viewWidth * this.contextScale;
            this.gridCanvas.style.width = viewWidth + "px";
            this.isolationCanvas.width = viewWidth * this.contextScale;
            this.isolationCanvas.style.width = viewWidth + "px";
            resized = true;
        }
        if (canvas.height !== (0 | (viewHeight * this.contextScale))) {
            canvas.height = viewHeight * this.contextScale;
            canvas.style.height = viewHeight + "px";
            this.upperCanvas.height = viewHeight * this.contextScale;
            this.upperCanvas.style.height = viewHeight + "px";
            this.gridCanvas.height = viewHeight * this.contextScale;
            this.gridCanvas.style.height = viewHeight + "px";
            this.isolationCanvas.height = viewHeight * this.contextScale;
            this.isolationCanvas.style.height = viewHeight + "px";
            resized = true;
        }

        this._scale = scale;

        if (resized) {
            if (viewWidth && viewHeight) {
                view.viewportSizeChanged({width: viewWidth, height: viewHeight});
            }

            view.invalidate();
        }
    }

    render() {
        var status_text = 'saved2';
        return (
            <div id="viewport" ref="viewport" key="viewport" name="viewport" className={cx({'viewport_artboard-mode':this.state.data.activeTool === ViewTool.Artboard})}>
                <canvas id="app_canvas"      ref="canvas"       style={{position:'absolute',top:0,left:0}}/>
                <canvas id="grid_canvas"   ref="gridCanvas" style={{position:'absolute',top:0,left:0}}/>
                <canvas id="isolation_canvas"   ref="isolationCanvas" style={{position:'absolute',top:0,left:0}}/>
                <canvas id="app_upperCanvas" ref="upperCanvas"  style={{position:'absolute',top:0,left:0}}/>

                <div id="viewContainer" ref="view" onScroll={this.onViewContainerScroll.bind(this)} tabIndex={1}>
                    <div id="htmlLayer" ref="htmlLayer"
                         style={{position:'absolute',top:0,left:0,pointerEvents: 'none'}}></div>
                    <div id="htmlPanel" ref="htmlPanel" style={{position:'absolute',top:0,left:0,pointerEvents: 'none'}}
                         tabIndex={1}></div>
                </div>

                <div id="workspace-top-edge" className="rulers">
                    <Tools key="tools"/>
                    <WindowControls key="windowcontrols"/>
                    <ContextBar key="contextBar"/>
                    {/*<AltContext key="altContext"/>*/}
                </div>

                <div id="workspace-bottom-edge">
                    <PagesBar key="boards"/>
                    <Breadcrumbs key="breadcrumbs"/>
                    <ZoomBar/>
                </div>

                <ContextMenu ref="contextMenu" onBuildMenu={this._buildContextMenu.bind(this)}/>
                <AnimationSettings ref="animationSettings"/>
            </div>);
    }

}

export default Workspace;
