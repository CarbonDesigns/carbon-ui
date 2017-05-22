import React from 'react';
import {Component} from "../../CarbonFlux";
import {richApp} from "../../RichApp";
import PropertyActions from "../PropertyActions";
import {FormattedHTMLMessage} from "react-intl";
import {util, PatchType} from "carbon-core";

import bem from '../../utils/commonUtils';

export interface IProperty{
    [key: string]: any;
}

export interface IEditorProps{
    e?: any;
    p: IProperty;
    className?: string;
    onSettingValue?: (value: any, prop?: IProperty) => boolean;
    onPreviewingValue?: (value: any, prop?: IProperty) => boolean;
    onPatchingValue?: (patchType: PatchType, value: any, prop: IProperty) => boolean;
    onPreviewingPatchValue?: (value: any, prop: IProperty) => boolean;
    onCancelEdit?: (prop: IProperty) => boolean;
}

export interface IEditorState<TValue>{
    value?: TValue;
    dirty?: boolean;
    focused?: boolean;
}

//replace with generic default in TS 2.3
export default class EditorComponent<TProps extends IEditorProps, TState extends IEditorState<any>> extends Component<TProps, TState> {
    private _noPreview: boolean;
    private _setValueTimer: number;

    constructor(props){
        super(props);

        this.init(props);

        this.previewValue = util.throttle(this.previewValue, 100);
    }
    init(props){
        this.initState({value: this.propertyValue(props), dirty: false, focused: false});
        this._noPreview = this.extractOption(props, "noPreview", false);
    }

    propertyValue(props = this.props){
        return props.p.get("value");
    }

    initState(state){
        //update state if not first init
        if (this.state){
            this.setState(state);
        }
        else{
            this.state = state;
        }
    }
    componentWillReceiveProps(nextProps){
        this.init(nextProps);
    }

    updateState(value, focused=false){
        this.setState({value: value, dirty: true, focused: focused});
    }

    defocus(focused=false){
        this.setState({focused: focused});
    }

    previewValue(value){
        if (this.props.onPreviewingValue && this.props.onPreviewingValue(value, this.props.p) === false){
            return;
        }

        if (this._noPreview){
            return;
        }

        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }

        var changes = {};
        changes[this.propertyName()] = value;

        richApp.dispatch(PropertyActions.preview(changes));
    }
    setValueByCommand = (value, async = false) => {
        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }
        if (this.props.onSettingValue && this.props.onSettingValue(value, this.props.p) === false){
            return;
        }

        var changes = {};
        changes[this.propertyName()] = value;

        richApp.dispatch(PropertyActions.changed(changes, async));
    };
    patchValueByCommand = (changeType, value, async = false) => {
        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }
        if (this.props.onPatchingValue && this.props.onPatchingValue(changeType, value, this.props.p) === false){
            return;
        }

        var propertyName = this.propertyName();

        richApp.dispatch(PropertyActions.patched(changeType, propertyName, value, async));
    };

    previewPatchValue(changeType, value){
        if (this.props.onPreviewingPatchValue && this.props.onPreviewingPatchValue(value, this.props.p) === false){
            return;
        }

        if (this._noPreview){
            return;
        }

        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }

        richApp.dispatch(PropertyActions.previewPatch(changeType, this.propertyName(), value));
    }

    cancelEdit(){
        if (this.props.onCancelEdit && this.props.onCancelEdit(this.props.p) === false){
            return;
        }

        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }

        richApp.dispatch(PropertyActions.cancelEdit());
    }

    setValueByCommandDelayed = (value) => {
        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }
        this._setValueTimer = setTimeout(() => this.setValueByCommand(value), 500);
    };

    _renderPropName(){
        return <div className={ this.b('name') }><FormattedHTMLMessage id={ this.displayName() }/></div>
    }

    propertyDescriptor(){
        return this.props.p.get("descriptor");
    }

    displayName(){
        return this.propertyDescriptor().displayName;
    }

    propertyName(){
        return this.propertyDescriptor().name;
    }

    propertyType(){
        return this.propertyDescriptor().type;
    }

    extractOption(props, name, defaultValue = undefined){
        var options = props.p.get("options");
        if (options){
            var value = options[name];
            if (value !== undefined){
                return value;
            }
        }
        return defaultValue;
    }

    widthClass(defaultValue){
        var size = this.extractOption(this.props, "size");
        switch (size){
            case 1:
                return "prop_width-1-1";
            case 1/2:
                return "prop_width-1-2";
            case 1/3:
                return "prop_width-1-3";
            case 1/4:
                return "prop_width-1-4";
            case 3/4:
                return "prop_width-1-34";
            case 1/8:
                return "prop_width-1-18";
            case 7/8:
                return "prop_width-1-78";
            default:
                return defaultValue;
        }
    }

    b(elem, mods = null, mix = null) { return bem("prop", elem, mods, mix) }

    prop_cn(mods, mix) {
        var cn = bem("prop", null, mods, mix);
        cn += " prop_" + this.propertyType();
        return cn;
    }
}