// deprecated
import { Component } from '../CarbonFlux';
import React from 'react';
import LayoutActions from './LayoutActions';
import { app } from "../RichApp";
import { LayoutDockPosition, IAreaConstraint } from "carbon-core";
import cx from "classnames";

interface IResizerProps extends IReactElementProps {
    v: number[];
    panel: any;
}

class Resizer extends Component<IResizerProps> {
    public static Size: number = 3;

    private lastX: number;
    private lastY: number;
    private rect: any;

    constructor(props) {
        super(props);
    }

    onMouseDown = (e) => {
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);

        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.rect = {
            x: this.props.panel.x,
            y: this.props.panel.y,
            w: this.props.panel.width,
            h: this.props.panel.height
        }

        e.preventDefault();
        e.stopPropagation();

        this.setState({ resizing: true });
        return false;
    }

    onMouseUp = (e) => {
        var body = document.body;

        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mousemove', this.onMouseMove);

        e.preventDefault();

        return false;
    }

    onMouseMove = (e) => {
        var newX = e.clientX;
        var newY = e.clientY;

        var dx = this.props.v[0] * (newX - this.lastX);
        var dy = this.props.v[1] * (newY - this.lastY);
        var dw = this.props.v[2] * (newX - this.lastX);
        var dh = this.props.v[3] * (newY - this.lastY);

        var changes = {
            x: this.rect.x + dx,
            y: this.rect.y + dy,
            width: this.rect.w + dw,
            height: this.rect.h + dh,
            index: this.props.panel.index
        }

        app.dispatch(LayoutActions.resizingPanel(changes, false));

        e.preventDefault();
        return false;
    }

    render() {
        return <div className={this.props.className} onMouseDown={this.onMouseDown}></div>;
    }
}

interface IPanelContainerProps extends IReactElementProps {
    container: any;
    minimized: boolean;
    temporaryVisiblePanel: string;
    zIndex: number;
}

function dockToString(dock: LayoutDockPosition): string {
    switch (dock) {
        case LayoutDockPosition.Left:
            return 'left';
        case LayoutDockPosition.Top:
            return 'top';
        case LayoutDockPosition.Right:
            return 'right';
        case LayoutDockPosition.Bottom:
            return 'bottom';
        case LayoutDockPosition.Fill:
            return 'fill';
    }
}

export default class PanelContainer extends Component<IPanelContainerProps> {

    _renderResizers() {
        if (!this.props.container.floating) {
            return;
        }

        return [
            <Resizer className="panel-resizer panel-resizer_top" v={[0, 1, 0, -1]} panel={this.props.container}></Resizer>,
            <Resizer className="panel-resizer panel-resizer_bottom" v={[0, 0, 0, 1]} panel={this.props.container}></Resizer>,
            <Resizer className="panel-resizer panel-resizer_left" v={[1, 0, -1, 0]} panel={this.props.container}></Resizer>,
            <Resizer className="panel-resizer panel-resizer_right" v={[0, 0, 1, 0]} panel={this.props.container}></Resizer>,
            <Resizer className="panel-resizer panel-resizer_nw" v={[1, 1, -1, -1]} panel={this.props.container}></Resizer>,
            <Resizer className="panel-resizer panel-resizer_ne" v={[0, 1, 1, -1]} panel={this.props.container}></Resizer>,
            <Resizer className="panel-resizer panel-resizer_se" v={[0, 0, 1, 1]} panel={this.props.container}></Resizer>,
            <Resizer className="panel-resizer panel-resizer_sw" v={[1, 0, -1, 1]} panel={this.props.container}></Resizer>,
        ];
    }

    getAbsoluteStyle(container: any) {
        var style = {};

        style['position'] = 'absolute';
        style['height'] = container.height;
        style['width'] = container.width;
        style['left'] = container.x;
        style['top'] = container.y;
        //perf: Chrome seems to render layers better when z-index is not specified
        //style['zIndex'] = this.props.zIndex;

        return style;
    }

    _onMouseDown=(e) => {
        if (this.props.container.panelName === this.props.temporaryVisiblePanel) {
            e.stopPropagation();
        }
    }

    render() {
        var container = this.props.container;
        var classNames = cx(
            `lbox lbox_${dockToString(container.collapseDirection)}`,
            container.className,
            {
                autohide: container.collapsed || (this.props.minimized && !container.fixed),
                tmpVisible: container.panelName === this.props.temporaryVisiblePanel,
                floating: container.floating
            }
        );

        return (
            <div className={classNames}
                name={this.props.container.panelName}
                data-index={container.index}
                onMouseDown={this._onMouseDown}
                style={this.getAbsoluteStyle(this.props.container)}
            >
                {this.props.children}

                {this._renderResizers()}
                <div className="lbox_catcher">
                    <div className="lbox_catcher__point up"></div>
                    <div className="lbox_catcher__point left"></div>
                    <div className="lbox_catcher__point down"></div>
                    <div className="lbox_catcher__point right"></div>
                </div>
            </div>);
    }
}
