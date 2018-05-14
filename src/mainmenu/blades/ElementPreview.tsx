import * as React from "react";
import { Component } from "../../CarbonFlux";
import bem from "../../utils/commonUtils";
import { Rect, IRect, renderer, Workspace } from "carbon-core";
import { IUIElement } from "carbon-model";

function b(a, b?, c?) { return bem("edit-image", a, b, c) }

interface ElementPreviewProps {
    element?: IUIElement;
    dpr: number;
    className?: string;
}

export class ElementPreview extends Component<ElementPreviewProps> {
    refs: {
        canvas: HTMLCanvasElement
    }

    private _context: CanvasRenderingContext2D;
    private _image: HTMLImageElement;
    private _sourceRect: IRect;
    private _targetRect: IRect;

    componentDidMount() {
        super.componentDidMount();
        this._context = this.initCanvas(this.refs.canvas);

        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    toDataUrl(){
        return this._image.src;
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

    private update() {
        if (!this.props.element) {
            this.drawEmptyBackground();
            return;
        }

        var image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload = () => {
            this._sourceRect = new Rect(0, 0, image.width, image.height);
            this._targetRect = this._sourceRect.fit(new Rect(0, 0, this.refs.canvas.width/this.props.dpr, this.refs.canvas.height/this.props.dpr));

            this._context.save();
            this._context.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

            this._context.fillStyle = Workspace.settings.general.pageFill;
            this._context.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)

            this._context.drawImage(this._image,
                this._sourceRect.x, this._sourceRect.y, this._sourceRect.width, this._sourceRect.height,
                this._targetRect.x, this._targetRect.y, this._targetRect.width, this._targetRect.height);

            this._context.restore();
        };

        image.src = renderer.elementToDataUrl(this.props.element, this.props.dpr);
        this._image = image;
    }

    private drawEmptyBackground() {
        this._context.save();

        this._context.fillStyle = Workspace.settings.general.pageFill;
        this._context.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)

        this._context.restore();
    }

    render() {
        return <canvas className={this.props.className} ref="canvas"/>
    }
}