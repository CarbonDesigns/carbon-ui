import React from 'react';
import {
    app,
    MirroringController,
    Context,
    Layer,
    Page,
    MirroringView,
    IView,
    IDisposable,
    IMirroringProxyPage,
    ContextType
} from "carbon-core";

import {listenTo, Component, ComponentWithImmutableState, dispatch, IComponentImmutableState} from "../CarbonFlux";
import cx from "classnames";

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

interface IMirroringWorkspaceProps {
    userId:string;
}

interface IMirroringWorkspaceState extends IComponentImmutableState {

}

export default class MirroringWorkspace extends ComponentWithImmutableState<IMirroringWorkspaceProps, IMirroringWorkspaceState> {
    private _renderingRequestId:number;
    private view:IView;
    private canvas:HTMLCanvasElement;
    private _renderingCallback:any;
    private _renderingCallbackContinuous:any;
    private contextScale:number;
    private _attached:boolean;
    private _screenWidth:number;
    private _screenHeight:number;
    private _oldViewportSize: any;
    private _scale:number;
    private _navigateToPageToken:IDisposable;
    private _displayClickSpotsToken:IDisposable;


    previewProxy:any;


    refs:{
        canvas:HTMLCanvasElement;
        viewport:HTMLElement;
        device: HTMLElement;
    }

    constructor(props) {
        super(props);
        this.state = {data:null};
        this._renderingRequestId = 0;
    }

    _updateActivePage(nextPage, animation) {
        this._setPage(nextPage);
        this.ensureCanvasSize();
        nextPage.invalidate();
        this.view.draw();
    }

    draw() {
        this.ensureCanvasSize();
        app.relayout();
        this.view.draw();
    }

    onresize=()=>{
        if(this.view) {
            (this.view.page as IMirroringProxyPage).resetVersion();
            this.view.invalidate();
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.canvas = this.refs.canvas;

        this.context = new Context(ContextType.Content, this.canvas);

        this._renderingCallback = function () {
            doRendering.call(this, false);
        }.bind(this);
        this._renderingCallbackContinuous = function () {
            doRendering.call(this, true);
        }.bind(this);


        this._recalculateContextScale();

        this.attachToView();
        window.addEventListener("resize", this.onresize);

        document.body.classList.add("fullscreen");
    }

    _recalculateContextScale() {
        // on some machines it is non integer, it affects rendering
        // browser zoom is also changing this value, so need to make sure it is never 0
        this.contextScale = this.context.contextScale;
        if(this.view) {
            this.view.contextScale = this.contextScale;
        }
    }

    ensureCanvasSize() {
        if (!this._attached || !this.refs.viewport) {
            return;
        }

        this._recalculateContextScale();

        var viewport = this.refs.viewport;

        var size = {
            width: viewport.clientWidth,
            height: viewport.clientHeight
        };

        //this.view.viewportSize = size;

        var scale = this.view.scale();
        var resized = false;

        var canvasWidth = this._screenWidth = size.width ;
        var canvasHeight = this._screenHeight = size.height ;

        var needResize = false;
        if (!this._oldViewportSize || this._oldViewportSize.width !== size.width || this._oldViewportSize.height != size.height) {
            needResize = true;
        }

        var canvas = this.canvas;
        var device = this.refs.device;
        if (needResize || canvas.width !== (0 | (canvasWidth * this.contextScale))) {
            canvas.width = canvasWidth * this.contextScale;
            device.style.width = canvas.style.width = canvasWidth + "px";
            device.style.left = '0';
            resized = true;
        }
        if (needResize || canvas.height !== (0 | (canvasHeight * this.contextScale))) {
            canvas.height = canvasHeight * this.contextScale;
            device.style.height = canvas.style.height = canvasHeight + "px";
            device.style.top = '0';
            resized = true;
        }

        this._scale = scale;

        if (resized) {
            this.view.invalidate();
        }

        this._oldViewportSize = size;
    }

    attachToView() {
        if (this.context && !this._attached) {
            var view = new MirroringView(app);
            var controller = new MirroringController(app, view, this.props.userId);
            app.environment.set(view, controller);

            view.setup({Layer: Page});
            view.viewContainerElement = this.refs.viewport;

            // if(app.activePage === NullPage){
            //     var pageChangedToken = app.pageChanged.bind(()=>{
            //         this._initialize(view, previewProxy, controller);
            //         pageChangedToken.dispose();
            //     })
            // } else {
            //     this._initialize(view, previewProxy, controller);
            // }
            this._initialize(view);
        }
    }

    _initialize(view) {
        app.platform.detachEvents();
        app.platform.attachEvents(this.refs.viewport);
        this.view = view;
        view.setupRendering([this.context], redrawCallback.bind(this), cancelRedrawCallback.bind(this), renderingScheduledCallback.bind(this));


        // var page = previewProxy.getCurrentScreen({
        //     width: this.state.data.deviceWidth || this.refs.viewport.clientWidth,
        //     height: this.state.data.deviceHeight || this.refs.viewport.clientHeight
        // });
        //
        // this._updateActivePage(page);

        this._attached = true;
        this.ensureCanvasSize();
    }


    componentWillUnmount() {
        super.componentWillUnmount();
        this._attached = false;
        if (this._navigateToPageToken) {
            this._navigateToPageToken.dispose();
            this._navigateToPageToken = null;
        }
        if (this._displayClickSpotsToken) {
            this._displayClickSpotsToken.dispose();
            this._displayClickSpotsToken = null;
        }

        window.removeEventListener("resize", this.onresize);
        document.body.classList.remove("fullscreen");
    }

    _setPage(page) {
        this.previewProxy.page = page;
        this.view.setActivePage(page);
    }

    render() {
        return (
            <div id="mobileViewContainer" ref="viewport" key="viewport" name="viewport">
                <div className="preview__device" ref="device">
                    <canvas ref="canvas"
                            style={{
                                position: 'absolute'
                            }}/>

                </div>
            </div>
        );
    }
}