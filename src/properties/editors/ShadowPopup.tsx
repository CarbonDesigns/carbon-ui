import React from "react";
import ReactDom from "react-dom";
import {SketchPicker} from "react-color";
import FlyoutActions from "../../FlyoutActions";
import {Component, dispatch} from "../../CarbonFlux";
import {default as TabContainer, TabTabs, TabPage, TabArea} from "../../shared/TabContainer";
import bem from "../../utils/commonUtils";
import {GuiInput, GuiSlider} from "../../shared/ui/GuiComponents";
import {FormattedHTMLMessage} from "react-intl";


var b = function (elem = null, mods = null, mix = null) {
    return bem("shadow-editor", elem, mods, mix)
};
var shadow_label = function (id, defaultMessage, mods = null) {
    return <div className={b("label", mods)}><FormattedHTMLMessage id={id} defaultMessage={defaultMessage}/></div>
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
        this.state = {x: this.props.x + .5, y: this.props.y + .5};
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

    _setValue(name, value) {
        var number = parseInt(value);
        if (!isNaN(number)) {
            this.setState({[name]: number});
        } else if (!value || value==='-') {
            this.setState({[name]: value});
        }
    }

    _renderNumberParams() {

        return <div className={b("numbers")}>
            <GuiInput
                className={b("number-param")}
                mods={['right', 'slim']}
                label={  shadow_label('x', 'x')   }
                value={this.state.x}
                onChange={v=>this._setValue('x', v.target.value)}/>
            <GuiInput
                className={b("number-param")}
                mods={['right', 'slim']}
                label={  shadow_label('y', 'y')   }
                value={this.state.y}
                onChange={v=>this._setValue('y', v.target.value)}/>
            <GuiInput
                className={b("number-param")}
                mods={['right', 'slim']}
                label={  shadow_label('s', 's')   }
                value={this.state.spread}
                onChange={v=>this._setValue('spread', v.target.value)}/>
            <GuiInput
                className={b("number-param")}
                mods={['right', 'slim']}
                label={  shadow_label('b', 'b')   }
                value={this.state.blur}
                onChange={v=>this._setValue('blur', v.target.value)}/>
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
        if(this.state != prevState) {
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
    }

    onKeyDown = e => {
        if (e.key === "Escape" && e.target.tagName !== "INPUT") {
            this.ok();
        }
    };

    ok = () => {
        this.props.onConfirmed && this.props.onConfirmed(this.state.value);
        dispatch(FlyoutActions.hide());
    };

    cancel = () => {
        this.props.onCancelled && this.props.onCancelled();
        dispatch(FlyoutActions.hide());
    };

    componentDidMount() {
        (ReactDom.findDOMNode(this) as HTMLElement).focus();
    }

    // render(){
    //     return <div onKeyDown={this.onKeyDown} tabIndex="1" style={{height: 100, width: 200, background: "red"}}>
    //         <span>Shadow content here</span>
    //     </div>;
    // }

    onColorPickerChange = (color)=> {
        var newvalue = Object.assign({}, this.state.value, {color:rgbaToString(color.rgb)});
        this.setState({value:newvalue});
        this.props.onPreview && this.props.onPreview(newvalue);
    };

    _propsChanged = (value)=> {
        var newvalue = Object.assign({}, this.state.value, value);
        this.setState({value:newvalue});
        this.props.onPreview && this.props.onPreview(newvalue);
    };

    render() {
        // var recent_shadows = [
        //     // { id: '1',  inset: true,     color: "grey",  opacity: .5,  x:   0,  y: 2,  size: 0,  blur: 4 },
        //     // { id: '2',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        //     // { id: '3',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        //     // { id: '4',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        //     // { id: '5',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        //     // { id: '6',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        //     // { id: '7',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        //     // { id: '8',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        //     // { id: '9',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        //     // { id: '10',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        //     // { id: '11',  inset: false,    color: "red" ,  opacity: .5,  x: -80,  y: 2,  size: 2,  blur: 4 },
        // ];
        return ( <div className="shadows-popup" onKeyDown={this.onKeyDown}>
            <TabContainer>
                <TabTabs
                    items={[
                        [<i key="color_icon"/>, <FormattedHTMLMessage tagName="span" id="@params" key="text"/>],
                        <FormattedHTMLMessage tagName="span" id="@color"/>
                    ]}
                />
                {/*<FormattedHTMLMessage tagName="span" id="@recent" />,*/}

                <TabArea className="gui-pages">

                    <TabPage className="gui-page" tabId="1">
                        <ShadowEditor value={this.state.value} changed={this._propsChanged}/>
                    </TabPage>

                    <TabPage className="gui-page shadow-color-page" tabId="2">
                        <SketchPicker display={true} color={this.state.value.color}
                                      onChangeComplete={this.onColorPickerChange} presetColors={[]}/>
                    </TabPage>



                    {/*<TabPage className="gui-page" tabId="3">*/}
                    {/*<ShadowsList boxClassName="shadows-popup__recent-shadows" items={recent_shadows} onClick={console.log} insideFlyout={true} padding={true}/>*/}
                    {/*</TabPage>*/}

                </TabArea>
            </TabContainer>

            <div className="bottom-right-controls">
                <div className="button_accept" onClick={this.ok}></div>
                <div className="button_cancel" onClick={this.cancel}></div>
            </div>

        </div> );
    }
}