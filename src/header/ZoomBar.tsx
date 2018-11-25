import * as React from "react";
import { app } from "carbon-core";
import Slider from "../components/Slider";
import EnterInput from "../shared/EnterInput";
import { listenTo, Component } from '../CarbonFlux';
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
        return <IconButton width={36} height={46} icon={this.props.icon} tabIndex={this.props.tabIndex} title={this.formatLabel(this.props.action)} onMouseDown={this._onMouseDown} onMouseUp={this._onMouseUp} />
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
        return (<ZoomScale title={this.formatLabel(this.props.action)} onMouseDown={this._onMouseDown} onClick={this._onClick}>
            {this.formatLabel(this.props.action)}
        </ZoomScale>)
    }
}

class ZoomMenuDropAction extends ZoomMenuAction {
    render() {
        return (
            <ZoomAction disabled={this.props.disabled } title={this.formatLabel(this.props.action)} onMouseDown={this._onMouseDown} onClick={this._onClick}>
                <span>
                    {this.formatLabel(this.props.action)}
                </span>
            </ZoomAction>
        )
    }
}

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
        if(!this.mounted) {
            return;
        }
        this.setState({ scale: appStore.state.scale, selectionCount: appStore.state.selectionCount });
    }

    renderZoomMenuButton() {
        return <IconButton icon={icons.triangle_down} width={20} height={46}></IconButton>
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

        app.actionManager.invoke("zoom", v);
        return value;
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
            app.actionManager.invoke("zoom", zoom);
        }
    };

    onKeyDown = e => {
        if (e.keyCode === 38 /* ArrowUp */) {
            let newValue = (this.state.scale * 100 + (e.shiftKey ? 10 : 1)) / 100;
            if (newValue < this._minZoom) {
                newValue = this._minZoom;
            }
            this.setState({ scale: newValue });
            app.actionManager.invoke("zoom", newValue);
            e.preventDefault();
        } else if (e.keyCode === 40 /*ArrowDown*/) {
            let newValue = (this.state.scale * 100 - (e.shiftKey ? 10 : 1)) / 100;
            if (newValue > this._maxZoom) {
                newValue = this._maxZoom;
            }
            this.setState({ scale: newValue });
            app.actionManager.invoke("zoom", newValue);
            e.preventDefault();
        }
    }

    render() {
        var scale = this.state.scale;

        return (
            <ZoomBarComponent>
                <ContiniouseAction icon={icons.zoom_out} action="zoomOut" tabIndex="0" />
                <ZoomInputLabel htmlFor="zoom__input">
                    <ZoomInput dataType="int" size={4} value={~~(scale * 100)}
                        divOnBlur={true}
                        tabIndex={1}
                        onValueEntered={this.onZoomTyped}
                        onKeyDown={this.onKeyDown}
                        name="zoom__input" />
                    <span>%</span>
                    <div className="bg" />
                </ZoomInputLabel>

                <FlyoutButton renderContent={this.renderZoomMenuButton} position={{ targetVertical: "bottom", targetHorizontal: "right", sourceHorizontal: "right" }}>
                    <ZoomMenu>
                        <ZoomList>
                            <ZoomMenuDropAction action="zoomFit" />
                            <ZoomMenuDropAction action="zoomSelection" disabled={this.state.selectionCount === 0} />
                            <ZoomMenuDropAction action="pageCenter" />
                        </ZoomList>
                        <ZoomScales>
                            <ZoomMenuAction action="zoom8:1" />
                            <ZoomMenuAction action="zoom2:1" />
                            <ZoomMenuAction action="zoom100" />
                            <ZoomMenuAction action="zoom1:2" />
                            <ZoomMenuAction action="zoom1:4" />
                        </ZoomScales>
                        <Slider ref="slider" vertical={true} value={this.scaleToValue(scale)} valueChanging={this._onValueChanged} />
                    </ZoomMenu>
                </FlyoutButton>
                <ContiniouseAction icon={icons.zoom_in} action="zoomIn" tabIndex="1" />
            </ZoomBarComponent>
        )
    }
}

const ZoomList = styled.div`
    display: flex;
    flex-direction: column;
`;

const ZoomScales = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 40px;
`;


const ZoomBarComponent = styled.div`
    display: flex;
    align-items: stretch;
    flex-wrap: nowrap;
`;

const ZoomMenu = styled.div`
    background: ${theme.flyout_background};
    color: ${theme.text_color};
    min-width:100px;
    min-height:200px;
    display:flex;
    box-shadow: ${theme.flyout_shadow};
    border-radius: 2px;
`;

const ZoomInputLabel = styled.div.attrs<any>({}) `
    width: 46px;
    box-sizing: border-box;
    height: 100%;

    /* .middler; */
    position:relative;
    display:flex;
    align-items:center;

    span {
        font-size:14px;
        color: ${theme.text_color};
        opacity: 0.4;
    }

    .bg{
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        z-index: -1;
    }
`
const ZoomInput = styled(EnterInput) `
    background-color: transparent;
    text-align: right;
    width:100%;
    z-index: 1;
    padding-right : 3px;

    color: ${theme.text_color};
    font-size:14px;

    &:focus {
        color: ${theme.text_color};

        & ~ .bg { background-color: white; }
        & ~ span { color: ${theme.text_color}; }
    }
`

const ZoomScale = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color:${theme.text_color};
    cursor:pointer;
    &:hover {
        color:${theme.accent};
    }
`;

const ZoomAction = styled.div.attrs<{disabled:boolean}>({})`
    flex: 1;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor:pointer;
    color:${(props:any)=>props.disabled?theme.text_disabled:theme.text_color};

    &:hover {
        color:${theme.accent};
    }
`;