import { IMouseEventHandler, KeyboardState, IMouseEventData, IDisposable, AngleAdjuster, NearestPoint, BrushType } from "carbon-core";
import { UIElementDecorator, Environment, ILayer, IContext, IEnvironment, Invalidate, Brush, ChangeMode } from "carbon-core";
import { LayerTypes, ILayerDrawHandlerObject } from "carbon-app";


const PointRadius = 6;
const PointBorder = 1;

export default class LinearGradientDecorator extends UIElementDecorator implements IMouseEventHandler, ILayerDrawHandlerObject {
    _activePoint: number;
    _startX: number;
    _startY: number;
    _movePoint: number = null;
    _gradient: any;
    _contextScale: number = 1;
    _lastGradient: any;
    _dx: number;
    _dy: number;
    _refreshCallback: (value: any, preview: boolean) => void;
    _setActivePointCallback: (value: number) => void;

    constructor(refreshCallback, setActivePointCallback) {
        super();
        this._activePoint = 0;
        this._refreshCallback = refreshCallback;
        this._setActivePointCallback = setActivePointCallback;
    }

    attach(element: any) {
        super.attach(element);
        Environment.view.registerForLayerDraw(LayerTypes.Interaction, this);
        Environment.controller.captureMouse(this);
    }

    detach() {
        super.detach();
        Environment.view.unregisterForLayerDraw(LayerTypes.Interaction, this);
        Environment.controller.releaseMouse(this);
    }

    onLayerDraw(layer: ILayer, context: IContext, environment: any) {
        var brush = this.element.props.fill;
        if (brush.type !== BrushType.lineargradient) {
            return;
        }

        var g = brush.value;
        context.save();

        context.resetTransform();
        context.scale(environment.contextScale, environment.contextScale);
        this._contextScale = environment.contextScale;

        context.lineWidth = 5;
        context.strokeStyle = 'rgba(0,0,0,0.3)';

        var box = this.element.boundaryRect();
        let p1 = this.element.globalViewMatrix().transformPoint2(box.width * g.x1,box.height * g.y1);
        let p2 = this.element.globalViewMatrix().transformPoint2(box.width * g.x2, box.height * g.y2);

        let pp1 = environment.pageMatrix.transformPoint(p1);
        let pp2 = environment.pageMatrix.transformPoint(p2);
        context.moveTo(pp1.x, pp1.y);
        context.lineTo(pp2.x, pp2.y);
        context.stroke();
        context.lineWidth = 3;
        context.strokeStyle = 'rgb(250,250,250)';
        context.stroke();

        this._drawPointsOnLine(context, p1.x, p1.y, p2.x, p2.y, g.stops, environment.pageMatrix);

        context.restore();
    }

    updateActivePoint(index: number) {
        this._activePoint = index;
        Invalidate.requestInteractionOnly();
    }

    _drawPointsOnLine(context: IContext, x1, y1, x2, y2, points, matrix) {
        for (let i = 0; i < points.length; ++i) {
            var s = points[i];
            var x = x1 * (1 - s[0]) + s[0] * x2;
            var y = y1 * (1 - s[0]) + s[0] * y2;
            var p = matrix.transformPoint2(x, y);
            context.circle(p.x, p.y, PointRadius);
            context.lineWidth = 5;
            context.strokeStyle = 'rgba(0,0,0,0.3)';
            context.stroke();
            context.lineWidth = 1;
            context.fillStyle = 'rgb(250,250,250)';
            context.fill();
            if (i === this._activePoint) {
                context.circle(p.x, p.y, (PointRadius - PointBorder));
                context.fillStyle = s[1];
                context.fill();
            }
        }
    }

    _snapToBorderX(newX, box, scale) {
        if (Math.abs(newX - box.x) < 5 / scale) {
            newX = box.x;
        }
        if (Math.abs(newX - box.x - box.width) < 5 / scale) {
            newX = box.x + box.width;
        }

        return newX;
    }

    _snapToBorderY(newY, box, scale) {
        if (Math.abs(newY - box.y) < 5 / scale) {
            newY = box.y;
        }
        if (Math.abs(newY - box.y - box.height) < 5 / scale) {
            newY = box.y + box.height;
        }
        return newY;
    }

    mousemove(event: IMouseEventData, keys: KeyboardState) {
        if (this._movePoint !== null) {
            let g = this._gradient;
            let pos = this.element.globalViewMatrixInverted().transformPoint(event);
            let dx = this._startX - pos.x;
            let dy = this._startY - pos.y;

            let box = this.element.boundaryRect();
            let scale = Environment.view.scale();

            let gClone = clone(g);
            if (this._movePoint === 0) {
                let newX = g.x1 * box.width - dx;
                let newY = g.y1 * box.height - dy;
                if (event.event.shiftKey) {
                    let p = AngleAdjuster.adjust({ x: g.x2 * box.width, y: g.y2 * box.height }, { x: newX, y: newY });
                    newX = p.x;
                    newY = p.y;
                } else if (!event.event.ctrlKey) {
                    newX = this._snapToBorderX(newX, { x: 0, y: 0, width: box.width }, scale);
                    newY = this._snapToBorderX(newY, { x: 0, y: 0, width: box.width }, scale);
                }

                gClone.x1 = newX / box.width;
                gClone.y1 = newY / box.height;
            } else if (this._movePoint === g.stops.length - 1) {
                let newX = g.x2 * box.width - dx;
                let newY = g.y2 * box.height - dy;

                if (event.event.shiftKey) {
                    let p = AngleAdjuster.adjust({ x: g.x1 * box.width, y: g.y1 * box.height }, { x: newX, y: newY });
                    newX = p.x;
                    newY = p.y;
                } else if (!event.event.ctrlKey) {
                    newX = this._snapToBorderX(newX, { x: 0, y: 0, width: box.width }, scale);
                    newY = this._snapToBorderX(newY, { x: 0, y: 0, width: box.width }, scale);
                }

                gClone.x2 = newX / box.width;
                gClone.y2 = newY / box.height;
            } else {
                let x1 = g.x1 * box.width + box.x;
                let y1 = g.y1 * box.height + box.y;
                let x2 = g.x2 * box.width + box.x;
                let y2 = g.y2 * box.height + box.y;
                let outPoint = { x: 0, y: 0 };
                NearestPoint.onLine({ x: x1, y: y1 }, { x: x2, y: y2 }, { x: pos.x - this._dx, y: pos.y - this._dy }, outPoint);

                var p = 0;
                if (x2 !== x1) {
                    p = (outPoint.x - x1) / (x2 - x1);
                } else if (y2 !== y1) {
                    p = (outPoint.y - y1) / (y2 - y1);
                }

                gClone.stops = gClone.stops.slice();
                gClone.stops[this._movePoint] = [p, gClone.stops[this._movePoint][1]];
            }

            this._refreshCallback(gClone, true);
            this._lastGradient = gClone;
            Invalidate.requestInteractionOnly();
        }
    }

    mouseup(event: IMouseEventData, keys: KeyboardState) {
        if (this._movePoint !== null) {
            this._movePoint = null;
            if (this._lastGradient) {
                this._refreshCallback(this._lastGradient, false);
                this._lastGradient = null;
                Invalidate.requestInteractionOnly();
            }
        }
    }

    mousedown(event: IMouseEventData, keys: KeyboardState) {
        var brush = this.element.props.fill;
        if (brush.type !== BrushType.lineargradient) {
            return;
        }

        var g = brush.value;
        var box = this.element.boundaryRect();
        let p1 = this.element.globalViewMatrix().transformPoint2(box.width * g.x1,box.height * g.y1);
        let p2 = this.element.globalViewMatrix().transformPoint2(box.width * g.x2, box.height * g.y2);


        let r = (PointRadius + 3) * this._contextScale / Environment.view.scale();

        for (let i = 0; i < g.stops.length; ++i) {
            var s = g.stops[i];
            var x = p1.x * (1 - s[0]) + s[0] * p2.x;
            var y = p1.y * (1 - s[0]) + s[0] * p2.y;
            var dx = event.x - x;
            var dy = event.y - y;

            if (dx * dx + dy * dy < r * r) {
                let start = this.element.globalViewMatrixInverted().transformPoint(event);
                this._startX = start.x;
                this._startY = start.y;
                this._dx = dx;
                this._dy = dy;
                this._movePoint = i;
                this._setActivePointCallback(i);
                this._gradient = g;
                event.handled = true;
                event.event.preventDefault();
                event.event.stopImmediatePropagation();
                break;
            }
        }
    }

    dblclick(event: IMouseEventData, scale: number) {

    }

    click(event: IMouseEventData) {

    }
}