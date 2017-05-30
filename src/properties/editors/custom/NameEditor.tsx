import React from "react";
import StringEditor from "../StringEditor";
import {iconType} from "../../../utils/appUtils";

export default class NameEditor extends StringEditor{
    static contextTypes = {
        intl: React.PropTypes.object
    };

    constructor(props){
        super(props);
    }
    getValue(){
        //undefined means name is different in multiselection
        if (this.state.value === undefined || this.state.value === null){
            return "";
        }
        return this.state.value || this.props.e.displayName();
    }
    renderPropertyName(){
        let element = this.props.e.singleOrSelf();
        let name;

        if(element.allowNameTranslation())
        {
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