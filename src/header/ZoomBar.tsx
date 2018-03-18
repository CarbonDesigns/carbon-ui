import React from 'react';
import { CompositeElement } from "carbon-core";
import cx from 'classnames';
import { app, Environment } from "carbon-core";
import VerticalSlider from "../shared/VerticalSlider";
import EnterInput from "../shared/EnterInput";
import { richApp } from "../RichApp";
import { listenTo, Component } from '../CarbonFlux';
import AppActions from '../RichAppActions';
import { default as bem, join_bem_mods } from '../utils/commonUtils';
import appStore from "../AppStore";
import styled from "styled-components";
import icons from "../theme-icons";
import theme from "../theme";
import IconButton from '../components/IconButton';
import FlyoutButton from '../shared/FlyoutButton';

class ContiniouseAction extends Component<any> {
    stopExecution = true;

    _onMouseDown = (event) => {
        app.actionManager.invoke(this.props.action);
        var that = this;
        function invokeByTimer() {
            if (!that.stopExecution) {
                setTimeout(function () {
                    app.actionManager.invoke(that.props.action);
                    invokeByTimer();
                }, 50);
            }
        }
        this.stopExecution = false;
        setTimeout(function () {
            invokeByTimer();
        }, 200);

        event.stopPropagation();
        window.addEventListener('blur', this._onMouseUp);
        document.addEventListener('mouseup', this._onMouseUp);
    }

    _onMouseUp = (event) => {
        this.stopExecution = true;
        event.preventDefault();
        event.stopPropagation();
        window.removeEventListener('blur', this._onMouseUp);
        document.removeEventListener('mouseup', this._onMouseUp);
    }

    render() {
        return <IconButton icon={this.props.icon} tabIndex={this.props.tabIndex} title={this.formatLabel(this.props.action)} onMouseDown={this._onMouseDown} onMouseUp={this._onMouseUp} />
    }
}

class ZoomMenuAction extends Component<any> {
    _onMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    _onClick = (event) => {
        if (this.props.disabled) {
            return;
        }
        app.actionManager.invoke(this.props.action)
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        return (<span className="zoom__scale" title={this.formatLabel(this.props.action)} onMouseDown={this._onMouseDown} onClick={this._onClick}>
            {this.formatLabel(this.props.action)}
        </span>)
    }
}

class ZoomMenuDropAction extends ZoomMenuAction {
    render() {
        var className = cx("zoom__action", { zoom__action_disabled: this.props.disabled });

        return (
            <div className={className} title={this.formatLabel(this.props.action)} onMouseDown={this._onMouseDown} onClick={this._onClick}>
                <span>
                    {this.formatLabel(this.props.action)}
                </span>
            </div>
        )
    }
}

// class ZoomMenu extends Component<any, any> {
//     [name: string]: any;

//     constructor(props) {
//         super(props);
//         this.state = { open: false };
//     }

//     private toggle(event = null) {
//         this.setState({ open: !this.state.open });
//         event && event.stopPropagation();
//     }
//     private close = () => {
//         this.setState({ open: false });
//     };

//     _onMouseDown = (event) => {
//         this.toggle();
//         document.addEventListener('mousemove', this._onMouseMove);
//         document.addEventListener('mouseup', this._onMouseUp);
//         this._startValue = event.clientY;
//         this.props.onBeginDeltaChange && this.props.onBeginDeltaChange();
//     }

//     _onMouseUp = () => {
//         document.removeEventListener('mousemove', this._onMouseMove);
//         document.removeEventListener('mouseup', this._onMouseUp);
//         this.props.onEndDeltaChange && this.props.onEndDeltaChange();
//     }

//     _onMouseMove = (event) => {
//         var dv = event.clientY - this._startValue;
//         this.props.onDelta && this.props.onDelta(dv);
//     }

//     render() {
//         let mods = join_bem_mods(this.props.mods, {
//             down: false,
//             open: this.state.open
//         });
//         let classname = bem('zoom__drop', null, mods, this.props.className);

//         return <div className={classname} tabIndex={2} onMouseDown={this._onMouseDown} onKeyDown={this.onKeyDown} onBlur={this.close}>
//             <i className="ico ico-triangle-up" />
//             <div className="zoom__menu">
//                 {this.props.children}
//             </div>
//         </div>;
//     }
// }


export default class ZoomBar extends Component<any, any> {
    [name: string]: any;

    refs: {
        slider: any;
    }

    constructor(props) {
        super(props);
        this._minZoom = .01;
        this._maxZoom = 16;
        this.state = { scale: appStore.state.scale, selectionCount: 0 };
    }

    @listenTo(appStore)
    onChange() {
        this.setState({ scale: appStore.state.scale, selectionCount: appStore.state.selectionCount });
    }

    renderZoomMenuButton() {
        return <i className="ico ico-triangle-up" />
    }

    _onValueChanged = (value) => {
        var v = 1 - value / 100;
        if (v < 0.5) {
            // range 1 - .25
            v = v / 0.5; // 0..1
            v = (1 - this._minZoom) * v + this._minZoom;
        } else {
            // range 1 - 16
            v = (v - 0.5) / .5; // 0..1
            v = (this._maxZoom - 1) * v + 1
        }

        Environment.view.zoom(v);
    }

    scaleToValue(scale) {
        var v = scale;
        if (v < 1) {
            // range 1 - .25
            // 1=>0  .25=>1
            v = (1 - v) / (1 - this._minZoom);
            v = .5 + v * 0.5; // 0..1
        } else {
            // range 1 - 16
            // 16=>0, 1=>0.5
            v = (this._maxZoom - v) / (this._maxZoom - 1); // 0..1
            v *= 0.5;
        }

        return v * 100;
    }

    onZoomTyped = zoom => {
        if (zoom) {
            zoom = zoom / 100;
            this.setState({ scale: zoom });
            Environment.view.zoom(zoom);
        }
    };

    onKeyDown = e => {
        if (e.keyCode === 38 /* ArrowUp */) {
            let newValue = (this.state.scale * 100 + (e.shiftKey ? 10 : 1)) / 100;
            if (newValue < this._minZoom) {
                newValue = this._minZoom;
            }
            this.setState({ scale: newValue });
            Environment.view.zoom(newValue);
            e.preventDefault();
        } else if (e.keyCode === 40 /*ArrowDown*/) {
            let newValue = (this.state.scale * 100 - (e.shiftKey ? 10 : 1)) / 100;
            if (newValue > this._maxZoom) {
                newValue = this._maxZoom;
            }
            this.setState({ scale: newValue });
            Environment.view.zoom(newValue);
            e.preventDefault();
        }
    }

    render() {
        var scale = this.state.scale;

        return (
            <ZoomBarComponent>
                <ContiniouseAction icon={icons.zoom_out} action="zoomOut" tabIndex="0" />
                <label htmlFor="zoom__input" className="zoom__input-container">
                    <EnterInput dataType="int" size={4} value={~~(scale * 100)} ref="zoomInput"
                        divOnBlur={true}
                        tabIndex={1}
                        onValueEntered={this.onZoomTyped}
                        onKeyDown={this.onKeyDown}
                        className="zoom__input" />
                    <span>%</span>
                    <div className="bg" />
                </label>

                <FlyoutButton renderContent={this.renderZoomMenuButton} position={{ targetVertical: "bottom", targetHorizontal: "right" }}>
                    <ZoomMenu>
                        <div className="zoom__list">
                            <ZoomMenuDropAction action="zoomFit" />
                            <ZoomMenuDropAction action="zoomSelection" disabled={this.state.selectionCount === 0} />
                            <ZoomMenuDropAction action="pageCenter" />
                        </div>
                        <div className="zoom__scales">
                            <ZoomMenuAction action="zoom8:1" />
                            <ZoomMenuAction action="zoom2:1" />
                            <ZoomMenuAction action="zoom100" />
                            <ZoomMenuAction action="zoom1:2" />
                            <ZoomMenuAction action="zoom1:4" />
                        </div>
                        <VerticalSlider ref="slider" value={this.scaleToValue(scale)} valueChanged={this._onValueChanged} />
                    </ZoomMenu>
                </FlyoutButton>
                <ContiniouseAction icon={icons.zoom_in} action="zoomIn" tabIndex="1" />
            </ZoomBarComponent>
        )
    }
}


const ZoomBarComponent = styled.div`
    display: flex;
    align-items: stretch;
    flex-wrap: nowrap;
`;

const ZoomMenu = styled.div`
    background: ${theme.flyout_background};
    min-width:100px;
    min-height:200px;
    display:flex;
`;
