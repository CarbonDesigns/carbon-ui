import * as React from "react";
import * as PropTypes from "prop-types";
import StringEditor from "../StringEditor";
import {iconType} from "../../../utils/appUtils";

export default class NameEditor extends StringEditor{
    static contextTypes = {
        intl: PropTypes.object
    };

    constructor(props){
        super(props);
    }
    getValue(){
        let value = this.propertyValue();
        //undefined means name is different in multiselection
        if (value === undefined){
            return "";
        }
        return value || this.props.e.displayName();
    }
    renderPropertyName(){
        let element = this.props.e.singleOrSelf();
        let name;

        if(element.allowNameTranslation()) {
            name = this.context.intl.formatMessage({id:element.displayType()}, {index:''});
        }
        else {
            name = element.displayType();
        }
        return <div className="prop__name">
            {this._renderDisplayIcon()}
            {name}
        </div>;
    }
    _renderDisplayIcon(){
        var element = this.props.e.singleOrSelf();
        var className = "inline-ico type-icon type-icon_" + iconType(element);

        return <i className={className}/>;
    }
}