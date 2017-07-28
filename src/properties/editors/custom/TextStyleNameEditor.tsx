import React from "react";
import cx from "classnames";
import {
    app,
    StyleManager,
    PatchType,
    Font
} from "carbon-core";
import {richApp} from "../../../RichApp";
import {FormattedMessage} from "react-intl";
import StyleNameEditor from "./StyleNameEditor";


var TextStyle = (props)=> {
    var style;
    if (props.style.font) {
        style = {font:Font.cssString(props.style.font, .5)};
    } else {
        style = {};
    }

    return <div className="prop__option style-item" onClick={props.onClick} data-style-id={props.id}>
        <span style={style}>{props.name}</span>
    </div>
}

export default class TextStyleNameEditor extends StyleNameEditor {
    refs: {
        manageDialog: any
    }

    constructor(props) {
        super(props);
    }

    isPending() {
        var element = this.props.e.first();
        return element.hasPendingTexStyle();
    }

    renderChildren() {
        var styles = [{id: "", name: "", props: {}}].concat(StyleManager.getStyles(2));
        return styles.map(s => {
            return <TextStyle id={s.id}
                              name={s.name}
                              key={s.name}
                              onClick={this.changeCurrentStyle}
                              style={s.props}/>
        });
    }

    applyChanges = () => {
        var element = this.props.e.first();
        var props = element.getTextStyleProps();
        var textStyleId = element.textStyleId();
        app.updateStyle(2, textStyleId, props);
        this.setValueByCommand(element.textStyleId());
    }

    discardChanges = e=> {
        var element = this.props.e.first();
        this.setValueByCommand(element.textStyleId());
    }

    createNewStyle = ()=> {
        var element = this.props.e;
        var name = StyleManager.getStyleNameForElement(element, 2);
        this.setState({editName: name});
    }

    onCompleteEditing = (value)=> {
        if (this.state.editName) {
            var element = this.props.e.first();
            this.setState({editName: null});
            var props = element.getTextStyleProps();
            var style = StyleManager.createStyle(value, 2, props);
            app.patchProps(PatchType.Insert, "textStyles", style);
            element.setProps({textStyleId: style.id});
        }
    }

    manageStyles = ()=> {
        this.refs.manageDialog.show(2);
    }

    formatSelectedValueInternal(){
        return StyleManager.getStyle(this.propertyValue(), 2);
    }
}