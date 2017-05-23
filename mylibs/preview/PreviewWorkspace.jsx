import React from 'react';
import {
    app,
    PreviewController,
    Page,
    NullPage,
    PreviewView,
    PreviewProxy,
    Context,
    Environment,
    AnimationType,
    EasingType,
    Layer,
    Circle,
    Brush,
    Invalidate,
    Deferred
} from "carbon-core";
import { listenTo, Component, ComponentWithImmutableState, dispatch } from "../CarbonFlux";
import PreviewStore from "./PreviewStore";
import PreviewActions from './PreviewActions';
import cx from "classnames";

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

export default class PreviewWorkspace extends ComponentWithImmutableState {
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

        Invalidate.requested.bind(this, this._onInvalidateRequested);
    }

    _onInvalidateRequested = () => {
        this.draw();
    }

    @listenTo(PreviewStore)
    onChange() {
        var data = this.state.data;
        var newData = PreviewStore.state;

        if (!this._attached || !this.refs.viewport) {
            return;
        }

        if (data.activePage !== newData.activePage) {
            this._currentCanvas = (this._currentCanvas + 1) % 2;

            var nextPage = this.previewProxy.getScreenById(newData.activePage.artboardId, {
                width: this.state.data.deviceWidth || this.refs.viewport.clientWidth,
                height: this.state.data.deviceHeight || this.refs.viewport.clientHeight
            });
            this._updateActivePage(nextPage, newData.activePage.animation);
        }

        this.setState({ data: newData });
        this.ensureCanvasSize(newData);


    }

    _updateActivePage(nextPage, animation) {
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

        this.view.context = this.activeContext;

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
        var env = this.view._getEnv(this.previewProxy.activePage, 1, true);
        frame.draw(this.frameContext, env);
    }

    _setupPositionBeforeAnimation(animation) {
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

        if (!animation || animation.segue === AnimationType.SlideLeft) {
            activeLeft = this._screenWidth;
            inactiveLeft = -this._screenWidth;
        } else if (animation.segue === AnimationType.SlideRight) {
            activeLeft = -this._screenWidth;
            inactiveLeft = this._screenWidth;
        } else if (animation.segue === AnimationType.SlideUp) {
            activeTop = this._screenHeight;
            inactiveTop = -this._screenHeight;
        } else if (animation.segue === AnimationType.SlideDown) {
            activeTop = -this._screenHeight;
            inactiveTop = this._screenHeight;
        } else if (animation.segue === AnimationType.Dissolve) {
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
            if (animation && animation.segue === AnimationType.Dissolve) {
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
            if (animation && animation.segue === AnimationType.Dissolve) {
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

        var elements = this.previewProxy.allElementsWithActions();
        var promises = [];
        for (var e of elements) {
            var rect = e.getBoundaryRectGlobal();
            promises.push(this._addClickSpot(interactionLayer, rect.x + rect.width / 2 | 0, rect.y + rect.height / 2 | 0));
        }
        Deferred.when(promises).then(() => {
            view._unregisterLayer(interactionLayer);
            inactiveCanvas.style.zIndex = 0;
        });
    }

    _addClickSpot(layer, x, y) {
        var circle = new Circle();
        circle.setProps({
            x: x - 50,
            y: y - 50,
            width: 100,
            height: 100,
            stroke: Brush.Empty,
            fill: Brush.createFromColor("rgba(100,120,230,0.3)")
        });
        layer.add(circle);
        return circle.animate({ x: x, y: y, width: 10, height: 10 }, 450, {}, () => {
            layer && layer.invalidate();
        })
            .then(() => {
                circle.parent().remove(circle);
            });
    }

    draw() {
        if (this.previewProxy != null) {
            this.ensureCanvasSize();
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

        this.context1 = new Context(this.canvas1);
        this.context2 = new Context(this.canvas2);
        this.frameContext = new Context(this.canvas0);

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
        var page = this.previewProxy.activePage;

        if (!page) {
            return null;
        }

        return page.children[0];
    }

    ensureCanvasSize(data) {
        if (!this._attached || !this.refs.viewport) {
            return;
        }

        var viewport = this.refs.viewport;
        data = data || this.state.data;
        var margin = ViewportMargin;
        var deviceWidth;
        var deviceHeight;

        var drawFrame = false;
        var artboard = this._getCurrentArtboard();
        var frame;
        if (artboard) {
            frame = artboard.frame;
            if (app.showFrames() && frame) {
                deviceWidth = frame.runtimeProps.cloneScreenWidth;
                deviceHeight = frame.runtimeProps.cloneScreenHeight;
                drawFrame = true;
            } else {
                deviceWidth = artboard.width();
                deviceHeight = artboard.height();
            }
        }

        if (deviceWidth && deviceHeight) {
            var viewportSize = {
                width: viewport.clientWidth - ViewportMargin,
                height: viewport.clientHeight - ViewportMargin
            };
            var deviceSize = { width: deviceWidth, height: deviceHeight };
        } else {
            viewportSize = {
                width: viewport.clientWidth,
                height: viewport.clientHeight
            };
            deviceSize = { width: viewport.clientWidth, height: viewport.clientHeight };
            margin = 0;
        }

        var deviceScale = Math.min(1, fitRectToRect(viewportSize, deviceSize));

        var scale = this.view.scale(deviceScale);
        var resized = false;

        var canvasWidth = this._screenWidth = deviceSize.width * deviceScale;
        var canvasHeight = this._screenHeight = deviceSize.height * deviceScale;

        var needResize = false;
        if (!this._oldViewportSize || this._oldViewportSize.width !== viewportSize.width || this._oldViewportSize.height != viewportSize.height) {
            needResize = true;
        }

        var canvas = this.activeCanvas;
        var frameCanvas = this.refs.canvas0;
        var device = this.refs.device;
        if (needResize || canvas.width !== (0 | (canvasWidth * this.contextScale))) {
            canvas.width = canvasWidth * this.contextScale;
            device.style.width = canvas.style.width = canvasWidth + "px";
            device.style.left = (margin / 2 + (viewportSize.width - canvasWidth) / 2 | 0) + "px";
            resized = true;
        }
        if (needResize || canvas.height !== (0 | (canvasHeight * this.contextScale))) {
            canvas.height = canvasHeight * this.contextScale;
            device.style.height = canvas.style.height = canvasHeight + "px";
            device.style.top = (margin / 2 + (viewportSize.height - canvasHeight) / 2 | 0) + "px";
            resized = true;
        }

        if (drawFrame) {
            frameCanvas.width = frame.width() * scale * this.contextScale;
            frameCanvas.height = frame.height() * scale * this.contextScale;
            frameCanvas.style.left = ((margin / 2 + (viewportSize.width - canvasWidth) / 2 | 0) + frame.runtimeProps.frameX) + 'px';
            frameCanvas.style.top = ((margin / 2 + (viewportSize.height - canvasHeight) / 2 | 0) + frame.runtimeProps.frameY) + 'px';
            this._renderFrameIfAvailiable();
            frameCanvas.style.display = 'block';
        } else {
            frameCanvas.style.display = 'none';
        }

        this.previewProxy.resizeActiveScreen(deviceSize, scale);

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
            var previewProxy = new PreviewProxy(app);
            var controller = new PreviewController(app, view, previewProxy);
            Environment.set(view, controller);

            if (view.page === NullPage) {
                var pageChangedToken = app.pageChanged.bind(() => {
                    this._initialize(view, previewProxy, controller);
                    pageChangedToken.dispose();
                })
            } else {
                this._initialize(view, previewProxy, controller);
            }
        }
    }

    _initialize(view, previewProxy, controller) {
        app.platform.detachEvents();
        app.platform.attachEvents(this.refs.viewport);

        this._displayClickSpotsToken = view.displayClickSpots.bind(this, this.onDisplayClikSpots);
        this._navigateToPageToken = previewProxy.navigateToPage.bind(this, function (artboardId, animation) {
            dispatch(PreviewActions.navigateTo(artboardId, animation));
        });

        this.view = view;
        view.setupRendering(this.activeContext, redrawCallback.bind(this), cancelRedrawCallback.bind(this), renderingScheduledCallback.bind(this));
        view.contextScale = this.contextScale;

        this.previewProxy = previewProxy;

        var page = previewProxy.getCurrentScreen({
            width: this.state.data.deviceWidth || this.refs.viewport.clientWidth,
            height: this.state.data.deviceHeight || this.refs.viewport.clientHeight
        });

        this._updateActivePage(page);

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
    }

    _setPage(page) {
        this.previewProxy.activePage = page;
        this.view.setActivePage(page);
    }

    componentDidUpdate() {
        super.componentDidUpdate();
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
        var classNames = cx("animate", (!this.state.data.activePage) ? "" : easeTypeToClassName(this.state.data.activePage.animation.easing));

        return (
            <div id="viewport" ref="viewport" key="viewport" name="viewport">
                <canvas ref="canvas0" className={classNames}
                    style={{
                        position: 'absolute'
                    }} />
                <div className="preview__device" ref="device">
                    <div id="htmlPanel"></div>

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