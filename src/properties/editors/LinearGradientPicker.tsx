import React from 'react'
import cx from "classnames";
import ColorPicker from "./ColorPicker";
import { Component } from "../../CarbonFlux";
import { util } from "carbon-api";
import { BrushType, Brush, Selection, IUIElement, Invalidate } from "carbon-core";
import LinearGradientDecorator from "./gradient/LinearGradientDecorator";

function LinearGradientPoint(props) {
    let style: any = { left: (props.value[0] * 100) + '%' };
    if (props.active) {
        style.backgroundColor = props.value[1];
    }
    return <div key={"p"+props.value[0]} className={cx("linear-gradient__point", { active: props.active })} style={style}>

    </div>
}

const LineSize = 16;

class LinearGradient extends React.Component<any, any> {
    refs: {
        line: HTMLElement;
        canvas: any;
    };

    private _startX: number;
    private _startY: number;
    private _size: number;
    private _originalX: number;
    private _activePoint: number;
    private ctx: any;
    private _removedPoint: any;
    private _removedPointIndex:number;

    constructor(props, context) {
        super(props, context);
        this.state = { activePoint: 0, gradient: clone(this.props.gradient) };
    }

    setActivePoint(index) {
        this._activePoint = index;
        this.setState({ activePoint: index });
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
            if (x >= stopCenter - LineSize / 2 && x <= stopCenter + LineSize / 2) {
                this.setActivePoint(i);
                clickExisting = true;
                break;
            }
        }

        let g = this.state.gradient;
        if (!clickExisting) {
            let newGradient = clone(this.state.gradient);
            newGradient.stops = newGradient.stops.slice();
            for (let i = newGradient.stops.length - 1; i > 0; --i) {
                if (newGradient.stops[i - 1][0] < pcnt) {
                    var imageData = this.ctx.getImageData(0, 0, size, 1);
                    var color = util.imageDataPointToCssColor(imageData.data, x);
                    newGradient.stops.splice(i, 0, [pcnt, color]);
                    this.setState({ gradient: newGradient });
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
        this._startY = event.screenY;
        this._size = size;
        this._originalX = g.stops[this._activePoint][0] * size;
    }

    onMouseMove = (event) => {
        if (this.state.mousePressed) {
            let dx = event.screenX - this._startX;
            let dy = event.screenY - this._startY;
            let g = clone(this.state.gradient);
            if(Math.abs(dy) > 30) {
                if(this._removedPoint)  {
                    return;
                }
                this._removedPoint = g.stops[this._activePoint];
                this._removedPointIndex = this._activePoint;

                g.stops.splice(this._activePoint, 1);
                this._activePoint = null;
            } else {
                if(this._removedPoint) {
                    this._activePoint = this._removedPointIndex;
                    g.stops.splice(this._activePoint, 0, this._removedPoint);
                    this._removedPoint = null;
                }

                let stopPoint = g.stops[this._activePoint];
                var p = (this._originalX + dx) / this._size;
                p = Math.max(0,  Math.min(1, p));
                g.stops[this._activePoint] = [p, stopPoint[1]];
            }

            this.setState({ gradient: g });
            this.props.onPreview(g);
            this._refreshCanvas();
        }
    }

    onMouseUp = (event) => {
        window.document.removeEventListener("mousemove", this.onMouseMove);
        window.document.removeEventListener("mouseup", this.onMouseUp);
        this.setState({ mousePressed: false });
        this._removedPoint = null;
        this.props.onChange(this.state.gradient);
    }

    componentDidUpdate(prevProps) {
        this._refreshCanvas();
        if(this.props.gradient !== prevProps.gradient) {
            this.setState({  gradient: this.props.gradient });
        }
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
        if (!ctx) {
            return;
        }
        let grd = ctx.createLinearGradient(0, 0, width, LineSize);
        for (var s of this.state.gradient.stops) {
            grd.addColorStop(s[0], s[1]);
        }

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, LineSize);
    }

    render() {
        var g = this.state.gradient;

        return <div ref="line" onMouseDown={this.onMouseDown} className="linear-gradient" >
            <canvas ref="canvas" className="linear-gradient__canvas"></canvas>
            {g.stops.map((s, idx) => <LinearGradientPoint value={s} active={idx === this.state.activePoint} />)}
        </div>
    }
}

export default class LinearGradientPicker extends Component<any, any> {
    private _elements: IUIElement[];
    private _decorator: LinearGradientDecorator;

    constructor(props) {
        super(props);

        var brush = props.brush;
        let gradient;
        if (brush.type === BrushType.color) {
            gradient = { x1: 0.5, y1: 0, x2: 0.5, y2: 1, stops: [[0, brush.value], [1, brush.value]] };
        } else if (brush.type === BrushType.lineargradient) {
            gradient = brush.value;
        }
        this.state = { gradient: gradient, color: gradient.stops[0][1], activePoint: 0 };
    }

    componentDidUpdate(prevProps) {
        if(this.props.gradient !== prevProps.gradient) {
            let count = this.props.gradient.stops.length;
            let activePoint = Math.max(this.state.activePoint, count - 1);
            this.setState({  gradient: this.props.gradient, activePoint, color:this.props.gradient.stops[activePoint][1] });
        }
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
        gradient.stops = gradient.stops.slice();
        gradient.stops[this.state.activePoint][1] = cssColor;
        this.setState({ color: cssColor, gradient: gradient });
        this.props.onChangeComplete(gradient);
        Invalidate.requestInteractionOnly();
    };

    componentDidMount() {
        super.componentDidMount();
        if(Selection.elements.length > 0) {
            this._elements = Selection.elements.slice();
            this._decorator = new LinearGradientDecorator(this.onGradientChangedExternaly);
            this._elements[0].addDecorator(this._decorator);
            this._elements.forEach(e=>e.selectFrameVisible(false));
            Selection.refreshSelection();
        }
    }

    componentWillUnmount() {
        if(this._elements) {
            this._elements[0].removeDecoratorByType(LinearGradientDecorator);
            this._elements.forEach(e=>e.selectFrameVisible(true));
            Selection.refreshSelection();
        }
    }

    onGradientChangedExternaly = (value) => {
        this.setState({gradient:value});
        this.props.onChangeComplete(value);
    }

    onGradientChanged = (value) => {
        this.props.onChangeComplete(value);
        Invalidate.requestInteractionOnly();
    }

    onGradientPreview = (value) => {
        this.props.onPreview(Brush.createFromLinearGradientObject(value));
        Invalidate.requestInteractionOnly();
    }

    _onActivePointChanged = (index) => {
        this.setState({ activePoint: index, color: this.state.gradient.stops[index][1] });
        this._decorator.updateActivePoint(index);
    }

    render() {
        return <div className="linear-gradient-picker" style={this.props.style}>
            <LinearGradient ref="line" gradient={this.state.gradient} onActivePointChanged={this._onActivePointChanged} onChange={this.onGradientChanged} onPreview={this.onGradientPreview}/>
            <ColorPicker display={true} color={this.state.color} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onColorPickerChange} presetColors={[]} />

        </div>;
    }
}