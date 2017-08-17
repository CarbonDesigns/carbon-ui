import React from 'react'
import cx from "classnames";
import ColorPicker from "./ColorPicker";
import { Component } from "../../CarbonFlux";
import { util } from "carbon-api";

function LinearGradientPoint(props) {
    let style:any = { left: (props.value[0] * 100) + '%' };
    if(props.active) {
        style.backgroundColor = props.value[1];
    }
    return <div className={cx("linear-gradient__point", {active:props.active})} style={style}>

    </div>
}

const LineSize = 16;

class LinearGradient extends React.Component<any, any> {
    refs: {
        line: HTMLElement;
        canvas: any;
    };

    private _startX: number;
    private _size: number;
    private _originalX: number;
    private _activePoint: number;
    private ctx: any;

    constructor(props, context) {
        super(props, context);
        this.state = { activePoint: 0, gradient: clone(this.props.gradient) };
    }

    setActivePoint(index) {
        this._activePoint = index;
        this.setState({activePoint:index});
        this.props.onActivePointChanged(index);
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
            let stopCenter = stop[0] * size;
            if (x >= stopCenter - LineSize/2 && x <= stopCenter + LineSize/2) {
                this.setActivePoint(i);
                clickExisting = true;
                break;
            }
        }

        let g = this.state.gradient;
        if (!clickExisting) {
            let newGradient = clone(this.state.gradient);
            for (let i = newGradient.stops.length - 1; i > 0; --i) {
                if (newGradient.stops[i - 1][0] < pcnt) {
                    var imageData = this.ctx.getImageData(0, 0, size, 1);
                    var color = util.imageDataPointToCssColor(imageData.data, x);
                    newGradient.stops.splice(i, 0, [pcnt, color]);
                    this.setState({ gradient: newGradient});
                    this.setActivePoint(i);
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
        this._originalX = g.stops[this._activePoint][0] * size;
    }

    onMouseMove = (event) => {
        if (this.state.mousePressed) {
            let dx = event.screenX - this._startX;
            let g = clone(this.state.gradient);
            let stopPoint = g.stops[this._activePoint];
            g.stops[this._activePoint] = [(this._originalX + dx) / this._size,  stopPoint[1] ];
            this.setState({ gradient: g });
            this._refreshCanvas();
        }
    }

    onMouseUp = (event) => {
        window.document.removeEventListener("mousemove", this.onMouseMove);
        window.document.removeEventListener("mouseup", this.onMouseUp);
        this.setState({ mousePressed: false });
    }

    componentDidUpdate() {
        this._refreshCanvas();
    }

    componentDidMount() {
        var canvas = this.refs.canvas;
        var line = this.refs.line;
        canvas.width = line.clientWidth;
        canvas.height = line.clientHeight;
        this.ctx = canvas.getContext("2d");
        this._refreshCanvas();
    }

    _refreshCanvas() {
        let width = this.refs.line.clientWidth;
        let ctx = this.ctx;
        if(!ctx) {
            return;
        }
        let grd = ctx.createLinearGradient(0, 0, width, LineSize);
        for(var s of this.state.gradient.stops) {
            grd.addColorStop(s[0], s[1]);
        }

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, LineSize);
    }

    render() {
        var g = this.state.gradient;

        return <div ref="line" onMouseDown={this.onMouseDown} className="linear-gradient" >
            <canvas ref="canvas"  className="linear-gradient__canvas"></canvas>
            {g.stops.map((s, idx) => <LinearGradientPoint value={s} active={idx === this.state.activePoint} />)}
        </div>
    }
}

export default class LinearGradientPicker extends Component<any, any> {

    constructor(props) {
        super(props);

        var gradient = { x1:0.5, y1:0, x2:0.5, y2:1, stops: [[0, 'red'], [1, 'green']] };
        this.state = {gradient:gradient, color:gradient.stops[0][1], activePoint:0};
    }

    onColorPickerChange = color => {
        let cssColor;
        if (color.rgb.a && color.rgb.a !== 1) {
            var rgba = color.rgb;
            cssColor = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
        }
        else {
            // brush = Brush.createFromColor(color.hex);
            cssColor = color.hex;
        }
        var gradient = clone(this.state.gradient);
        gradient.stops[this.state.activePoint][1] = cssColor;
        this.setState({ color: cssColor, gradient:gradient });
        // this.selectBrush(brush);
        this.props.onChangeComplete(gradient);
    };

    _onActivePointChanged = (index) => {
        this.setState({activePoint:index, color:this.state.gradient.stops[index][1]});
    }

    render() {
        return <div className="linear-gradient-picker" style={this.props.style}>
            <LinearGradient ref="line" gradient={this.state.gradient} onActivePointChanged={this._onActivePointChanged}/>
            <ColorPicker display={true} color={this.state.color} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onColorPickerChange} presetColors={[]} />

        </div>;
    }
}