import * as React from "react";
import { Component } from "../CarbonFlux";

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

import { app, TileSize, Types } from "carbon-core";

import { FormattedMessage } from "react-intl";
import SymbolGroupEditor from "./editors/custom/SymbolGroupEditor";
import TupleEditor from "./editors/custom/TupleEditor";
import * as Immutable from "immutable";
import OpacityEditor from "./editors/custom/OpacityEditor";
import styled from "styled-components";
import FillsEditor from "./editors/custom/FillsEditor";
import StrokesEditor from "./editors/custom/StrokesEditor";

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
            return <div>
                {/* <div className="props-group__heading">
                    <FormattedMessage tagName="h5" id={this.props.g.get("label") || "empty.label"} />
                </div> */}
                <PropertyListSection>
                    {properties.map(p => this._chooseEditor(p))}
                </PropertyListSection>
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

        if (!descriptor.options && typeof descriptor.getOptions === 'function') {
            prop = prop.set('options', descriptor.getOptions(elem));
        }

        switch (descriptor.type) {
            case "shadow":
                return <ShadowsEditor e={elem} p={prop} key={key} items={null} />;
            case "constraints":
                return <ConstraintsEditor e={elem} p={prop} key={key} />;
            case "corners":
                return <CornersEditor e={elem} p={prop} key={key} />;
            case "numeric":
                return <NumericEditor e={elem} p={prop} key={key} />;
            case "opacity":
                return <OpacityEditor e={elem} p={prop} key={key} />;
            case "text":
                return <StringEditor e={elem} p={prop} key={key} />;
            case "toggle":
                return <ToggleEditor e={elem} p={prop} key={key} />;
            case "switch":
                return <SwitchEditor e={elem} p={prop} key={key} />;
            case "checkbox":
                return <CheckboxEditor e={elem} p={prop} key={key} />;
            case "dropdown":
                return <DropDownEditor e={elem} p={prop} key={key} />;
            case "brush":
                return <BrushEditor e={elem} p={prop} key={key} />;
            case "fills":
                return <FillsEditor e={elem} p={prop} key={key} />;
            case "strokes":
                return <StrokesEditor e={elem} p={prop} key={key} />;
            case "multiToggle":
                return <MultiToggleEditor e={elem} p={prop} key={key} />;
            case "textAlign":
                return <TextAlignEditor e={elem} p={prop} key={key} />;
            case "box":
                return <BoxEditor e={elem} p={prop} key={key} />;
            case "font":
                return <FontEditor e={elem} p={prop} key={key} />;
            case "multiSwitch":
                return <MultiSwitchEditor e={elem} p={prop} key={key} />;
            case "artboardSizes":
                return <ArtboardSizes e={elem} p={prop} key={key} />;
            case "actions":
                return <ActionsEditor e={elem} p={prop} key={key} />;
            case "styleName":
                return <StyleNameEditor e={elem} p={prop} key={key} />;
            case "textStyleName":
                return <TextStyleNameEditor e={elem} p={prop} key={key} />;
            case "customProperties":
                return <CustomPropertiesEditor e={elem} p={prop} key={key} />;
            case "states":
                return <StatesEditor e={elem} p={prop} key={key} />;
            case "symbolGroup":
                return <SymbolGroupEditor e={elem} p={prop} key={key} />;
            case "polygonData": {
                return <TupleEditor e={elem} p={prop} key={key} properties={[
                    Immutable.Map({
                        descriptor: {
                            name: "radius",
                            displayName: "@radius"
                        },
                        options: {
                            min: 0.1
                        },
                        value: elem.getDisplayPropValue("radius")
                    }),
                    Immutable.Map({
                        descriptor: {
                            name: "pointsCount",
                            displayName: "@points"
                        },
                        options: {
                            min: 3,
                            max: 20
                        },
                        value: elem.getDisplayPropValue("pointsCount")
                    })
                ]} />
            }
            case "size": {
                return <TupleEditor e={elem} p={prop} key={key} properties={[
                    Immutable.Map({
                        descriptor: {
                            name: "width",
                            displayName: "@width"
                        },
                        value: elem.width
                    }),
                    Immutable.Map({
                        descriptor: {
                            name: "height",
                            displayName: "@height"
                        },
                        value: elem.height
                    })
                ]} />
            }
            case "rotation": {
                return <TupleEditor e={elem} p={prop} key={key} properties={[
                    Immutable.Map({
                        descriptor: {
                            name: "angle",
                            displayName: "@angle"
                        },
                        value: elem.angle
                    })
                ]} />
            }
        }

        return null;
    }
}

const PropertyListSection = styled.section`
    display: flex;
    flex-wrap: wrap;
`;

export default PropertyGroup;

