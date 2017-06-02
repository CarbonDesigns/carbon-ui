import React from 'react';
// import {app} from '../../../RichApp'
import { FormattedMessage } from "react-intl";
import { Component } from "../../CarbonFlux";
import DropDown, { IDropdownProps } from "../Dropdown";
import cx from 'classnames';
import bem from '../../utils/commonUtils';
import Immutable from "immutable";

interface IGuiInlineLabelProps extends IReactElementProps {
    text?: string
}
export class GuiInlineLabel extends Component<IGuiInlineLabelProps, void> {
    constructor(props) {
        super(props);
    }

    render() {
        var cn = cx("gui-inline-label", this.props.className);
        return <label className={cn}>
            <FormattedMessage tagName="p" id={this.props.text || "empty.label"} />
        </label>
    }
}

/**
 * Gui slider.
 */
interface IGuiSliderProps {
    value: number;
    direction?: string;
    className?: string;
    mods?: string;
    min?: number;
    max?: number;
    valueChanging?: (value: number) => number;
    onValueUpdate?: (value: number) => void;
    easing?: (value: number) => number;
}
interface IGuiSliderState {
    value: number;
}
export class GuiSlider extends Component<IGuiSliderProps, IGuiSliderState> {
    private _height: number;
    private _width: number;
    private _offset: number;
    private _size: number;
    private _slider: HTMLElement;
    private _handle: HTMLElement;
    private _dragging: boolean;

    refs: {
        handle: HTMLElement,
        slider: HTMLElement
    }

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || 0
        }
    }

    b(elem, mods = null, mix = null) {
        return bem("gui-slider", elem, mods, mix)
    }

    _onMouseDownOnTrack = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (this.isVertical()) {
            this._size = this._slider.clientHeight;
            this._offset = this._slider.getBoundingClientRect().top;
        } else {
            this._size = this._slider.clientWidth;
            this._offset = this._slider.getBoundingClientRect().left;
        }
        this._updatePositionFromEvent(event);
    };

    _onDraggingOfHandle = (event) => {
        if (this._dragging) {
            this._updatePositionFromEvent(event);
        }
    };

    _updatePositionFromEvent = (event) => {
        var v = (this.isVertical() ? event.clientY : event.clientX) - this._offset;
        var value = (v / this._size) * 100;

        var min = this.props.min || 0;
        var max = this.props.max || 100;

        value = min + (max - min) * value / 100;

        if (value > max) value = max;
        else if (value < min) value = min;

        if (typeof this.props.valueChanging === 'function') {
            value = this.props.valueChanging(value);
        }

        var pvalue = (value - min) / (max - min) * 100;

        if (this.isVertical()) {
            this._handle.style.top = pvalue + '%';
        } else {
            this._handle.style.left = pvalue + '%';
        }

        if (typeof this.props.onValueUpdate === 'function') {
            if (typeof this.props.easing === 'function') {
                this.props.onValueUpdate(this.props.easing(value));
            }
            else {
                this.props.onValueUpdate(value);
            }
        }
    };

    _onMouseDownOnHandle = (event) => {
        this._dragging = true;
        document.body.addEventListener("mousemove", this._onDraggingOfHandle);
        document.body.addEventListener("mouseup", this._onMouseUpOnHandle);
    };

    _onMouseUpOnHandle = (event) => {
        this._dragging = false;
        document.body.removeEventListener("mousemove", this._onDraggingOfHandle);
        document.body.removeEventListener("mouseup", this._onMouseUpOnHandle);
    };

    componentDidMount() {
        this._handle = this.refs.handle;
        this._slider = this.refs.slider;
    }

    componentWillUnmount() {
        delete this._handle;
        delete this._slider;
    }

    isVertical() {
        return this.props.direction === 'vertical';
    }

    render() {
        var { className, value, min, max, mods, onValueUpdate } = this.props;
        var handleStyle = {};

        var direction = this.isVertical() ? 'vertical' : 'horizontal';

        className = cx(className, 'gui-slider_' + direction);

        value = value || 0;
        min = min || 0;
        max = max || 100;
        //todo easing
        // accept string or function

        value = (value - min) / (max - min) * 100;

        if (value > 100) value = 100;
        else if (value < 0) value = 0;

        handleStyle[this.isVertical() ? 'top' : 'left'] = value + '%';

        return <div className={this.b(null, mods, className)} onMouseDown={this._onMouseDownOnTrack}>
            <div className={this.b("track")} ref="slider"></div>
            <div className={this.b("handle-wrapper")}>
                <div className={this.b("handle")} style={handleStyle} ref="handle" onMouseDown={this._onMouseDownOnHandle}></div>
            </div>
        </div>
    }
}

interface IGuiSwitchProps {
    checked: boolean;
    onChange: React.EventHandler<React.ChangeEvent<HTMLInputElement>>;
}
export class GuiSwitch extends Component<IGuiSwitchProps, void> {
    constructor(props) {
        super(props);
    }

    render() {
        var checked = this.props.checked; // true/false/undefined
        var checked_is_set = checked === false || checked === true;
        var input_props = {
            onChange: this.props.onChange,
            type: "checkbox",
            checked: false,
            defaultChecked: false
        };

        if (checked_is_set)
            input_props.checked = checked;
        else
            input_props.defaultChecked = true;

        return <div className="gui-switch">
            <input {...input_props} />
            <FormattedMessage id="off" />
            <i />
            <FormattedMessage id="on" />
            <div className="gui-switch__bg"></div>
        </div>;
    }
}


interface IGuiRadioProps {
    checked: boolean;
    mod?: string;
    mods?: string;
    className?: string;
    name?: string;
    label?: string;
    onChange: React.EventHandler<React.ChangeEvent<HTMLInputElement>>;
}
export class GuiRadio extends Component<IGuiRadioProps, void> {
    constructor(props) {
        super(props);
    }

    render() {
        // Compiling classname by mods/mod.
        // If this.props.mod == 'line', then it will become gui-radio_line
        var cn = "gui-radio";

        var mods = (this.props.mod != null) ? this.props.mod : (this.props.mods || []);
        if (mods) {
            if (typeof mods === 'string')
                mods = [mods];
            mods.map(function (mod) { cn += " gui-radio_" + mod });
        }

        if (typeof this.props.className === 'string')
            cn += " " + this.props.className;

        return <label className={cn}>
            <input type="radio" name={this.props.name} checked={this.props.checked} onChange={this.props.onChange} />
            <i />
            {
                (this.props.children != null)
                    ? this.props.children
                    : <FormattedMessage tagName='span' id={this.props.label || "empty.label"} />
            }
        </label>;
    }
}

interface IGuiCheckboxProps {
    checked?: boolean;
    mod?: string;
    mods?: string;
    className?: string;
    inline?: boolean;
    labelless?: boolean;
    label?: string;
    name?: string;
    defaultMessage?: string;
    onChange?: React.EventHandler<React.ChangeEvent<HTMLInputElement>>;
}
export class GuiCheckbox extends Component<IGuiCheckboxProps, void> {
    constructor(props) {
        super(props);
    }

    render() {
        // Compiling classname by mods/mod.

        // If this.props.mod == 'line', then it will become gui-check_line
        var mods = (this.props.mod != null) ? this.props.mod : (this.props.mods || []);
        if (mods) {
            if (typeof mods === 'string')
                mods = [mods];
            //TODO: cn is not declared
            //mods.map(function(mod){cn += " gui-check_" + mod});
        }

        var mix = "";
        if (this.props.inline != null && !!this.props.inline) {
            mix += " gui-inline-label"
        }
        if (typeof this.props.className === 'string')
            mix += " " + this.props.className;

        var children = this.props.labelless
            ? null
            : (this.props.children != null)
                ? this.props.children
                : (<FormattedMessage tagName='p' id={this.props.label || "empty.label"} defaultMessage={this.props.defaultMessage} />);

        return <label className={bem("gui-check", null, mods, mix)}>
            <input
                key='input'
                type="checkbox"
                className={bem('gui-check', 'input')}
                checked={this.props.checked}
                onChange={this.props.onChange} name={this.props.name}
            />
            <i key='helper' className={bem('gui-check', 'helper')} />
            {children}
        </label>;
    }
}

interface IGuiButtonProps extends IReactElementProps {
    className?: string;
    icon?: string|boolean;
    caption?: string;
    defaultMessage?: string;
    bold?: boolean;
    mods?: string | string[];
    disabled?: boolean;
    progressPercents?: number;
    progressColor?: string;
    onClick: (e?) => void;
}
export class GuiButton extends Component<IGuiButtonProps, void>{
    render() {
        var { className, icon, caption, defaultMessage, bold, mods, disabled, progressPercents, progressColor, ...rest } = this.props;

        var cn = bem('gui-btn', null, mods, className);
        if (disabled)
            cn += ' gui-btn_disabled';

        var content = this.props.children;
        var children = null;
        if (content == null) {
            children = [];
            if (icon != null) {
                var ico_cn = (typeof icon === 'string') ? "ico--" + icon : null;
                children.push(<i key="icon" className={ico_cn} />);
            }
            if (caption != null || defaultMessage != null) {
                var caption_tagName = bold != null ? "b" : "span";
                children.push(<FormattedMessage key="caption" tagName={caption_tagName} id={caption} defaultMessage={defaultMessage} />)
            }
            if (!children.length) {
                children = null;
            }
        }

        var progressbar = null;
        if (progressPercents) {
            progressColor = progressColor || "rgba(255,255,255, .1)";
            var percentString = Math.max(100, progressPercents).toFixed(2);
            progressbar = <div className="gui-btn__progressbar" style={{ backgroundColor: progressColor, width: percentString + '%' }}></div>
        }
        return <div {...rest} className={cn}>{progressbar}{content || children}</div>
    }
}

interface IGuiButtonLockProps {
    className?: string;
    mods?: string;
}
export class GuiButtonBlock extends Component<IGuiButtonLockProps, void>{
    constructor(props) {
        super(props);
    }
    render() {
        var { className, mods, ...rest } = this.props;
        var cn = bem("gui-btn-block", null, mods, className);
        return <div {...rest} className={cn}>{this.props.children}</div>
    }
}

/**
 * To make a row of buttons
 */
interface IGuiButtonedInputProps {
    className?: string;
}
export class GuiButtonedInput extends Component<IGuiButtonedInputProps, void>{
    render() {
        var { className, ...rest } = this.props;
        return <div className={cx("gui-buttoned-input", className)} {...rest}>
            {this.props.children}
        </div>
    }
}


/**
 * To make a column of buttons
 */
interface IGuiButtonStackProps {
    className?: string;
}
export class GuiButtonStack extends Component<IGuiButtonStackProps, void>{
    render() {
        var { className, ...rest } = this.props;
        return <div className={cx("gui-btn-stack", className)} {...rest}>
            {this.props.children}
        </div>
    }
}


interface IGuiDropDownProps extends IDropdownProps {
}
export class GuiDropDown extends Component<IGuiDropDownProps, void>{
    render() {
        var { className, ...rest } = this.props;
        return <DropDown className={cx("gui-drop", className)} {...rest}>
            {this.props.children}
        </DropDown>
    }
}


/**
 * GuiInput
 */
interface IGuiInputProps extends React.ChangeTargetHTMLAttributes<HTMLInputElement> {
    label?: any;
    caption?: string;
    defaultMessage?: string;
    mods?: any;
    suffix?: any;
}

export class GuiInput extends Component<IGuiInputProps, void>{
    refs: {
        input: HTMLInputElement;
    }

    selectOnFocus = (e) => {
        e.target.select();
    }

    getValue() {
        return this.refs.input.value;
    }

    render() {
        // todo - borrow from edit input
        var { className, label, caption, defaultMessage, mods, suffix, ...rest } = this.props;
        var cn = bem("gui-input", null, mods, className);
        var renderedLabel = null;

        if (label != null) {
            renderedLabel = label;
        }
        else if (caption != null || defaultMessage != null) {
            renderedLabel = (<p className={bem("gui-input", "label")}>
                <FormattedMessage id={caption} defaultMessage={defaultMessage} />
            </p>);
        }

        var renderedInput = <input
            ref="input"
            className={bem("gui-input", "input")}
            onFocus={this.selectOnFocus}
            type={this.props.type}
            {...rest}
        />;

        return <label className={cn}>{renderedLabel}{renderedInput}{suffix}</label>
    }
}

interface IGuiTextAreaProps extends React.ChangeTargetHTMLAttributes<HTMLTextAreaElement> {
    label?: any;
    caption?: string;
    defaultMessage?: string;
    mods?: any;
    suffix?: any;
}

export class GuiTextArea extends Component<IGuiTextAreaProps, void>{
    refs: {
        input: HTMLTextAreaElement;
    }

    selectOnFocus = (e) => {
        e.target.select();
    }

    getValue() {
        return this.refs.input.value;
    }

    render() {
        // todo - borrow from edit input
        var { className, label, caption, defaultMessage, mods, suffix, ...rest } = this.props;
        var cn = bem("gui-input", null, mods, className);
        var renderedLabel = null;

        if (label != null) {
            renderedLabel = label;
        }
        else if (caption != null || defaultMessage != null) {
            renderedLabel = (<p className={bem("gui-input", "label")}>
                <FormattedMessage id={caption} defaultMessage={defaultMessage} />
            </p>);
        }

        var renderedInput = <textarea
            ref="input"
            className={bem("gui-input", "input")}
            {...rest}
        />;

        return <label className={cn}>{renderedLabel}{renderedInput}{suffix}</label>
    }
}

export interface IFieldState {
    status: "notReady" | "checking" | "ok" | "error";
    error?: string;
}

export let FieldState = Immutable.Record<IFieldState>({
    status: "notReady",
    error: ""
});

export const enum ValidationTrigger{
    keyUp = 1,
    blur = 1 << 1,
    change = 1 << 2
}

interface IGuiValidatedInputProps extends React.HTMLAttributes<HTMLInputElement>{
    /**
     * Validation callback which should return a new field state.
     * The force parameter specifies that validation should be performed regardless of the trigger,
     * for example if a form is submitted without key up or blur event on the component.
     */
    onValidate: (newValue: string, state: ImmutableRecord<IFieldState>, force?: boolean) => ImmutableRecord<IFieldState> | null;
    trigger?: ValidationTrigger;
}
interface IGuiValidatedInputState{
    fieldState: ImmutableRecord<IFieldState>;
}
/**
 * An input with validation callback.
 */
export class GuiValidatedInput extends Component<IGuiValidatedInputProps, IGuiValidatedInputState>{
    static contextTypes = {
        intl: React.PropTypes.object
    };

    refs: {
        input: GuiInput;
    }

    constructor(props: IGuiValidatedInputProps){
        super(props);
        this.state = {
            fieldState: new FieldState()
        }
    }

    getValue(){
        return this.refs.input.getValue();
    }

    validate(force?: boolean): boolean{
        var value = this.refs.input.getValue();
        var newState = this.props.onValidate(value, this.state.fieldState, force);
        if (newState){
            this.setState({fieldState: newState});
            var status = newState.get("status");
            return status === "ok" || status === "notReady";
        }
        return true;
    }

    setOk(){
        this.setState({fieldState: this.state.fieldState.set("status", "ok").set("error", "")});
    }
    clearError(){
        this.setState({fieldState: this.state.fieldState.set("status", "notReady").set("error", "")});
    }
    setError(message){
        if (message){
            this.setState({fieldState: this.state.fieldState.set("status", "error").set("error", message)});
        }
    }
    setErrorLabel(message){
        if (message){
            this.setState({fieldState: this.state.fieldState
                .set("status", "error")
                .set("error", this.formatLabel(message))}
            );
        }
    }

    isOk(){
        return this.state.fieldState.get("status") === "ok";
    }
    isError(){
        return this.state.fieldState.get("status") === "error";
    }

    private validateIf(trigger: ValidationTrigger){
        var configuredTrigger = this.props.trigger || ValidationTrigger.blur;
        if (trigger & configuredTrigger){
            this.validate();
        }
    }

    render(){
        var {onBlur, onKeyUp, onChange, onValidate, trigger, ...rest} = this.props;
        return <GuiInput ref="input" mods={this.renderFieldMods(this.state.fieldState)}
            onBlur={e => {this.validateIf(ValidationTrigger.blur); onBlur && onBlur(e);}}
            onKeyUp={e => {this.validateIf(ValidationTrigger.keyUp); onKeyUp && onKeyUp(e);}}
            onChange={e => {this.validateIf(ValidationTrigger.change); onChange && onChange(e);}}
            suffix={this.renderFieldSuffix(this.state.fieldState)}
            {...rest} />
    }

    private renderFieldMods(field: Immutable.Record.Instance<IFieldState>) {
        var status = field.get("status");
        return { valid: status === 'ok', checking: status === "checking", error: status === "error" };
    }

    private renderFieldSuffix(field: Immutable.Record.Instance<IFieldState>) {
        var status = field.get("status");
        if (status === "checking") {
            //TODO: (design) add icon (or animation) for checking field
            return <div className="gui-input__input-ico gui-input__input-ico_checking" key="checking_ico"><i className="ico--checking"></i></div>;
        }
        if (status === "ok") {
            return <div className="gui-input__input-ico gui-input__input-ico_valid" key="valid_ico"><i className="ico--ok-white"></i></div>;
        }
        if (status === "error") {
            return [
                <div className="gui-input__input-ico gui-input__input-ico_error" key="error_ico">
                    <i className="ico-warning"></i>
                </div>,
                <span key='tooltip' className="gui-input__error-tooltip">{field.get("error")}</span>
            ];
        }
        return null;
    }
}

export interface IFormState {
    status: "notReady" | "sending" | "error";
}

export function GuiSpinner(){
    return <div className="loading-spinner">
        <div className="ball-pulse">
            <div className="ball-pulse__1"></div>
            <div className="ball-pulse__2"></div>
            <div className="ball-pulse__3"></div>
        </div>
    </div>
}
