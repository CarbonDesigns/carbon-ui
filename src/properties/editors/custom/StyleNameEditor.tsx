import React from "react";
import EditorComponent from "../EditorComponent";
import cx from "classnames";
import {
    app,
    StyleManager,
    Brush,
    PatchType
} from "carbon-core";
import DropDownEditor from "../DropdownEditor";
import StringEditor from "../StringEditor";
import ScrollContainer from '../../../shared/ScrollContainer';
import {richApp} from "../../../RichApp";
import {FormattedMessage} from "react-intl";
import Immutable from "immutable";
//import ManageStylesDialog from "../../dialogs/ManageStylesDialog";


var Style = (props)=> {
    var style = Brush.toCss(props.style.fill);
    var styleBorder = Brush.toCss(props.style.stroke);

    return <div className="prop__option style-item" onClick={props.onClick} data-style-id={props.id}>
        <q className="style-indicator-border" style={styleBorder}></q>
        <q className="style-indicator" style={style}></q>
        {props.name}
    </div>
}


export default class StyleNameEditor extends EditorComponent<any, any, any> {
    refs: any;

    constructor(props) {
        super(props);
        this.state = {};
    }

    renderNewStyleItem() {
        if (this.props.e.count() > 1) {
            return;
        }
        return <div className="prop__option prop__section" onMouseDown={this.createNewStyle}><FormattedMessage
            id="stylename.createnew" defaultMessage="Create new style"/></div>
    }


    renderManageStyleItem() {
        return <div className="prop__option prop__section" onMouseDown={this.manageStyles}><FormattedMessage
            id="stylename.manage" defaultMessage="Manage styles"/></div>
    }

    changeStyleName = ()=> {
        return false;
    }

    changeCurrentStyle = e => {
        var styleId = e.currentTarget.dataset.styleId;
        this.setValueByCommand(styleId);
    };

    _renderApplyButtons(pending) {
        if (!pending) {
            return;
        }

        return (
            <div className="stylename-buttons">
                <div className="stylename-button" onClick={this.applyChanges}>
                    <FormattedMessage id="button.apply"
                                      defaultMessage="Apply"/>
                </div>
                <div className="stylename-button" onClick={this.discardChanges}>
                    <FormattedMessage id="button.discard"
                                      defaultMessage="Discard"/>
                </div>
            </div>
        );
    }

    isPending() {
        var element = this.props.e.first();
        return element && element.hasPendingStyle();
    }

    renderChildren() {
        var styles = [{name: "", props: {}, id: "no"}].concat(StyleManager.getStyles(1));
        return styles.map(s => {
            return <Style id={s.id}
                          name={s.name}
                          key={s.id}
                          onClick={this.changeCurrentStyle}
                          style={s.props}/>
        });
    }

    applyChanges = () => {
        var element = this.props.e.first();
        var props = element.getStyleProps();
        var styleId = element.styleId();
        app.updateStyle(1, styleId, props);
        this.setValueByCommand(styleId);
    };

    discardChanges = e=> {
        var element = this.props.e.first();
        this.setValueByCommand(element.styleId());
    };

    onCompleteEditing = (value)=> {
        if (this.state.editName) {
            var element = this.props.e.first();
            this.setState({editName: null});
            var props = element.getStyleProps();
            var style = StyleManager.createStyle(value, 1, props);

            app.patchProps(PatchType.Insert, "styles", style);
            element.setProps({styleId: style.id});
        }
    }

    createNewStyle = ()=> {
        var element = this.props.e;
        var name = StyleManager.getStyleNameForElement(element, 1);
        this.setState({editName: name});
    }

    manageStyles = ()=> {
        this.refs.manageDialog.show();
    }

    render() {
        if (this.state.editName) {
            var styleNameProperty = Immutable.Map({
                name: this.propertyName(),
                displayName: "stylename.change",
                value: this.state.editName,
                options: {
                    noPreview: true
                }
            });
            return <StringEditor e={this.props.e}
                                 p={styleNameProperty}
                                 selectOnMount={true}
                                 onSettingValue={this.changeStyleName}
                                 onComplete={this.onCompleteEditing}
            />
        }


        var pending = this.isPending();

        return (
            <div className="styleProperty-container">
                <DropDownEditor e={this.props.e} p={this.props.p} formatSelectedValue={this.formatSelectedValue}>
                    <ScrollContainer className="flyout__content prop__options-container font-options"
                                     insideFlyout={true}>
                        <div className="prop__options">
                            {this.renderChildren()}

                            {this.renderNewStyleItem()}
                            {this.renderManageStyleItem()}
                        </div>
                    </ScrollContainer>
                </DropDownEditor>
                {this._renderApplyButtons(pending)}
                {/*<ManageStylesDialog ref="manageDialog"/>*/}
            </div>);
    }

    formatSelectedValue = () =>{
        return this.formatSelectedValueInternal();
    }
    formatSelectedValueInternal(){
        return StyleManager.getStyle(this.propertyValue(), 1);
    }
}