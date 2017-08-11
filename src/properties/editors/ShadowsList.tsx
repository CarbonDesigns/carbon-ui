import React from 'react';
import {Component} from "../../CarbonFlux";
import {FormattedHTMLMessage} from "react-intl";
import {GuiCheckbox, GuiButton} from "../../shared/ui/GuiComponents";
import bem from '../../utils/commonUtils';
import SimpleList from '../../shared/SimpleList';
import FlyoutButton from '../../shared/FlyoutButton';
import ShadowPopup from './ShadowPopup';

function cn(elem = null, mods = null, mix = null) {
    return bem("shadows-list", elem, mods, mix)
}

var value_dim = <span className={cn("param-value-dim")}>px</span>;

class ShadowFlat extends Component<any, any> {
    refs: {
        modify: FlyoutButton
    }

    constructor(props){
        super(props);
        this.state = {enabled:props.value.enabled};
    }

    _renderParam (value, name){
        //fixme - translate titles
        return <span className={cn("param", {zero: parseInt(value)===0})}>
            <span className={cn("param-label")}>{name}</span>
            <span className={cn("param-value")}>{value}{value_dim}</span>
        </span>
    }

    _changeEnabled = (e)=>{
        var newshadow = Object.assign({}, this.props.value, {enabled:e.target.checked});
        this.setState({enabled:e.target.checked});
        this.props.onEnableChanged && this.props.onEnableChanged(newshadow);
    }

    private openPopup = () => {
        this.refs.modify.toggle();
    }

    render() {
        var item = this.props.value;
        return <div className={cn("shadow")}>
            {item.enabled==null ? null : <GuiCheckbox
                className={cn("shadow-checkbox")}
                onChange={this._changeEnabled}
                checked={this.state.enabled}
                labelless={true}
            />}

            <span className={cn("params")} onClick={this.openPopup}>
                {this._renderParam(item.x, 'x')}
                {this._renderParam(item.y, 'y')}
                {this._renderParam(item.blur, 'b')}
            </span>
            <i title={item.inset ? "Inset shadow" : "Outset shadow"} className={cn("inset")} onClick={this.openPopup}>{item.inset ? <i className="ico-inset"/> : <i className="ico-outset"/>}</i>
            <i className={cn("color")} style={{backgroundColor: item.color}} onClick={this.openPopup}>
                <i className={cn("color-transparency")} style={{opacity: (1)}}/>
            </i>
            <FlyoutButton
                renderContent={()=>null}
                position={{targetVertical: "bottom", disableAutoClose: true}}
                ref="modify">
                <ShadowPopup
                    className="flyout__content"
                    value={this.props.value}
                    onConfirmed={this.props.onConfirmed}
                    onPreview={this.props.onPreview}
                    onCancelled={this.props.onCancelled}/>

            </FlyoutButton>
        </div>
    }
}


export default class ShadowsList extends Component<any, any> {
    render(){
        if(!(this.props.items instanceof Array)) {
            return <div></div>;
        }

        var items = this.props.items.map((itemProps)=>{return {
            id      : itemProps.id,
            content : <ShadowFlat value={itemProps} onPreview={this.props.onPreview} onConfirmed={this.props.onConfirmed} onCancelled={this.props.onCancelled} onEnableChanged={this.props.onEnableChanged} />
        }});

        var props = {
            className    : "props_shadows__list",
            boxClassName : cn(),
            padding      : this.props.padding,
            insideFlyout : this.props.insideFlyout,
            // emptyMessage : null,
            items        : items,
            onDelete     : this.props.onDeleted,
            // onEdit       : null
        };

        return <SimpleList {...props} scrolling={false}/>
    }
}