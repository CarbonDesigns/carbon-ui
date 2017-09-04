import React from 'react';
import EditorComponent, {IEditorProps} from "./EditorComponent";
import cx from 'classnames';
import {FormattedMessage} from "react-intl";
import bem from '../../utils/commonUtils';
import {QuadAndLock} from "carbon-core";

function b(elem, mods = null, mix = null) {
    return bem("prop_corners", elem, mods, mix)
}

type CornersEditorState = {
    value: QuadAndLock;
}

export default class CornersEditor extends EditorComponent<QuadAndLock, IEditorProps, CornersEditorState> {

    constructor(props){
        super(props);
        var value = this.props.p.get('value');
        this.state = {
            value : value
        };
    }

    _setValue (key, val) {
        var current;
        if(this.state.value.locked && key === 'upperLeft') {
            current = QuadAndLock.createFromObject({
                locked:true,
                upperLeft:val,
                upperRight:val,
                bottomLeft:val,
                bottomRight:val
            });
        } else {
            current = QuadAndLock.extend(this.state.value, {[key]: val});
        }
        this.setState({value: current});
        this.setValueByCommand(current);
    };

    _assignOnChange (corner){
        return (ev)=>{
            ev.preventDefault();
            this._setValue(corner, ev.target.value);
        }
    };

    _selectOnFocus(ev){
        ev.target.select();
    }

    _assignOnBlur (corner){
        return (ev)=>{
            var val = ev.target.value;
            val = val.replace(/\D/g,'').replace(/\s/g,'');
            if (val === 0) {
                this._setValue(corner, 0);
            }
            else if (val !== ev.target.value){ //fixme - do this sanitizing in keyup
                this._setValue(corner, val);
            }
        }
    }

    _linkOnClick = (ev)=>{
        this._setValue('locked', !this.state.value.locked);
    };

    render(){
        var classes = this.prop_cn(null, this.widthClass(this.props.className || "prop_width-1-2"));

        var value = this.state.value;
        var locked = value.locked;

        return <div className={classes}>
            <div className={this.b('name') }><FormattedMessage id={this.displayName()}/></div>
            <div className={this.b('editor')}>
                <div className={b("container")}>
                    { ["upperLeft", "upperRight", "bottomRight", "bottomLeft"].map((c)=>{
                        var val = value[c];
                        var active = !locked || (c === 'upperLeft');

                        var value_mods, corner_mods={};
                        corner_mods[c] = true;
                        corner_mods['active'  ] = active;
                        corner_mods['disabled'] = !active;

                        switch ((val+'').length) {
                            case 0  :
                            case 1  :
                            case 2  : value_mods = null    ; break;
                            case 3  : value_mods = 'triple'; break;
                            default : value_mods = 'large' ;
                        }
                        return <div key={c} className={b("corner", corner_mods)}>
                                <div className={b("background")}></div>
                                <div className={b("value", value_mods)}>
                                    <input
                                        type="text"
                                        className={b("value-input")}
                                        value={val}
                                        onChange={this._assignOnChange(c)}
                                        onBlur={  this._assignOnBlur(c)}
                                        onFocus={ this._selectOnFocus}
                                        disabled={!active}
                                    />
                                </div>
                            </div>
                        })
                    }
                    <div
                        className={b("link", {active: locked})}
                        onClick={this._linkOnClick}
                    ><i className="ico-prop ico-prop_chain"/></div>
                </div>
            </div>
        </div>;
    }

}