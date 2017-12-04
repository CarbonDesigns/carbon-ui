import React from 'react';
import {
    app,
    PreviewController,
    Page,
    NullPage,
    PreviewView,
    PreviewModel,
    Context,
    Environment,
    Layer,
    Circle,
    Brush,
    Invalidate,
    ContextType,
    ContextLayerSource,
    PreviewDisplayMode,
    ISize,
    Matrix
} from "carbon-core";
import {
    AnimationType,
    EasingType
} from "carbon-runtime";

import { listenTo, Component, ComponentWithImmutableState, dispatch, handles } from "../CarbonFlux";
import PreviewStore from "./PreviewStore";
import PreviewActions from './PreviewActions';
import cx from "classnames";
import EditorActions from "../editor/EditorActions";

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

function easeTypeToClassName(type) {
    switch (type) {
        case EasingType.EaseIn:
            return "ease-in";
        case EasingType.EaseOut:
            return "ease-out";
        case EasingType.EaseInOut:
            return "ease-in-out";
    }

    return "ease-none";
}

export default class PreviewWorkspace extends ComponentWithImmutableState<any, any> {
    [x: string]: any;

    private previewModel: any;

    refs: {
        viewport: HTMLDivElement;
        canvas0: HTMLCanvasElement;
        canvas1: HTMLCanvasElement;
        canvas2: HTMLCanvasElement;
        device: HTMLDivElement;
    }

    constructor(props) {
        super(props);
        this.state = { data: PreviewStore.state, currentCanvas: 0 };
        this._renderingRequestId = 0;
        this._currentCanvas = 0;
        this._canvas1Left = -1;
        this._canvas1Top = -1;
        this._canvas2Left = -1;
        this._canvas2Top = -1;
        this._canvas1Opacity = 1;
        this._canvas2Opacity = 1;

        this._invalidateToken = Invalidate.requested.bind(this, this._onInvalidateRequested);
    }

    _onInvalidateRequested = () => {
        this.draw();
    }

    @handles(EditorActions.restart)
    restart() {
        let id;
        if (this.state.data.activePage) {
            id = this.state.data.activePage.artboardId;
        } else if (this.previewModel.sourceArtboard) {
            id = this.previewModel.sourceArtboard.id;
        } else {
            return;
        }

        this.previewModel.getScreenById(id, {
            width: this.state.data.deviceWidth || this.refs.viewport.clientWidth,
            height: this.state.data.deviceHeight || this.refs.viewport.clientHeight
        }, this.state.data.displayMode).then((nextPage) => {
            this._updateActivePage(nextPage);
        })
    }

    @listenTo(PreviewStore)
    onChange() {
        var data = this.state.data;
        var newData = PreviewStore.state;

        if (!this._attached || !this.refs.viewport) {
            return;
        }

        var page = newData.activePage;
        if (!page) {
            return null;
        } else if(newData.displayMode !== this.state.data.displayMode) {
            this.restart();
        }

        if (data.activePage !== newData.activePage) {
            this._currentCanvas = (this._currentCanvas + 1) % 2;

            this.previewModel.getScreenById(newData.activePage.artboardId, {
                width: this.refs.viewport.clientWidth,
                height: this.refs.viewport.clientHeight
            }, this.state.data.displayMode).then((nextPage) => {
                this.setState({ data: newData });
                this._updateActivePage(nextPage, page.animation);
            })
        }

        if (data.displayMode !== newData.displayMode) {
            this.ensureCanvasSize();
        }
    }

    _updateActivePage(nextPage, animation?) {
        if (animation) {
            if (this._currentCanvas === 0) {
                this.activeCanvas = this.canvas1;
                this.activeContext = this.context1;
                this.inactiveCanvas = this.canvas2;
                this.inactiveContext = this.context2;
            } else {
                this.activeCanvas = this.canvas2;
                this.activeContext = this.context2;
                this.inactiveCanvas = this.canvas1;
                this.inactiveContext = this.context1;
            }
            this._setupPositionBeforeAnimation(animation);
        }

        if (animation || !this.view.context) {
            this.view.contexts = [this.activeContext];
            this.view.context = new ContextLayerSource(this.view.contexts);
        }

        this._setPage(nextPage);
        this.ensureCanvasSize();
        this._renderFrameIfAvailiable();
        nextPage.invalidate();
        this.view.draw();
    }

    _renderFrameIfAvailiable() {
        var artboard = this._getCurrentArtboard();
        if (!artboard) {
            return;
        }
        var frame = artboard.frame;
        if (!frame) {
            return;
        }
        var env = this.view._getEnv(this.previewModel.activePage, 1, true);
        frame.draw(this.frameContext, env);
    }

    _setupPositionBeforeAnimation(animation?) {
        this.canvas1.classList.remove('animate');
        this.canvas2.classList.remove('animate');

        var activeLeft = 0,
            activeTop = 0,
            inactiveLeft = 0,
            inactiveTop = 0,
            activeOpacity = 1,
            inactiveOpacity = 1,
            activeZIndex = 1,
            inactiveZIndex = 0;

        if (!animation || animation.type === AnimationType.SlideLeft) {
            activeLeft = this._screenWidth;
            inactiveLeft = -this._screenWidth;
        } else if (animation.type === AnimationType.SlideRight) {
            activeLeft = -this._screenWidth;
            inactiveLeft = this._screenWidth;
        } else if (animation.type === AnimationType.SlideUp) {
            activeTop = this._screenHeight;
            inactiveTop = -this._screenHeight;
        } else if (animation.type === AnimationType.SlideDown) {
            activeTop = -this._screenHeight;
            inactiveTop = this._screenHeight;
        } else if (animation.type === AnimationType.Dissolve) {
            activeTop = 0;
            inactiveTop = 0;
            activeZIndex = 0;
            inactiveZIndex = 1;
            activeOpacity = 1;
            inactiveOpacity = 0;
            activeLeft = 0;
            inactiveLeft = 0;
        }

        this.canvas1.style.transitionDuration = 0;
        this.canvas2.style.transitionDuration = 0;

        if (this._currentCanvas === 0) {
            this.canvas1.style.left = activeLeft + "px";
            this.canvas1.style.top = activeTop + "px";
            if (animation && animation.type === AnimationType.Dissolve) {
                this.canvas2.style.left = activeLeft + "px";
                this.canvas2.style.top = activeTop + "px";
            }
            this.canvas1.style.zIndex = activeZIndex;
            this.canvas2.style.zIndex = inactiveZIndex;

            this._canvas1Left = 0;
            this._canvas2Left = inactiveLeft;
            this._canvas1Top = 0;
            this._canvas2Top = inactiveTop;

            this._canvas1Opacity = activeOpacity;
            this._canvas2Opacity = inactiveOpacity;

        } else {
            this.canvas2.style.left = activeLeft + "px";
            this.canvas2.style.top = activeTop + "px";
            if (animation && animation.type === AnimationType.Dissolve) {
                this.canvas1.style.left = activeLeft + "px";
                this.canvas1.style.top = activeTop + "px";
            }
            this.canvas2.style.zIndex = activeZIndex;
            this.canvas1.style.zIndex = inactiveZIndex;

            this._canvas2Left = 0;
            this._canvas1Left = inactiveLeft;
            this._canvas2Top = 0;
            this._canvas1Top = inactiveTop;

            this._canvas2Opacity = activeOpacity;
            this._canvas1Opacity = inactiveOpacity;
        }

        this.canvas1.style.opacity = 1;
        this.canvas2.style.opacity = 1;


        this.canvas1.style.display = 'none';
        this.canvas1.offsetHeight; // no need to store this anywhere, the reference is enough
        this.canvas1.style.display = '';
        this.canvas2.style.display = 'none';
        this.canvas2.offsetHeight; // no need to store this anywhere, the reference is enough
        this.canvas2.style.display = '';
    }

    onDisplayClikSpots() {
        var inactiveCanvas = this.inactiveCanvas;
        inactiveCanvas.style.display = 'none';
        inactiveCanvas.style.left = 0;
        inactiveCanvas.style.top = 0;
        inactiveCanvas.style.width = this.activeCanvas.style.width;
        inactiveCanvas.style.height = this.activeCanvas.style.height;
        inactiveCanvas.width = this.activeCanvas.width;
        inactiveCanvas.height = this.activeCanvas.height;
        inactiveCanvas.style.zIndex = 2;
        inactiveCanvas.offsetHeight; // no need to store this anywhere, the reference is enough
        inactiveCanvas.style.display = '';

        var interactionLayer = new Layer(this);
        interactionLayer.hitTransparent(true);
        interactionLayer.context = this.inactiveContext;
        var view = this.view;

        view._registerLayer(interactionLayer);

        var elements = this.previewModel.allElementsWithActions();
        var promises = [];
        for (var e of elements) {
            var rect = e.getBoundaryRectGlobal();
            promises.push(this._addClickSpot(interactionLayer, rect.x + rect.width / 2 | 0, rect.y + rect.height / 2 | 0));
        }
        Promise.all(promises).then(() => {
            view._unregisterLayer(interactionLayer);
            inactiveCanvas.style.zIndex = 0;
        });
    }

    _addClickSpot(layer, x, y) {
        var circle = new Circle();
        circle.setProps({
            width: 100,
            height: 100,
            stroke: Brush.Empty,
            fill: Brush.createFromColor("rgba(100,120,230,0.3)")
        });
        circle.setTransform(Matrix.createTranslationMatrix(x - 50, y - 50));
        layer.add(circle);
        return circle.animate({ width: 10, height: 10 }, 450, {}, () => {
            circle.setTransform(Matrix.createTranslationMatrix(x - circle.width / 2, y - circle.height / 2));
            layer && layer.invalidate();
        }).then(() => {
            circle.parent.remove(circle);
            layer && layer.invalidate();
        });
    }

    draw() {
        if (this.previewModel) {
            let viewport = this.refs.viewport;
            if (!viewport) {
                return;
            }
            let viewportSize = {
                width: viewport.clientWidth - ViewportMargin,
                height: viewport.clientHeight - ViewportMargin
            };
            if (!this._oldViewportSize
                || (viewportSize.height !== this._oldViewportSize.height)
                || (viewportSize.width !== this._oldViewportSize.width)) {
                this.ensureCanvasSize(viewportSize);
            }
            this.view.draw();
        }
    }

    onresize = () => {
        this.view && this.view.invalidate();
    }

    componentDidMount() {
        super.componentDidMount();
        this.canvas0 = this.refs.canvas0;
        this.canvas1 = this.refs.canvas1;
        this.canvas2 = this.refs.canvas2;

        this.context1 = new Context(ContextType.Content, this.canvas1);
        this.context2 = new Context(ContextType.Content, this.canvas2);
        this.frameContext = new Context(ContextType.Content, this.canvas0);

        this.activeCanvas = this.canvas1;
        this.inactiveCanvas = this.canvas2;
        this.activeContext = this.context1;
        this.inactiveContext = this.context2;

        this._renderingCallback = function () {
            doRendering.call(this, false);
        }.bind(this);
        this._renderingCallbackContinuous = function () {
            doRendering.call(this, true);
        }.bind(this);


        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio =
            this.context1.backingStorePixelRatio ||
            this.context1.webkitBackingStorePixelRatio ||
            this.context1.mozBackingStorePixelRatio ||
            this.context1.msBackingStorePixelRatio ||
            this.context1.oBackingStorePixelRatio ||
            1;

        // on some machines it is non integer, it affects rendering
        this.contextScale = Math.max(1, Math.round(devicePixelRatio / backingStoreRatio));

        this.attachToView();
        window.addEventListener("resize", this.onresize);
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
        if (!this._attached || !this.refs.viewport) {
            return;
        }

        let previewDisplayMode = PreviewStore.state.displayMode;
        // if(data) {
        //     previewDisplayMode = data.displayMode;
        // }

        let viewport = this.refs.viewport;

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

        // data = data || this.state.data;

        // var deviceWidth;
        // var deviceHeight;

        // var drawFrame = false;

        // var frame;
        // if (artboard) {
        //     frame = artboard.frame;
        //     if (app.showFrames() && frame) {
        //         deviceWidth = frame.runtimeProps.cloneScreenWidth;
        //         deviceHeight = frame.runtimeProps.cloneScreenHeight;
        //         drawFrame = true;
        //     } else {
        //         deviceWidth = artboard.width;
        //         deviceHeight = artboard.height;
        //     }
        // }

        // if (deviceWidth && deviceHeight) {
        //     var deviceSize = { width: deviceWidth, height: deviceHeight };
        // } else {
        //     viewportSize = {
        //         width: viewport.clientWidth,
        //         height: viewport.clientHeight
        //     };
        //     deviceSize = { width: viewport.clientWidth, height: viewport.clientHeight };
        //     margin = 0;
        // }

        // var deviceScale = Math.min(1, fitRectToRect(viewportSize, deviceSize));

        let scale = this.view.scale(deviceScale);
        this.view.updateViewportSize(deviceSize);
        let resized = false;

        var canvasWidth = this._screenWidth = deviceSize.width;
        var canvasHeight = this._screenHeight = deviceSize.height;

        var needResize = false;
        if (!this._oldViewportSize || this._oldViewportSize.width !== viewportSize.width || this._oldViewportSize.height !== viewportSize.height) {
            needResize = true;
        }

        var canvas = this.activeCanvas;
        var frameCanvas = this.refs.canvas0;
        var device = this.refs.device;
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

        if (/*drawFrame*/false) {
            // frameCanvas.width = frame.width() * scale * this.contextScale;
            // frameCanvas.height = frame.height() * scale * this.contextScale;
            // frameCanvas.style.left = ((margin / 2 + (viewportSize.width - canvasWidth) / 2 | 0) + frame.runtimeProps.frameX) + 'px';
            // frameCanvas.style.top = ((margin / 2 + (viewportSize.height - canvasHeight) / 2 | 0) + frame.runtimeProps.frameY) + 'px';
            // this._renderFrameIfAvailiable();
            // frameCanvas.style.display = 'block';
        } else {
            frameCanvas.style.display = 'none';
        }

        this.previewModel.resizeActiveScreen(deviceSize, scale, previewDisplayMode);

        this._scale = scale;

        if (resized) {
            this.view.invalidate();
        }

        this._oldViewportSize = viewportSize;
    }

    attachToView() {
        if (this.activeContext && !this._attached) {
            var view = new PreviewView(app);
            view.setup({ Layer: Page });
            view.viewContainerElement = this.refs.viewport;
            var previewModel = new PreviewModel(app);
            var controller = new PreviewController(app, view, previewModel);
            Environment.set(view, controller);

            if (view.page === NullPage) {
                var pageChangedToken = app.pageChanged.bind(() => {
                    this._initialize(view, previewModel, controller);
                    pageChangedToken.dispose();
                })
            } else {
                this._initialize(view, previewModel, controller);
            }
        }
    }

    _initialize(view, previewModel, controller) {
        app.platform.detachEvents();
        app.platform.attachEvents(this.refs.viewport);

        this._displayClickSpotsToken = view.displayClickSpots.bind(this, this.onDisplayClikSpots);
        this._navigateToPageToken = previewModel.navigateToPage.bind(this, function (artboardId, animation) {
            dispatch(PreviewActions.navigateTo(artboardId, animation));
        });

        this.view = view;
        view.setupRendering([this.activeContext], redrawCallback.bind(this), cancelRedrawCallback.bind(this), renderingScheduledCallback.bind(this));
        view.contextScale = this.contextScale;

        this.previewModel = previewModel;

        previewModel.getCurrentScreen({
            width: this.state.data.deviceWidth || this.refs.viewport.clientWidth,
            height: this.state.data.deviceHeight || this.refs.viewport.clientHeight
        }).then(page => {
            this._updateActivePage(page);

            this._attached = true;
            this.ensureCanvasSize();
        })
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
        if (this._invalidateToken) {
            this._invalidateToken.dispose();
            this._invalidateToken = null;
        }

        window.removeEventListener("resize", this.onresize);
    }

    _setPage(page) {
        this.previewModel.activePage = page;
        this.view.setActivePage(page);
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate(prevProps, prevState);
        requestAnimationFrame(function () {
            var duration = (!this.state.data.activePage) ? 0 : this.state.data.activePage.animation.duration;
            this.refs.canvas1.style.transitionDuration = duration + 's';
            this.refs.canvas2.style.transitionDuration = duration + 's';
            this.canvas1.classList.add('animate');
            this.canvas2.classList.add('animate');
            this.refs.canvas1.style.top = this._canvas1Top + 'px';
            this.refs.canvas1.style.left = this._canvas1Left + 'px';
            this.refs.canvas1.style.opacity = this._canvas1Opacity;

            this.refs.canvas2.style.top = this._canvas2Top + 'px';
            this.refs.canvas2.style.left = this._canvas2Left + 'px';
            this.refs.canvas2.style.opacity = this._canvas2Opacity;
        }.bind(this));
    }

    render() {
        var data = this.state.data;
        var classNames = cx("animate", (!this.state.data.activePage) ? "" : easeTypeToClassName(this.state.data.activePage.animation.curve));

        return (
            <div id="viewport" ref="viewport" key="viewport" name="viewport">
                <canvas ref="canvas0" className={classNames}
                    style={{
                        position: 'absolute'
                    }} />
                <div className="preview__device" ref="device">
                    <canvas ref="canvas1" className={classNames}
                        style={{
                            position: 'absolute'
                        }} />
                    <canvas ref="canvas2" className={classNames}
                        style={{
                            position: 'absolute'
                        }} />

                </div>
            </div>
        );
    }
}