import React from 'react';
import {Component} from "../CarbonFlux";
import NameEditor from "./editors/custom/NameEditor";
import ToggleEditor from "./editors/ToggleEditor";
import {Selection} from "carbon-core";

import PropertyStore from "./PropertyStore";

interface IPropertyHeaderProps {
    nameProperty: any,
    lockedProperty: any,
    e: any
}

export class PropertyHeader extends Component<IPropertyHeaderProps, any> {
    constructor(props){
        super(props);
    }

    _onLocked = lock => {
        if (lock){
            Selection.lock();
        }
        else{
            Selection.unlock();
        }
        return false;
    };

    render(){
        if(!PropertyStore.state.initialized){
            return null;
        }

        if (!this.props.nameProperty || !this.props.lockedProperty){
            return null;
        }

        return <div id="edit__selection">
            <section className="props-group">
                <NameEditor e={this.props.e} p={this.props.nameProperty} className="prop_width-1-78"/>
                <ToggleEditor e={this.props.e} p={this.props.lockedProperty} onSettingValue={this._onLocked}/>
            </section>
        </div>
    }
}

export default PropertyHeader;