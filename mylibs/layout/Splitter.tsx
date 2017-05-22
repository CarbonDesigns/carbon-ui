import { Component } from '../CarbonFlux';
import React from 'react';
import cx from 'classnames';
import immutable from 'immutable';
import LayoutActions from './LayoutActions';
import { richApp } from "../RichApp";
import { LayoutDirection, LayoutDockPosition } from "carbon-core";
import layoutStore from './LayoutStore';

interface ISplitterProps extends IReactElementProps {
    panel1: any;
    panel2: any;
    direction: any;
    layout: any;
}

interface ISplitterState {
    resizing: boolean;
}

export default class Splitter extends Component<ISplitterProps, ISplitterState> {
    public static Size: number = 3;

    private _onMouseUp: any;
    private _onMouseMove: any;
    private _lastX: number;
    private _lastY: number;
    private _panel1Size: number;
    private _panel2Size: number;
    private maxSize: number;

    constructor(props) {
        super(props);
        this.state = { resizing: false };
    }

    onMouseDown = (e) => {
        e.stopPropagation();
        var body = document.body;        // TODO: use hammer js
        this._onMouseUp = this.onMouseUp.bind(this);
        this._onMouseMove = this.onMouseMove.bind(this);
        document.addEventListener('mouseup', this._onMouseUp);
        body.addEventListener('mousemove', this._onMouseMove);

        this._lastX = e.clientX;
        this._lastY = e.clientY;

        richApp.dispatch(LayoutActions.startResizing());

        var panel1 = layoutStore.getRenderedPanelByIndex(this.props.panel1.index);
        if (this.props.direction === LayoutDirection.Row) {
            this._panel1Size = panel1.width;
        } else {
            this._panel1Size = panel1.height;
        }

        if (this.props.panel2) {
            var panel2 = layoutStore.getRenderedPanelByIndex(this.props.panel2.index);
            if (this.props.direction === LayoutDirection.Row) {
                this.maxSize = panel1.width + panel2.width - this.props.panel2.minSize;
                this._panel2Size = panel2.width;
            } else {
                this.maxSize = panel1.height + panel2.height - this.props.panel2.minSize;
                this._panel2Size = panel2.height;
            }
        }

        e.preventDefault();
        e.stopPropagation();
        this.setState({ resizing: true });
        return false;
    }

    onMouseUp(e) {
        var body = document.body;

        document.removeEventListener('mouseup', this._onMouseUp);
        body.removeEventListener('mousemove', this._onMouseMove);

        richApp.dispatch(LayoutActions.stopResizing());
        this.setState({ resizing: false });
        e.preventDefault();

        if (this.props.panel1) {
            richApp.dispatch(LayoutActions.resizePanel(this.props.panel1, (this.props.direction === LayoutDirection.Row) ? this.props.panel1.width : this.props.panel1.height));
        }

        if (this.props.panel2) {
            richApp.dispatch(LayoutActions.resizePanel(this.props.panel2, (this.props.direction === LayoutDirection.Row) ? this.props.panel2.width : this.props.panel2.height));
        }

        return false;
    }

    _updatePanelSize(panel, originalSize, newSize, recalculate) {
        var vertical = true;
        var ds = 0;
        if (this.props.direction === LayoutDirection.Row) {
            vertical = false;
        }

        if (vertical) {
            let maxSize = this.maxSize;
            panel.height = newSize;
            if (panel.height < panel.minSize) {
                panel.height = panel.minSize;
            } else if (panel.height >= maxSize) {
                panel.height = maxSize;
            }
            ds = originalSize - panel.height;
        } else {
            let maxSize = this.maxSize;
            panel.width = newSize;
            if (panel.width < panel.minSize) {
                panel.width = panel.minSize;
            } else if (panel.width >= maxSize) {
                panel.width = maxSize;
            }
            ds = originalSize - panel.width;
        }

        richApp.dispatch(LayoutActions.resizingPanel(panel, recalculate));

        this.props.layout.refresh();
        return ds;
    }

    onMouseMove(e) {
        var newX = e.clientX;
        var newY = e.clientY;

        var ds;
        if (this.props.direction === LayoutDirection.Row) {
            ds = (newX - this._lastX);
        } else {
            ds = (newY - this._lastY);
        }

        if(!this.props.panel2 && (this.props.panel1.collapseDirection === LayoutDockPosition.Right || this.props.panel1.collapseDirection === LayoutDockPosition.Bottom)) {
            ds = -ds;
        }

        ds = this._updatePanelSize(this.props.panel1, this._panel1Size, this._panel1Size + ds, !!this.props.panel2);
        if(this.props.panel2) {
            this._updatePanelSize(this.props.panel2, this._panel2Size, this._panel2Size + ds, true);
        }

        e.preventDefault();
        return false;
    }

    render() {
        var classes = { "lsplitter_dragging": this.state.resizing };
        var splitter_direction = this.props.direction === LayoutDirection.Row ? 'vertical' : 'horizontal';
        classes["lsplitter lsplitter_" + splitter_direction] = true;

        return (
            <div className={cx(classes)} style={this.props.style} onMouseDown={this.onMouseDown}></div>
        );
    }

}
