import React from 'react';
import SwitchEditor from "../SwitchEditor";
import cx from 'classnames';
import {TextAlign} from "carbon-core";

import {richApp} from "../../../RichApp";

export default class TextAlignEditor extends SwitchEditor {
    renderItem(x, i){
        var buttonClasses = cx("prop__pushbutton", {
            "_active": x.value === this.propertyValue()[x.prop],
            "_shifted": x.value === TextAlign.top
        });
        var iconClasses = cx("ico ico-prop", x.icon);
        return <q className={buttonClasses} onClick={this._onChange} key={i} data-value={x.value} data-prop={x.prop}>
            <i className={iconClasses}></i>
        </q>
    }

    _onChange = e => {
        var prop = e.currentTarget.dataset.prop;
        var value = parseInt(e.currentTarget.dataset.value);
        var newValue = {[prop]: value};

        this.setValueByCommand(newValue);
    };
}