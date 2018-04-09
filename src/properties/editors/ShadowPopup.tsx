import * as React from "react";
import * as ReactDom from "react-dom";
import ColorPicker from "../../shared/ui/ColorPicker";
import {Component, dispatch} from "../../CarbonFlux";
import {TabContainer, TabTabs, TabPage, TabArea} from "../../shared/TabContainer";
import bem from "../../utils/commonUtils";
import { GuiInput, GuiSlider, GuiInputMod } from "../../shared/ui/GuiComponents";
import { FormattedMessage } from "react-intl";
import ArrowKeyModifier from "../../shared/ui/ArrowKeyModifier";
import GuiNumericInput from "../../shared/ui/GuiNumericInput";
import { util } from "carbon-core";
import CarbonActions from "../../CarbonActions";
import { TabAreaStyled, TabPageStyled } from "../../components/CommonStyle";


var b = function (elem = null, mods = null, mix = null) {
    return bem("shadow-editor", elem, mods, mix)
};
var shadow_label = function (id, defaultMessage, mods = null) {
    return <div className={b("label", mods)}><FormattedMessage id={id} defaultMessage={defaultMessage}/></div>
};

function rgbaToString(rgba){
    return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
}

class ShadowDirection extends Component<any, any> {
    private _height: number;
    private _width: number;
    private _offsetY: number;
    private _offsetX: number;
    private _slider: HTMLElement;
    private _handle: HTMLElement;
    private _dragging: boolean;

    refs: {
        handle: HTMLElement,
        slider: HTMLElement
    }

    constructor(props) {
        super(props);
        this.state = this.propsToState(props);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.propsToState(nextProps));
    }

    propsToState(props) {
        return {x: this.props.x + .5, y: this.props.y + .5};
    }

    _onMouseDown = (event)=> {
        event.preventDefault();
        event.stopPropagation();
        this._height = this._slider.clientHeight;
        this._offsetY = this._slider.getBoundingClientRect().top;
        this._width = this._slider.clientWidth;
        this._offsetX = this._slider.getBoundingClientRect().left;
        this._updatePositionFromEvent(event);
    };

    _handleDragging = (event)=> {
        if (this._dragging) {
            this._updatePositionFromEvent(event);
        }
    };

    _updatePositionFromEvent = (event)=> {
        var x = event.clientX - this._offsetX;
        var maxx = (x / this._width) * 100;
        var y = event.clientY - this._offsetY;
        var maxy = (y / this._height) * 100;

        if (maxx > 100) maxx = 100;
        else if (maxx < 0) maxx = 0;
        if (maxy > 100) maxy = 100;
        else if (maxy < 0) maxy = 0;

        if (this.props.valueChanging) {
            maxx = this.props.valueChanging(maxx / 100 - 0.5, maxy / 100 - 0.5);
        }
        this._handle.style.left = maxx + '%';
        this._handle.style.top = maxy + '%';
        this.setState({x: maxx / 100, y: maxy / 100});
        if (this.props.valueChanged) {
            this.props.valueChanged(maxx / 100 - 0.5, maxy / 100 - 0.5);
        }
    };

    _handelMouseDown = (event)=> {
        this._dragging = true;
        document.body.addEventListener("mousemove", this._handleDragging);
        document.body.addEventListener("mouseup", this._handelMouseUp);
    };

    _handelMouseUp = (event)=> {
        this._dragging = false;
        document.body.removeEventListener("mousemove", this._handleDragging);
        document.body.removeEventListener("mouseup", this._handelMouseUp);
    };

    componentDidMount() {
        this._handle = this.refs.handle;
        this._slider = this.refs.slider;
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        delete this._handle;
        delete this._slider;
    }

    render() {
        var x = this.state.x, y = this.state.y;
        var rotate, scale;

        var vx = x - 0.5;
        var vy = y - 0.5;
        rotate = Math.PI / 2 - (Math.atan2(vx, vy));

        scale = Math.sqrt(vx * vx + vy * vy) * 2;
        var direction_style = {
            transform: `rotate(${rotate}rad)`,
            right: (50 - scale * 50) + '%'
        };
        var handle_style = {
            left: 100 * x + '%',
            top: 100 * y + '%'
        };
        return (
            <div className={b("position")} ref="slider" onMouseDown={this._onMouseDown}>
                <div className={ b("position-bg") }></div>
                <div className={ b("position-grid") }></div>
                <div className={ b("position-direction") } style={direction_style}></div>
                <div className={ b("handle") } ref="handle" style={handle_style}
                     onMouseDown={this._handelMouseDown}></div>
            </div>
        );
    }
}

class ShadowEditor extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            x: this.props.value.x,
            y: this.props.value.y,
            spread: this.props.value.spread,
            blur: this.props.value.blur,
            inset: this.props.value.inset,
            color:this.props.value.color
        };
    }

    private setX = (x: number) => {
        this.setState({x});
    }
    private setY = (y: number) => {
        this.setState({y});
    }
    private setSpread = (spread: number) => {
        this.setState({spread});
    }
    private setBlur = (blur: number) => {
        this.setState({blur});
    }

    private static numericMods: GuiInputMod[] = ["right", "slim"];

    _renderNumberParams() {

        return <div className={b("numbers")}>
            <ArrowKeyModifier value={this.state.x} onChanged={this.setX} onChanging={this.setX}>
                <GuiNumericInput
                    className={b("number-param")}
                    mods={ShadowEditor.numericMods}
                    label={  shadow_label('x', 'x')   }
                    value={this.state.x}
                    onValueChanged={this.setX}/>
            </ArrowKeyModifier>
            <ArrowKeyModifier value={this.state.y} onChanged={this.setY} onChanging={this.setY}>
                <GuiNumericInput
                    className={b("number-param")}
                    mods={ShadowEditor.numericMods}
                    label={  shadow_label('y', 'y')   }
                    value={this.state.y}
                    onValueChanged={this.setY}/>
            </ArrowKeyModifier>
            <ArrowKeyModifier value={this.state.spread} onChanged={this.setSpread} onChanging={this.setSpread}>
                <GuiNumericInput
                    className={b("number-param")}
                    mods={ShadowEditor.numericMods}
                    label={  shadow_label('s', 's')   }
                    value={this.state.spread}
                    onValueChanged={this.setSpread}/>
            </ArrowKeyModifier>
            <ArrowKeyModifier value={this.state.blur} onChanged={this.setBlur} onChanging={this.setBlur}>
                <GuiNumericInput
                    className={b("number-param")}
                    mods={ShadowEditor.numericMods}
                    label={  shadow_label('b', 'b')   }
                    value={this.state.blur}
                    onValueChanged={this.setBlur}/>
            </ArrowKeyModifier>
        </div>
    }

    blurChanged = (value)=> {
        this.setState({blur: value});
    };

    _setInset(value){
        this.setState({inset: value});
    }

    spreadChanged = (value)=> {
       this.setState({spread: value});
    };

    directionChanged = (x, y) => {
        this.setState({x: Math.round(x * 40), y: Math.round(y * 40)});
    };

    componentDidUpdate(prevProps, prevState) {
        if(this.state !== prevState) {
            this.props.changed && this.props.changed(this.state);
        }
    }

    render() {
        return <div className={b()}>
            {this._renderNumberParams()}

            <div className={b("params")}>
                <div className={b("params-left")}>
                    <ShadowDirection x={this.state.x / 40} y={this.state.y / 40} valueChanged={this.directionChanged}/>
                </div>
                <div className={b("params-right")}>
                    <div className={b("slider-param")}>
                        {shadow_label("blur", "blur", "right")}
                        <GuiSlider min={0} max={20} value={this.state.blur} onValueUpdate={this.blurChanged}
                                   valueChanging={v=>v | 0}/>
                    </div>

                    <div className={b("slider-param")}>
                        {shadow_label("size", "size", "right")}
                        <GuiSlider min={0} max={20} value={this.state.spread} onValueUpdate={this.spreadChanged}
                                   valueChanging={v=>v | 0}/>
                    </div>

                    <div className={b("pushbuttons")}>
                        <div className={b("pushbutton", {active: !this.state.inset})} onClick={()=>this._setInset(false)}><i className="ico-outset" /></div>
                        <div className={b("pushbutton", {active: this.state.inset})} onClick={()=>this._setInset(true)}><i className="ico-inset"/></div>
                    </div>
                </div>
            </div>
        </div>
    }
}


export default class ShadowPopup extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {value: this.props.value};
        this.confirmDebounced = util.debounce(this.confirmDebounced, 200);
    }

    ok = () => {
        dispatch(CarbonActions.cancel());
    };

    cancel = () => {
        this.props.onCancelled && this.props.onCancelled();
        dispatch(CarbonActions.cancel());
    };

    componentDidMount() {
        super.componentDidMount();
        (ReactDom.findDOMNode(this) as HTMLElement).focus();
    }

    onColorPickerChange = (color)=> {
        var newvalue = Object.assign({}, this.state.value, {color:rgbaToString(color.rgb)});
        this.setState({value:newvalue});
        this.previewAndUpdateDebounced(newvalue);
    }

    _propsChanged = (value)=> {
        var newvalue = Object.assign({}, this.state.value, value);
        this.setState({value:newvalue});
        this.previewAndUpdateDebounced(newvalue);
    }

    private previewAndUpdateDebounced(newValue) {
        this.props.onPreview && this.props.onPreview(newValue);
        this.confirmDebounced(newValue);
    }
    private confirmDebounced = (newValue) => {
        this.props.onConfirmed && this.props.onConfirmed(newValue);
    }

    render() {
        return ( <div className="shadows-popup">
            <TabContainer>
                <TabTabs
                    items={[
                        [<i key="color_icon"/>, <FormattedMessage tagName="span" id="@params" key="text"/>],
                        <FormattedMessage tagName="span" id="@color"/>
                    ]}
                />
                {/*<FormattedMessage tagName="span" id="@recent" />,*/}

                <TabAreaStyled>

                    <TabPageStyled tabId="1">
                        <ShadowEditor value={this.state.value} changed={this._propsChanged}/>
                    </TabPageStyled>

                    <TabPageStyled tabId="2">
                        <ColorPicker display={true} color={this.state.value.color}
                                      onChangeComplete={this.onColorPickerChange} presetColors={[]}/>
                    </TabPageStyled>

                </TabAreaStyled>
            </TabContainer>

            <div className="bottom-right-controls">
                <div className="button_accept" onClick={this.ok}></div>
                <div className="button_cancel" onClick={this.cancel}></div>
            </div>

        </div> );
    }
}