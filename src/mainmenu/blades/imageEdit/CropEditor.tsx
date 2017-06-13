import React from "react";
import { Component } from "../../../CarbonFlux";
import bem from "../../../utils/commonUtils";
import { GuiSlider } from "../../../shared/ui/GuiComponents";
import { Rect, IRect } from "carbon-core";

function b(a, b?, c?) { return bem("edit-image", a, b, c) }

interface ICropEditorProps {
    image: string;
    dpr: number;
}

interface ICropEditorState {
    sliderPos: number;
    zoom: number;
}

export default class CropEditor extends Component<ICropEditorProps, ICropEditorState> {
    refs: {
        canvas: HTMLCanvasElement,
        box: HTMLDivElement
    }

    private _dragging: boolean;
    private _maxZoom: number;
    private _minZoom: number;
    private _tx: number = 0;
    private _ty: number = 0;
    private _lastX: number;
    private _lastY: number;

    private _context: CanvasRenderingContext2D;
    private _image: HTMLImageElement;
    private _sourceRect: IRect;
    private _targetRect: IRect;

    constructor(props) {
        super(props);

        //todo find max zoom from size of image and cropped area
        this._minZoom = .2;
        this._maxZoom = 1.8;

        this.state = {
            sliderPos: .5,
            zoom: 1
        };
    }

    _easing(pos: number) {
        return pos * (this._maxZoom - this._minZoom) + this._minZoom
    }

    componentDidMount() {
        super.componentDidMount();

        this._context = this.initCanvas(this.refs.canvas);
        //this._context = new Context(this.refs.canvas);

        var image = new Image();
        image.onload = () => {
            this._sourceRect = new Rect(0, 0, image.width, image.height);
            this._targetRect = this._sourceRect.fit(new Rect(0, 0, this.refs.canvas.width/this.props.dpr, this.refs.canvas.height/this.props.dpr));

            requestAnimationFrame(this.draw);
        };
        image.src = this.props.image;
        this._image = image;
    }

    toDataUrl(){
        return this.refs.canvas.toDataURL();
    }

    private draw = () => {
        var zoom = this._easing(this.state.sliderPos);

        this._context.save();
        this._context.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

        this._context.translate(this._tx, this._ty);
        this._context.scale(zoom, zoom);

        this._context.drawImage(this._image,
            this._sourceRect.x, this._sourceRect.y, this._sourceRect.width, this._sourceRect.height,
            this._targetRect.x, this._targetRect.y, this._targetRect.width, this._targetRect.height);

        this._context.restore();
    }

    private initCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.width = width * this.props.dpr;
        canvas.height = height * this.props.dpr;

        var context = canvas.getContext("2d");
        context.scale(this.props.dpr, this.props.dpr);
        return context;
    }

    _onMouseDown = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        this._lastX = ev.clientX;
        this._lastY = ev.clientY;

        this._dragging = true;
        document.body.addEventListener("mousemove", this._onDrag);
        document.body.addEventListener("mouseup", this._onMouseUp);
    };

    _onMouseUp = () => {
        this._dragging = false;
        document.body.removeEventListener("mousemove", this._onDrag);
        document.body.removeEventListener("mouseup", this._onMouseUp);
    };

    _onDrag = (ev) => {
        if (this._dragging) {
            this._tx += ev.clientX - this._lastX;
            this._ty += ev.clientY - this._lastY;

            this._lastX = ev.clientX;
            this._lastY = ev.clientY;

            requestAnimationFrame(this.draw);
        }
    };

    updateSliderPosition = (pos: number) => {
        this.setState({ sliderPos: pos, zoom: this._easing(pos) });
        requestAnimationFrame(this.draw);
    }

    _onWheel = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        //from http://stackoverflow.com/questions/34790949/react-js-onwheel-bubbling-stoppropagation-not-working
        // const el = ReactDom.findDOMNode(this);
        // if (ev.nativeEvent.deltaY <= 0)
        //     {if (el.scrollTop <= 0) {ev.preventDefault();ev.stopPropagation();}}
        // else if (el.scrollTop + el.clientHeight >= el.scrollHeight)
        //     {ev.preventDefault(); ev.stopPropagation();}

        if (this._dragging) {
            return false;
        }

        var delta = ev.nativeEvent.deltaY;
        var newPos = this.state.sliderPos - (delta / 100) * .1;
        newPos = Math.max(newPos, 0);
        newPos = Math.min(newPos, 1);
        if (this.state.sliderPos !== newPos) {
            this.updateSliderPosition(newPos);
        }

    };

    render() {
        var image = this.props.image;
        var zoom = this._easing(this.state.sliderPos);

        return <div className={b('crop-editor')} ref="box"
            onWheel={this._onWheel}
            onMouseDown={this._onMouseDown}>
            <div className={b('crop-area')}>
                <canvas ref="canvas"></canvas>
            </div>
            <div className={b('crop-area-zoom')}>
                <GuiSlider
                    value={this.state.sliderPos}
                    max={1}
                    min={0}
                    onValueUpdate={this.updateSliderPosition}
                />
            </div>
        </div>
    }
}