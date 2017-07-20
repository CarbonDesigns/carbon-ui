import React from 'react';
import EditorComponent, {IEditorProps, IEditorState} from "./EditorComponent";
import cx from "classnames";
import {FormattedMessage} from "react-intl";

interface INumericEditorProps extends IEditorProps{
    selectOnEnter?: boolean;
}

interface INumericEditorState extends IEditorState<string>{
    error: boolean;
}

export default class NumericEditor extends EditorComponent<INumericEditorProps, INumericEditorState> {
    private step: number;
    private miniStep: number;
    private timeoutId: number;
    private _holding: boolean;

    init(props){
        super.init(props);
        this.step = this.extractOption(props, "step", 1);
        this.miniStep = this.extractOption(props, "miniStep", 0);
        this._holding = false;
    }

    parseState(): {error: boolean, value?: number}{
        var value = parseFloat(this.state.value);
        if(isNaN(value)) {
            this.setState({error: true});
            return {error: true};
        }

        this.setState({error: false});
        return {error: false, value};
    }

    validateNewValue(value, roundToMajorStep = false){
        var min = this.extractOption(this.props, "min");
        if (min !== undefined && value < min){
            return min;
        }
        var max = this.extractOption(this.props, "max");
        if (max !== undefined && value > max){
            return max;
        }
        return this.round(value, roundToMajorStep);
    }

    round(value, toMajorStep = false){
        if (isNaN(value)){
            return value;
        }
        var precision = (toMajorStep || !this.miniStep)
            ? this.step
            : this.miniStep
        ;

        var m = 1 / precision;
        return Math.round((value - 0) * m) / m;
    }


    /** Used for multiple scenarios:
     * - Round initial value, which could have many digits after comma
     * - Display value entred by the user. Not sure if rounding here is good, e.g. typing 1.56 becomes 1.6
     */
    formatValue(value){
        var parsed = parseFloat(value);
        if (isNaN(parsed) || (typeof value === "string" && value.endsWith("."))){
            return value;
        }
        return this.round(value);
    }


    selectOnFocus(e){
        e.target.select();
    }

    onChange = e => {
        this.updateState(e.target.value);
    };

    onBlur = () => {
        if (this.state.dirty){
            var parsed = this.parseState();
            if (parsed.error){
                this.updateState(this.propertyValue());
            }
            else{
                this.setValueByCommand(this.validateNewValue(parsed.value));
            }
        }
    };

    onKeyDown = (event) => {
        if (event.keyCode === 38 || event.keyCode === 40){
            var value: any = this.state.value;
            if (!event.repeat){
                let parsed = this.parseState();
                if (parsed.error){
                    return;
                }
                value = parsed.value;
            }
            var factor = event.keyCode === 38 ? 1 : -1;
            var newValue = value + this.getDelta(event) * factor;
            newValue = this.validateNewValue(newValue, !event.altKey);
            this.updateState(newValue);
            this.previewValue(newValue);

            event.preventDefault();
        }
        else if (event.keyCode === 13){
            let parsed = this.parseState();
            if (!parsed.error){
                this.setValueByCommand(this.validateNewValue(parsed.value));
            }
            if (this.props.selectOnEnter !== false){
                this.selectOnFocus(event);
            }
        }
    };

    onKeyUp = event => {
        if (!this.state.error && (event.keyCode === 38 || event.keyCode === 40)){
            this.setValueByCommand(this.state.value);
        }
    };

    holdMouse(delta) {
        this.previewValue(this.state.value + delta);
        if (this._holding){
            this.timeoutId = setTimeout(() => this.holdMouse(delta), 0);
        }
    };
    releaseMouse(event, delta) {
        clearTimeout(this.timeoutId);
        if (this._holding){
            this._holding = false;
            this.setValueByCommand(this.state.value);

        }
        else if (event.type === "mouseup"){
            this.setValueByCommand(this.state.value + delta);
        }
    };

    holdMouseValueDown = (event) => {
        this.timeoutId = setTimeout(() => {
            this._holding = true;
            this.holdMouse(-this.getDelta(event));
        }, 150);
    };

    releaseMouseValueDown = (event) => {
        this.releaseMouse(event, -this.getDelta(event));
    };

    holdMouseValueUp = (event) => {
        this.timeoutId = setTimeout(() => {
            this._holding = true;
            this.holdMouse(this.getDelta(event));
        }, 150);
    };

    releaseMouseValueUp = (event) => {
        this.releaseMouse(event, this.getDelta(event));
    };

    getDelta(event){
        var s = this.step;
        if (event.altKey && this.miniStep){
            s = this.miniStep;
        }
        return event.shiftKey ? 10*s : s;
    }

    render(){
        var prop = this.props.p;
        var classes = cx("prop prop_spinner textbox", this.widthClass(this.props.className || "prop_width-1-2"));
        var value = this.state.value != null ? this.formatValue(this.state.value) : '' ;
        return <div className={classes}>

            <div className="wrap">
                <input
                    ref="textNode"
                    type="text"
                    value={value}
                    onChange={ this.onChange}
                    onKeyDown={this.onKeyDown}
                    onFocus={  this.selectOnFocus}
                    onBlur={   this.onBlur}
                    onKeyUp={  this.onKeyUp}
                />
            </div>

            <div className="spinner-buttons">
                <div className="spinner-button__up"
                    onMouseDown={this.holdMouseValueUp}
                    onMouseUp={this.releaseMouseValueUp}
                    onMouseLeave={this.releaseMouseValueUp}>
                </div>
                <div className="spinner-button__down"
                    onMouseDown={this.holdMouseValueDown}
                    onMouseUp={this.releaseMouseValueDown}
                    onMouseLeave={this.releaseMouseValueDown}>
                </div>
            </div>

            <div className="prop__name"><FormattedMessage id={this.displayName()}/></div>
        </div>;
    }

}