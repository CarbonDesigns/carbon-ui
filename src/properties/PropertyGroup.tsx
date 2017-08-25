import React from 'react';
import {Component} from "../CarbonFlux";

import ConstraintsEditor from "./editors/ConstraintsEditor";
import ShadowsEditor from "./editors/ShadowsEditor";
import CornersEditor from "./editors/CornersEditor";

import NumericEditor from "./editors/NumericEditor";
import StringEditor from "./editors/StringEditor";
import ToggleEditor from "./editors/ToggleEditor";
import SwitchEditor from "./editors/SwitchEditor";
import CheckboxEditor from "./editors/CheckboxEditor";
import DropDownEditor from "./editors/DropdownEditor";
import BrushEditor from "./editors/BrushEditor";
import StrokePatternEditor from "./editors/custom/StrokePatternEditor";
import MultiToggleEditor from "./editors/MultiToggleEditor";

import TextAlignEditor from "./editors/custom/TextAlignEditor";
import FontEditor from "./editors/custom/FontEditor";
import StyleNameEditor from "./editors/custom/StyleNameEditor";
import TextStyleNameEditor from "./editors/custom/TextStyleNameEditor";
import ArtboardSizes from "./editors/custom/ArtboardSizes";
import BoxEditor from "./editors/custom/BoxEditor";
import MultiSwitchEditor from "./editors/MultiSwitchEditor";

import ActionsEditor from "./editors/actions/ActionsEditor";

import CustomPropertiesEditor from "./editors/custom/CustomPropertiesEditor";
import StatesEditor from "./editors/custom/StatesEditor";

import {app, TileSize, Types} from "carbon-core";

import {FormattedHTMLMessage} from "react-intl";
import ToolboxGroupEditor from "./editors/custom/ToolboxGroupEditor";

interface IPropertyGroupProps {
    e: any, // page element
    g: any  // property group
}

export class PropertyGroup extends Component<IPropertyGroupProps, any> {
    _hasVisiblePropertiesInTheGroup(properties) {
        return properties.some(prop => prop.get("visible"));
    }

    render() {
        var properties = this.props.g.get("properties");

        if (this._hasVisiblePropertiesInTheGroup(properties)) {
            return <div className="props-group">
                <div className="props-group__heading">
                    <FormattedHTMLMessage tagName="h5" id={this.props.g.get("label") || "empty.label"}/>
                </div>
                <section className="props-group__list">
                    {properties.map(p => this._chooseEditor(p))}
                </section>
            </div>;
        }
        return null;
    }

    _chooseEditor(prop) {
        if (!prop || !prop.get("visible")) {
            return null;
        }

        var descriptor = prop.get("descriptor");
        var key = descriptor.name;
        var elem = this.props.e;

        var options, empty_option_name;

        switch (descriptor.type) {
            case "shadow":
                return <ShadowsEditor e={elem} p={prop} key={key} items={null} />;
            case "constraints":
                return <ConstraintsEditor e={elem} p={prop} key={key}/>;
            case "corners":
                return <CornersEditor e={elem} p={prop} key={key}/>;
            case "strokePattern":
                return <StrokePatternEditor  e={elem} p={prop} key={key}/>;


            case "numeric":
                return <NumericEditor e={elem} p={prop} key={key}/>;
            case "text":
                return <StringEditor e={elem} p={prop} key={key}/>;
            case "toggle":
                return <ToggleEditor e={elem} p={prop} key={key}/>;
            case "switch":
                return <SwitchEditor e={elem} p={prop} key={key}/>;
            case "checkbox":
                return <CheckboxEditor e={elem} p={prop} key={key}/>;
            case "dropdown":
                return <DropDownEditor e={elem} p={prop} key={key}/>;
            case "brush":
                return <BrushEditor e={elem} p={prop} key={key}/>;
            case "multiToggle":
                return <MultiToggleEditor e={elem} p={prop} key={key}/>;
            case "textAlign":
                return <TextAlignEditor e={elem} p={prop} key={key}/>;
            case "box":
                return <BoxEditor e={elem} p={prop} key={key}/>;
            case "font":
                return <FontEditor e={elem} p={prop} key={key}/>;
            case "multiSwitch":
                return <MultiSwitchEditor e={elem} p={prop} key={key}/>;
            case "artboardSizes":
                return <ArtboardSizes e={elem} p={prop} key={key}/>;
            case "actions":
                return <ActionsEditor e={elem} p={prop} key={key}/>;
            case "styleName":
                return <StyleNameEditor e={elem} p={prop} key={key}/>;
            case "textStyleName":
                return <TextStyleNameEditor e={elem} p={prop} key={key}/>;
            case "customProperties":
                return <CustomPropertiesEditor e={elem} p={prop} key={key}/>;
            case "states":
                return <StatesEditor e={elem} p={prop} key={key}/>;
            case "toolboxGroup":
                return <ToolboxGroupEditor e={elem} p={prop} key={key}/>;
            case "artboard":
                //TODO: move all dynamic options to core project, introduce something like getOptions()
                options = {
                    items: app.activePage.getAllArtboards().map(artboard=> {
                        return {
                            name  : artboard.name(),
                            value : {
                                pageId     : app.activePage.id(),
                                artboardId : artboard.id()
                            }
                        }
                    })
                };
                return <DropDownEditor e={elem} p={prop.set('options', options)} key={key}/>;

            case "frame":
                empty_option_name = 'none';  //fixme - translate!
                var items = [ { name: empty_option_name,  value:null } ];
                options = Object.assign({}, prop.get('options'), {
                    items: items.concat(app.getAllFrames().map(framed_artboard=> {
                        return {
                            name: framed_artboard.name(),
                            value: {
                                pageId     : framed_artboard.parent().id(),
                                artboardId : framed_artboard.id()
                            }
                        }
                    }))
                });
                return <DropDownEditor e={elem} p={prop.set('options', options)} key={key}/>;
        }

        return null;
    }
}

export default PropertyGroup;