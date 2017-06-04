import React from "react";
import { Component } from "../../../CarbonFlux";
import bem from "../../../utils/commonUtils";
import { GuiSlider } from "../../../shared/ui/GuiComponents";
import { Rect, IRect, Workspace, Context, IContext } from "carbon-core";

function b(a, b?, c?) { return bem("edit-image", a, b, c) }

export default class CropEditor extends Component<any, any> {
    refs: {
        canvas: HTMLCanvasElement,
        box: HTMLDivElement
    }

    private _context: IContext;
    private _image: HTMLImageElement;
    private _sourceRect: IRect;
    private _targetRect: IRect;
    [x: string]: any;

    constructor(props) {
        super(props);

        //todo find max zoom from size of image and cropped area

        this.min_zoom = .2;
        this.max_zoom = 1.8;

        this.state = {
            slider_pos: .5,
            shift_x: 0,
            shift_y: 0
        };
    }

    _easing(pos) {
        return pos * (this.max_zoom - this.min_zoom) + this.min_zoom
    }

    componentDidMount() {
        super.componentDidMount();
        this._box = this.refs.box;

        this.initCanvas(this.refs.canvas);
        this._context = new Context(this.refs.canvas);

        var image = new Image();
        image.onload = () => {
            this._sourceRect = new Rect(0, 0, image.width, image.height);
            this._targetRect = this._sourceRect.fill(new Rect(0, 0, this.refs.canvas.width, this.refs.canvas.height));

            requestAnimationFrame(this.draw);
        };
        image.src = this.props.image;
        this._image = image;
    }

    toDataUrl(){
        return this.refs.canvas.toDataURL();
    }

    private draw = () => {
        var zoom = this._easing(this.state.slider_pos);

        this._context.save();
        this._context.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

        Workspace.view.renderElement(App.Current.activePage.getActiveArtboard(), this._context, this.state.shift_x, this.state.shift_y, zoom);

        //this._context.translate(this.state.shift_x, this.state.shift_y);
        //this._context.scale(zoom, zoom);

        // this._context.drawImage(this._image,
        //     this._sourceRect.x, this._sourceRect.y, this._sourceRect.width, this._sourceRect.height,
        //     this._targetRect.x, this._targetRect.y, this._targetRect.width, this._targetRect.height);

        this._context.restore();
    }

    private initCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.width = width * Workspace.view.contextScale;
        canvas.height = height * Workspace.view.contextScale;

        var context = canvas.getContext("2d");
        context.scale(Workspace.view.contextScale, Workspace.view.contextScale);
        return context;
    }

    _onMouseDown = (ev) => {

        ev.preventDefault();
        ev.stopPropagation();

        this._size_w = this._box.clientWidth;
        this._size_h = this._box.clientHeight;
        this._box_x = this._box.getBoundingClientRect().left;
        this._box_y = this._box.getBoundingClientRect().top;

        this.__x = this.state.shift_x - ev.clientX;
        this.__y = this.state.shift_y - ev.clientY;

        this._updatePositionFromEvent(ev);

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
            var vx = ev.clientX - this._box_x;
            var vy = ev.clientY - this._box_y;

            if (!(vx <= this._size_w && vx >= 0 &&
                vy <= this._size_h && vy >= 0)
            ) {
                this._onMouseUp();
            }
            else {
                this._updatePositionFromEvent(ev);
            }
            requestAnimationFrame(this.draw);
        }
    };

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

        var new_pos;
        var delta = ev.nativeEvent.deltaY;

        new_pos = this.state.slider_pos - (delta / 100) * .1;
        new_pos = Math.max(new_pos, 0);
        new_pos = Math.min(new_pos, 1);
        if (this.state.slider_pos != new_pos) {
            this.setState({ slider_pos: new_pos })
            requestAnimationFrame(this.draw);
        }

    };

    _updatePositionFromEvent = (ev) => {
        this.setState({
            shift_x: ev.clientX + this.__x,
            shift_y: ev.clientY + this.__y
        });
    };

    render() {
        var image = this.props.image;

        var zoom = this._easing(this.state.slider_pos);

        var transform = [
            `translateY(${this.state.shift_y}px)`,
            `translateX(${this.state.shift_x}px)`,
            `translateY(-50%)`,
            `translateX(-50%)`,
            `scale(${zoom.toFixed(3)})`,
        ].join(' ');
        var pane_style = {
            padding: 80 + '%',
            transform
        };

        return <div className={b('crop-editor')} ref="box"
            onWheel={this._onWheel}
            onMouseDown={this._onMouseDown}>
            <div className={b('crop-area')}>
                <canvas ref="canvas" style={{ width: "300px", height: "300px" }}></canvas>
                {/*<div className={b('crop-area-pane')} style={pane_style}>
                    <img className={b('crop-area-image')} src={image} />
                </div>*/}
            </div>
            <div className={b('crop-area-zoom')}>
                <GuiSlider
                    value={this.state.slider_pos}
                    max={1}
                    min={0}
                    onValueUpdate={(value) => {
                        this.setState({ slider_pos: value });
                        requestAnimationFrame(this.draw);
                    }}
                />
            </div>
        </div>
    }
}


