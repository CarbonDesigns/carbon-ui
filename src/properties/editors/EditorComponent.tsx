import * as React from "react";
import {Component, dispatch, dispatchAction} from "../../CarbonFlux";
import {FormattedMessage} from "react-intl";
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

}

export default class EditorComponent<T, TProps extends IEditorProps = IEditorProps, TState = {}> extends Component<TProps, TState> {
    private _noPreview: boolean;
    protected _setValueTimer: number;

    constructor(props, context?){
        super(props, context);
        this.init(props);
    }
    init(props){
        this._noPreview = this.extractOption(props, "noPreview", false);
    }

    propertyValue(props = this.props): T | undefined{
        return props.p.get("value");
    }

    componentWillReceiveProps(nextProps, nextContext?){
        this.init(nextProps);
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
        dispatchAction({ type: "Properties_Preview", changes, async: false });
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

        dispatchAction({ type: "Properties_Changed", changes, async });
    };
    patchValueByCommand = (patchType, value, async = false) => {
        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }
        if (this.props.onPatchingValue && this.props.onPatchingValue(patchType, value, this.props.p) === false){
            return;
        }

        var propertyName = this.propertyName();

        dispatchAction({ type: "Properties_Patched", patchType, propertyName, value, async });
    };

    previewPatchValue(patchType, value){
        if (this.props.onPreviewingPatchValue && this.props.onPreviewingPatchValue(value, this.props.p) === false){
            return;
        }

        if (this._noPreview){
            return;
        }

        if (this._setValueTimer){
            clearTimeout(this._setValueTimer);
        }

        dispatchAction({ type: "Properties_PatchPreview", patchType, propertyName: this.propertyName(), value, async: false });
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
}