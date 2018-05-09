import * as React from 'react'
import ColorPicker from "../../shared/ui/ColorPicker";
import { Component } from "../../CarbonFlux";
import { util } from "carbon-api";
import { BrushType, Brush, Selection, IUIElement, Invalidate } from "carbon-core";
import LinearGradientDecorator from "./gradient/LinearGradientDecorator";
import styled from 'styled-components';

function LinearGradientPoint(props) {
    let style: any = { left: (props.value[0] * 100) + '%' };
    if (props.active) {
        style.backgroundColor = props.value[1];
    }
    return <GradientPoint key={"p" + props.value[0]} active={props.active} style={style}>

    </GradientPoint>
}

const LineSize = 8;
const GradientPoint = styled.div.attrs<any>({}) `
    width:${LineSize}px;
    border-radius:${LineSize / 2}px;
    height: ${LineSize}px;;
    margin-left: ${-LineSize / 2}px;
    position:absolute;
    pointer-events: none;
    z-index: 10;
    background-color:white;
    border:${(p: any) => p.active ? "2px solid white" : "2px solid rgba(10,10,10, 0.4)"};
`;

class LinearGradient extends React.Component<any, any> {
    refs: {
        canvas: any;
    };

    line: HTMLElement;

    private _startX: number;
    private _startY: number;
    private _size: number;
    private _originalX: number;
    private _activePoint: number;
    private ctx: any;
    private _removedPoint: any;
    private _removedPointIndex: number;

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
        let size = this.line.clientWidth;
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
            if (Math.abs(dy) > 30) {
                if (this._removedPoint) {
                    return;
                }
                this._removedPoint = g.stops[this._activePoint];
                this._removedPointIndex = this._activePoint;

                g.stops.splice(this._activePoint, 1);
                this._activePoint = null;
            } else {
                if (this._removedPoint) {
                    this._activePoint = this._removedPointIndex;
                    g.stops.splice(this._activePoint, 0, this._removedPoint);
                    this._removedPoint = null;
                }

                let stopPoint = g.stops[this._activePoint];
                var p = (this._originalX + dx) / this._size;
                p = Math.max(0, Math.min(1, p));
                g.stops = g.stops.slice();
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
    }

    componentDidMount() {
        var canvas = this.refs.canvas;
        var line = this.line;
        canvas.width = line.clientWidth;
        canvas.height = line.clientHeight;
        this.ctx = canvas.getContext("2d");
        this._refreshCanvas();
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.gradient !== nextProps.gradient) {
            this.setState({ gradient: nextProps.gradient });
        }
    }

    _refreshCanvas() {
        let width = this.line.clientWidth;
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

        return <LinearGradientContainer innerRef={r => this.line = r} onMouseDownCapture={this.onMouseDown} >
            <canvas ref="canvas"></canvas>
            {g.stops.map((s, idx) => <LinearGradientPoint key={"p" + s[0]} value={s} active={idx === this.state.activePoint} />)}
        </LinearGradientContainer>
    }
}

const LinearGradientContainer = styled.div`
    position: relative;
    top:5px;
    width:246px;
    left:10px;
    height: ${LineSize}px;
    overflow: hidden;

    & canvas {
        z-index: 9;
        position: absolute;
        top:0;
        left:0;
        right:0;
        bottom: 0;
    }
`;


export default class LinearGradientPicker extends Component<any, any> {
    private _elements: IUIElement[];
    private _decorator: LinearGradientDecorator;
    private _mouseButtonPressed: boolean;

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
        if (this.props.gradient !== prevProps.gradient) {
            let count = this.props.gradient.stops.length;
            let activePoint = Math.max(this.state.activePoint, count - 1);
            this.setState({ gradient: this.props.gradient, activePoint, color: this.props.gradient.stops[activePoint][1] });
        }
    }

    onColorPickerChange = (color, event) => {
        let cssColor;
        if (color.rgb.a && color.rgb.a !== 1) {
            var rgba = color.rgb;
            cssColor = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
        }
        else {
            // brush = Brush.createFromCssColor(color.hex);
            cssColor = color.hex;
        }
        var gradient = clone(this.props.brush.value);
        gradient.stops = gradient.stops.slice();
        gradient.stops[this.state.activePoint] = [gradient.stops[this.state.activePoint][0], cssColor];
        this.setState({ color: cssColor, gradient: gradient });
        if (this._mouseButtonPressed) {
            this.props.onPreview(Brush.createFromLinearGradientObject(gradient));
        } else {
            this.props.onChangeComplete(gradient);
        }
        Invalidate.requestInteractionOnly();
    };

    componentDidMount() {
        super.componentDidMount();
        if (Selection.elements.length > 0) {
            this._elements = Selection.elements.slice();
            this._decorator = new LinearGradientDecorator((Selection as any).view, this.onGradientChangedExternaly, this._onActivePointChanged);
            this._elements[0].addDecorator(this._decorator);
            this._elements.forEach(e => e.selectFrameVisible(false));
            Selection.refreshSelection();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (this._elements) {
            this._elements[0].removeDecoratorByType(LinearGradientDecorator);
            this._elements.forEach(e => e.selectFrameVisible(true));
            Selection.refreshSelection();
        }
    }

    onGradientChangedExternaly = (value, preview) => {
        if (preview) {
            this.props.onPreview(Brush.createFromLinearGradientObject(value));
        } else {
            this.props.onChangeComplete(value);
        }

        this.setState({ gradient: value });
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
        this.setState({ activePoint: index, color: this.props.brush.value.stops[index][1] });
        if (this._decorator) {
            this._decorator.updateActivePoint(index);
        }
    }

    _onMouseDown = () => {
        this._mouseButtonPressed = true;
        window.addEventListener("mouseup", this._onMouseUp);
    }

    _onMouseUp = () => {
        this._mouseButtonPressed = false;
        window.removeEventListener("mouseup", this._onMouseUp);
        this.props.onChangeComplete(this.state.gradient);
    }

    render() {
        if (this.props.brush.type !== BrushType.lineargradient) {
            return <div></div>;
        }
        return <LinearGradientPickerContainer style={this.props.style}>
            <LinearGradient ref="line" gradient={this.props.brush.value} onActivePointChanged={this._onActivePointChanged} onChange={this.onGradientChanged} onPreview={this.onGradientPreview} />
            <ColorPicker display={true} color={this.state.color} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onColorPickerChange} onMouseDown={this._onMouseDown} presetColors={[]} />
        </LinearGradientPickerContainer>;
    }
}

const LinearGradientPickerContainer = styled.div`
    position: absolute;
    left:0;
    right:0;
    top:0;
    bottom:0;
    display:grid;
    grid-template-rows: 21px 1fr;
    height:100%;
    flex-shrink:0;
`;