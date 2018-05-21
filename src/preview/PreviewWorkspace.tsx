import * as React from "react";
import {
    app,
    PreviewController,
    Page,
    NullPage,
    PreviewView,
    PreviewModel,
    Context,
    Workspace,
    Layer,
    Circle,
    Brush,
    Invalidate,
    ContextType,
    ContextLayerSource,
    PreviewDisplayMode,
    ISize,
    Matrix,
    IView,
    AutoDisposable,
    IDisposable,
    IPlatformSpecificHandler,
    createPlatformHandler
} from "carbon-core";
import {
    AnimationType,
    EasingType
} from "carbon-runtime";

import { listenTo, Component, ComponentWithImmutableState, dispatch, handles } from "../CarbonFlux";
import PreviewStore from "./PreviewStore";
import PreviewActions from './PreviewActions';
import * as cx from "classnames";
import EditorActions from "../editor/EditorActions";
import { TouchEmulator } from './TouchEmulator';
import styled from "styled-components";
import theme from "../theme";
import CarbonActions from "../CarbonActions";

// TODO:

// - default story (flow) = all artboards
// - implement stack of preview actions to go back (implement go back action)
// - test state switch in preview (make hardcoded action to test)
// - implement separate page which can load only preview (test on iPad)
// - user keyboard to navigate back/force in preview


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

function fitRectToRect(outer, inner) {
    var scale = outer.width / inner.width;

    var newHeight = inner.height * scale;
    if (newHeight > outer.height) {
        scale = outer.height / inner.height;
    }

    return scale;
}

function fillRectInRect(outer, inner) {
    var scale = outer.width / inner.width;

    var newHeight = inner.height * scale;
    if (newHeight < outer.height) {
        scale = outer.height / inner.height;
    }

    return scale;
}

const ViewportMargin = 40;

const Viewport = styled.div`
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    background-color: ${theme.workspace_background};
    overflow: auto;
    user-select: none;
`;

export default class PreviewWorkspace extends ComponentWithImmutableState<any, any> {
    private previewModel: any;
    private _renderingRequestId: number;
    private view: IView;
    private _attached: boolean;
    private _oldViewportSize: ISize;
    private canvas: any;
    private contextScale: number;
    private _lastDrawnPage: any;
    private _renderingCallback: () => void;
    private _renderingCallbackContinuous: () => void;
    private viewport: HTMLDivElement;
    private device: HTMLDivElement;
    private detachDisposables = new AutoDisposable();
    private _onStateChangedBinding: IDisposable;

    refs: {
        canvas: HTMLCanvasElement;
    }

    private touchEmulator = new TouchEmulator();

    constructor(props) {
        super(props);
        this.state = { data: PreviewStore.state, emulateTouch: true };
        this._renderingRequestId = 0;
    }

    _onInvalidateRequested = () => {
        this.draw();
    }

    @handles(EditorActions.restart)
    restart() {
        if (this.previewModel) {
            this.previewModel.restart();
        }
    }

    @listenTo(PreviewStore)
    onChange() {
        var data = this.state.data;
        var newData = PreviewStore.state;

        if (!this._attached || !this.viewport) {
            return;
        }

        var page = newData.activePage;
        if (!page) {
            if (newData.displayMode !== this.state.data.displayMode) {
                this.restart();
            }
            return;
        }

        if (data.displayMode !== newData.displayMode) {
            this.ensureCanvasSize();
        }
    }


    // _renderFrameIfAvailiable() {
    //     var artboard = this._getCurrentArtboard();
    //     if (!artboard) {
    //         return;
    //     }
    //     var frame = artboard.frame;
    //     if (!frame) {
    //         return;
    //     }
    //     var env = this.view._getEnv(this.previewModel.activePage, 1, true);
    //     frame.draw(this.frameContext, env);
    // }

    // onDisplayClickSpots() {
    //     var inactiveCanvas = this.inactiveCanvas;
    //     inactiveCanvas.style.display = 'none';
    //     inactiveCanvas.style.left = 0;
    //     inactiveCanvas.style.top = 0;
    //     inactiveCanvas.style.width = this.activeCanvas.style.width;
    //     inactiveCanvas.style.height = this.activeCanvas.style.height;
    //     inactiveCanvas.width = this.activeCanvas.width;
    //     inactiveCanvas.height = this.activeCanvas.height;
    //     inactiveCanvas.style.zIndex = 2;
    //     inactiveCanvas.offsetHeight; // no need to store this anywhere, the reference is enough
    //     inactiveCanvas.style.display = '';

    //     var interactionLayer = new Layer(this);
    //     interactionLayer.hitTransparent(true);
    //     interactionLayer.context = this.inactiveContext;
    //     var view = this.view;

    //     view._registerLayer(interactionLayer);

    //     var elements = this.previewModel.allElementsWithActions();
    //     var promises = [];
    //     for (var e of elements) {
    //         var rect = e.getBoundaryRectGlobal();
    //         promises.push(this._addClickSpot(interactionLayer, rect.x + rect.width / 2 | 0, rect.y + rect.height / 2 | 0));
    //     }
    //     Promise.all(promises).then(() => {
    //         view._unregisterLayer(interactionLayer);
    //         inactiveCanvas.style.zIndex = 0;
    //     });
    // }

    // _addClickSpot(layer, x, y) {
    //     var circle = new Circle();
    //     circle.setProps({
    //         width: 100,
    //         height: 100,
    //         stroke: Brush.Empty,
    //         fill: Brush.createFromCssColor("rgba(100,120,230,0.3)")
    //     });
    //     circle.setTransform(Matrix.createTranslationMatrix(x - 50, y - 50));
    //     layer.add(circle);
    //     return circle.animate({ width: 10, height: 10 }, {duration:450}, () => {
    //         circle.setTransform(Matrix.createTranslationMatrix(x - circle.width / 2, y - circle.height / 2));
    //         layer && layer.invalidate();
    //     }).then(() => {
    //         circle.parent.remove(circle);
    //         layer && layer.invalidate();
    //     });
    // }

    draw() {
        if (this.previewModel) {
            let viewport = this.viewport;
            if (!viewport) {
                return;
            }
            let viewportSize = {
                width: viewport.clientWidth - ViewportMargin,
                height: viewport.clientHeight - ViewportMargin
            };
            if (!this._oldViewportSize
                || (viewportSize.height !== this._oldViewportSize.height)
                || (viewportSize.width !== this._oldViewportSize.width)
                || this._lastDrawnPage !== this.previewModel.activePage) {
                this.ensureCanvasSize(viewportSize);
                this._lastDrawnPage = this.previewModel.activePage;
            }
            this.view.draw();
        }
    }

    onresize = () => {
        this.view && this.view.invalidate();
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

        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio =
            this.context.backingStorePixelRatio ||
            this.context.webkitBackingStorePixelRatio ||
            this.context.mozBackingStorePixelRatio ||
            this.context.msBackingStorePixelRatio ||
            this.context.oBackingStorePixelRatio ||
            1;

        // on some machines it is non integer, it affects rendering
        this.contextScale = Math.max(1, Math.round(devicePixelRatio / backingStoreRatio));

        this.attachToView();
        window.addEventListener("resize", this.onresize);
        if (this.state.emulateTouch) {
            this.touchEmulator.enable(this.viewport, true);
        }

        document.body.classList.add("fullscreen");
        document.body.classList.add("preview");

        this.detachDisposables.add(Invalidate.requested.bind(this, this._onInvalidateRequested));
    }


    onStateChanged(stateId) {
        dispatch(EditorActions.changeState(stateId));
    }

    _getCurrentArtboard() {
        var frame;
        var page = this.previewModel.activePage;

        if (!page) {
            return null;
        }

        return page.children[0];
    }

    _findDeviceSize(viewportSize: ISize, artboardSize: ISize, previewDisplayMode: PreviewDisplayMode): ISize {
        switch (previewDisplayMode) {
            case PreviewDisplayMode.Responsive:
                return viewportSize;
            case PreviewDisplayMode.Fill:
                return viewportSize;
            case PreviewDisplayMode.Fit:
                {
                    let scale = Math.min(1, fitRectToRect(viewportSize, artboardSize));
                    return { width: artboardSize.width * scale, height: artboardSize.height * scale };
                }
            case PreviewDisplayMode.OriginalSize:
                return { width: Math.min(viewportSize.width, artboardSize.width), height: Math.min(viewportSize.height, artboardSize.height) };
        }

        assertNever(previewDisplayMode);
    }

    _findDeviceScale(deviceSize: ISize, artboardSize: ISize, previewDisplayMode: PreviewDisplayMode): number {
        switch (previewDisplayMode) {
            case PreviewDisplayMode.Responsive:
                return 1;
            case PreviewDisplayMode.Fill:
                return fillRectInRect(deviceSize, artboardSize);
            case PreviewDisplayMode.Fit:
                return Math.min(1, fitRectToRect(deviceSize, artboardSize))
            case PreviewDisplayMode.OriginalSize:
                return 1;
        }

        assertNever(previewDisplayMode);
    }

    ensureCanvasSize(viewportSize?) {
        if (!this._attached || !this.viewport) {
            return;
        }

        let previewDisplayMode = PreviewStore.state.displayMode;

        let viewport = this.viewport;

        viewportSize = viewportSize || {
            width: viewport.clientWidth - ViewportMargin,
            height: viewport.clientHeight - ViewportMargin
        };

        let artboard = this._getCurrentArtboard();
        if (!artboard) { // TODO: check what we should do in this case
            return;
        }

        let artboardSize = this.previewModel.activePage.originalSize;

        let deviceSize = this._findDeviceSize(viewportSize, artboardSize, previewDisplayMode);
        let deviceScale = this._findDeviceScale(deviceSize, artboardSize, previewDisplayMode);
        let margin = ViewportMargin;

        let scale = this.view.scale(deviceScale);
        this.view.updateViewportSize(deviceSize);

        let resized = false;

        var canvasWidth = deviceSize.width;
        var canvasHeight = deviceSize.height;

        var needResize = false;
        if (!this._oldViewportSize || this._oldViewportSize.width !== viewportSize.width || this._oldViewportSize.height !== viewportSize.height) {
            needResize = true;
        }

        var canvas = this.canvas;
        var device = this.device;
        if (needResize || canvas.width !== (0 | (canvasWidth * this.contextScale))) {
            canvas.width = canvasWidth * this.contextScale;
            canvas.style.width = canvasWidth + "px";
            resized = true;
        }

        if (needResize || canvas.height !== (0 | (canvasHeight * this.contextScale))) {
            canvas.height = canvasHeight * this.contextScale;
            canvas.style.height = canvasHeight + "px";
            resized = true;
        }

        device.style.width = canvasWidth + "px";
        device.style.left = (margin / 2 + (viewportSize.width - canvasWidth) / 2 | 0) + "px";
        device.style.height = canvasHeight + "px";
        device.style.top = (margin / 2 + (viewportSize.height - canvasHeight) / 2 | 0) + "px";

        this.previewModel.resizeActiveScreen(deviceSize, scale, previewDisplayMode);

        if (resized) {
            this.view.invalidate();
        }

        this._oldViewportSize = viewportSize;
    }

    attachToView() {
        if (this.context && !this._attached) {
            var view = new PreviewView(app);
            view.setActivePage(app.activePage);
            view.setup({ Layer: Page });
            view.viewContainerElement = this.viewport;
            var previewModel = new PreviewModel(app, view, controller);
            var controller = new PreviewController(app, view, previewModel);

            app.onLoad(() => {
                if (app.activePage === NullPage) {
                    var pageChangedToken = app.pageChanged.bind(() => {
                        this._initialize(view, previewModel, controller);
                        pageChangedToken.dispose();
                    })
                }
                else {
                    this._initialize(view, previewModel, controller);
                }
            });

            this.detachDisposables.add(controller.onArtboardChanged.bindAsync((newArtboard, oldArtboard) => {
                dispatch(CarbonActions.activeArtboardChanged(oldArtboard, newArtboard));

                if (newArtboard) {
                    dispatch(PreviewActions.navigateTo(newArtboard.id, {}));
                    dispatch(EditorActions.changeArtboard(newArtboard));
                } else  {
                    dispatch(EditorActions.showPageCode(app.activePage.id));
                }
            }));

            this.detachDisposables.add(app.actionManager.subscribe("onArtboardChanged", function (selection, a, b, data) {
                controller.onArtboardChanged.raise(data.newArtboard, data.oldArtboard);
            }));

            this.detachDisposables.add(previewModel.onPageChanged.bind((page) => {
                // dispatch(EditorActions.changeArtboard(previewModel.activeArtboard));
                if (this._onStateChangedBinding) {
                    this._onStateChangedBinding.dispose();
                    this._onStateChangedBinding = null;
                }

                if (previewModel.activeArtboard) {
                    this._onStateChangedBinding = previewModel.activeArtboard.stateChanged.bind(this, this.onStateChanged)
                }
            }));
        }
    }

    platformHandler: IPlatformSpecificHandler;
    _initialize(view, previewModel, controller) {
        this.platformHandler = createPlatformHandler();
        this.platformHandler.attachEvents(this.viewport, app, view, controller);

        this.view = view;
        view.setupRendering([this.context], redrawCallback.bind(this), cancelRedrawCallback.bind(this), renderingScheduledCallback.bind(this));
        view.contextScale = this.contextScale;

        this.previewModel = previewModel;
        previewModel.initialize().then(() => {
            this._attached = true;
            this.ensureCanvasSize();
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._attached = false;

        this.detachDisposables.dispose();

        window.removeEventListener("resize", this.onresize);
        this.touchEmulator.disable();

        document.body.classList.remove("fullscreen");
        document.body.classList.remove("preview");

        PreviewModel.current = null;

        this.platformHandler.detachEvents();
    }

    _setPage(page) {
        this.previewModel.activePage = page;
        this.view.setActivePage(page);
    }

    render() {
        var data = this.state.data;

        return (
            <Viewport id="viewport" innerRef={x => this.viewport = x} key="viewport" tabIndex={1}>
                <PreviewDevice innerRef={x => this.device = x}>
                    <canvas ref="canvas"
                        style={{
                            position: 'absolute'
                        }} />
                </PreviewDevice>
            </Viewport>
        );
    }
}

const PreviewDevice = styled.div`
    display: block;
    overflow:hidden;
    position: relative;
    background-color: black;
    width:100%;
    height:100%;
`;