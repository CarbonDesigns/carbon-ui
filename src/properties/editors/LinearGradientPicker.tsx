import React from 'react'
import cx from "classnames";
import ColorPicker from "./ColorPicker";
import { Component } from "../../CarbonFlux";

function LinearGradientPoint(props) {
    return <div className="linear-gradient__point" style={{ backgroundColor: props.c, left: (props.p * 100) + '%' }}>

    </div>
}

class LinearGradient extends React.Component<any, any> {
    refs: {
        line: HTMLElement;
        canvas: any;
    };

    private _startX: number;
    private _size: number;
    private _originalX: number;
    private _activePoint: number;
    private context: any;

    constructor(props, context) {
        super(props, context);
        this.state = { activePoint: 0, gradient: clone(this.props.gradient) };

    }

    onMouseDown = (event) => {
        // check if hit existing
        let x = event.nativeEvent.offsetX
        let size = this.refs.line.clientWidth;
        let pcnt = x / size;
        let stops = this.state.gradient.stops;
        let clickExisting = false;
        for (let i = 0; i < stops.length; ++i) {
            let stop = stops[i];
            let stopCenter = stop.p * size;
            if (x >= stopCenter - 10 && x <= stopCenter + 10) {
                this.setState({ activePoint: i });
                this._activePoint = i;
                clickExisting = true;
                break;
            }
        }

        let g = this.state.gradient;
        if (!clickExisting) {
            let newGradient = clone(this.state.gradient);
            for (let i = newGradient.stops.length - 1; i > 0; --i) {
                if (newGradient.stops[i - 1].p < pcnt) {
                    newGradient.stops.splice(i, 0, { p: pcnt, c: 'red' });
                    this._activePoint = i;
                    this.setState({ gradient: newGradient, activePoint: i });
                    break;
                }
            }
            g = newGradient;
        }

        if (this._activePoint !== 0 && this._activePoint !== g.stops.length - 1) {
            this.setState({ mousePressed: true });
        }

        window.document.addEventListener("mousemove", this.onMouseMove);
        window.document.addEventListener("mouseup", this.onMouseUp);
        this._startX = event.screenX;
        this._size = size;
        this._originalX = g.stops[this._activePoint].p * size;
    }

    onMouseMove = (event) => {
        if (this.state.mousePressed) {
            let dx = event.screenX - this._startX;
            let g = clone(this.state.gradient);
            let stopPoint = g.stops[this._activePoint];
            g.stops[this._activePoint] = { p: (this._originalX + dx) / this._size, c: stopPoint.c };
            this.setState({ gradient: g });
            this._refreshCanvas();
        }

    }

    onMouseUp = (event) => {
        window.document.removeEventListener("mousemove", this.onMouseMove);
        window.document.removeEventListener("mouseup", this.onMouseUp);
        this.setState({ mousePressed: false });
    }

    componentDidMount() {
        var canvas = this.refs.canvas;
        var line = this.refs.line;
        canvas.width = line.clientWidth;
        canvas.height = line.clientHeight;
        this.context = canvas.getContext("2d");
        this._refreshCanvas();
    }

    _refreshCanvas() {
        let width = this.refs.line.clientWidth;
        let ctx = this.context;
        if(!ctx) {
            return;
        }
        let grd = ctx.createLinearGradient(0, 0, width, 20);
        for(var s of this.state.gradient.stops) {
            grd.addColorStop(s.p, s.c);
        }

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, 20);
    }

    render() {
        var g = this.state.gradient;
        let stops = "";
        for (var s of g.stops) {
            if (stops) {
                stops += ", "
            }

            stops += s.c + ' ' + (s.p * 100) + '%';
        }
        let gradientFunction = `linear-gradient(90deg, ${stops})`;

        return <div ref="line" onMouseDown={this.onMouseDown} className="linear-gradient" >
            <canvas ref="canvas"  className="linear-gradient__canvas"></canvas>
            {g.stops.map(s => <LinearGradientPoint {...s} />)}
        </div>
    }
}

export default class LinearGradientPicker extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = { color: null }
    }

    onColorPickerChange = color => {
        // if (color.rgb.a && color.rgb.a != 1) {
        //     var rgba = color.rgb;
        //     color = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
        //     var brush = Brush.createFromColor(color);

        // }
        // else {
        //     brush = Brush.createFromColor(color.hex);
        //     color = color.hex;
        // }
        // this.setState({ color: color });
        // this.selectBrush(brush);

    };

    render() {
        return <div className="linear-gradient-picker" style={this.props.style}>
            <LinearGradient gradient={{ angle: 0, stops: [{ c: 'red', p: 0 }, { c: 'green', p: 1 }] }} />
            <ColorPicker display={true} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onColorPickerChange} presetColors={[]} />

        </div>;
    }
}