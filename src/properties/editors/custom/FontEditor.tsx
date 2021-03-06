import * as React from "react";
import * as Immutable from "immutable";

import EditorComponent, { IEditorProps } from "../EditorComponent";
import NumericEditor from "../NumericEditor";
import DropDownEditor from "../DropdownEditor";
import BrushEditor from "../BrushEditor";
import MultiToggleEditor from "../MultiToggleEditor";
import MultiSwitchEditor from "../MultiSwitchEditor";
import FontFamilyList from './FontFamilyList';

import { app, Font, TextAlign, FontWeight, FontStyle, UnderlineStyle, Brush } from "carbon-core";
import { CarbonLabel } from "../../../CarbonFlux";
import { PropertyLineContainer, PropertyListContainer, PropertyNameContainer } from "../../PropertyStyles";
import styled from "styled-components";
import theme from "../../../theme";
import icons from "../../../theme-icons";

var weights = [
    { name: "Thin (100)", value: 100 },
    { name: "Extra light (200)", value: 200 },
    { name: "Light (300)", value: 300 },
    { name: "Regular (400)", value: 400 },
    { name: "Medium (500)", value: 500 },
    { name: "Semi bold (600)", value: 600 },
    { name: "Bold (700)", value: 700 },
    { name: "Extra bold (800)", value: 800 },
    { name: "Heavy (900)", value: 900 }
];

interface IFontEditorState {
    value: Font;
    family: Immutable.Map<string, any>;
    size: Immutable.Map<string, any>;
    weight: Immutable.Map<string, any>;
    style: Immutable.Map<string, any>;
    align: Immutable.Map<string, any>;
    valign: Immutable.Map<string, any>;
    lineSpacing: Immutable.Map<string, any>;
    color: Immutable.Map<string, any>;
}

export default class FontEditor extends EditorComponent<Font, IEditorProps, IFontEditorState> {
    constructor(props) {
        super(props);
        var font = this.propertyValue();
        var metadata = app.getFontMetadata(font.family);

        var family = Immutable.Map({
            descriptor: {
                name: "family",
                displayName: "@typeface"
            },
            value: font.family,
        });
        var size = Immutable.Map({
            descriptor: {
                name: "size",
                displayName: "Size"
            },
            options: {
                min: 1
            },
            value: font.size,
        });
        var weight = Immutable.Map({
            descriptor: {
                name: "weight",
                displayName: "@weight"
            },
            options: this._createWeightOptions(metadata, font),
            value: font.weight,
        });
        var lineSpacing = Immutable.Map({
            descriptor: {
                name: "lineSpacing",
                displayName: "@line"
            },
            options: {
                step: .1,
                min: .1
            },
            value: font.lineSpacing
        });
        var color = Immutable.Map({
            descriptor: {
                name: "color",
                displayName: "Color",
            },
            value: Brush.createFromCssColor(font.color),
        });
        var style = Immutable.Map({
            descriptor: {
                name: "style",
                displayName: "Style",
            },
            options: this._createStyleOptions(metadata, font),
            value: font,
        });
        var align = Immutable.Map({
            descriptor: {
                name: "align",
                displayName: "Align"
            },
            options: {
                items: [
                    { value: TextAlign.left, icon: icons.text_left },
                    { value: TextAlign.center, icon: icons.text_center },
                    { value: TextAlign.right, icon: icons.text_right },
                    { value: TextAlign.justify, icon: icons.text_dist }
                ]
            },
            value: font.align,
        });

        var valign = Immutable.Map({
            descriptor: {
                name: "valign",
                displayName: "vAlign"
            },
            options: {
                items: [
                    { value: TextAlign.top, icon: icons.text_top },
                    { value: TextAlign.middle, icon: icons.text_middle },
                    { value: TextAlign.bottom, icon: icons.text_bottom }
                ]
            },
            value: font.valign,
        });

        this.state = {
            family,
            size,
            weight,
            style,
            align,
            valign,
            lineSpacing,
            color,
            value: this.propertyValue()
        }
    }

    componentWillReceiveProps(nextProps) {
        var oldFont = this.propertyValue();
        var newFont = nextProps.p.get("value");
        var oldState = this.state;
        var newState: any = { value: newFont };

        if (oldFont.family !== newFont.family) {
            newState.family = oldState.family.set("value", newFont.family);
        }
        if (oldFont.size !== newFont.size) {
            newState.size = oldState.size.set("value", newFont.size);
        }
        if (oldFont.weight !== newFont.weight) {
            newState.weight = oldState.weight.set("value", newFont.weight);
        }
        if (oldFont.style !== newFont.style || oldFont.underline !== newFont.underline || oldFont.strikeout !== newFont.strikeout || oldFont.script !== newFont.script) {
            newState.style = oldState.style.set("value", newFont); //yes, full font
        }
        if (oldFont.align !== newFont.align) {
            newState.align = oldState.align.set("value", newFont.align);
        }
        if (oldFont.valign !== newFont.valign) {
            newState.valign = oldState.valign.set("value", newFont.valign);
        }
        if (oldFont.color !== newFont.color) {
            newState.color = oldState.color.set("value", Brush.createFromCssColor(newFont.color));
        }
        if (oldFont.lineSpacing !== newFont.lineSpacing) {
            newState.lineSpacing = oldState.lineSpacing.set("value", newFont.lineSpacing);
        }

        if (oldFont.family !== newFont.family || oldFont.weight !== newFont.weight || oldFont.style !== newFont.style) {

            newState.weight = newState.weight || oldState.weight;
            newState.style = newState.style || oldState.style;

            if (newFont.family) {
                var metadata = app.getFontMetadata(newFont.family);
                newState.weight = newState.weight.set("options", this._createWeightOptions(metadata, newFont));
                newState.style = newState.style.set("options", this._createStyleOptions(metadata, newFont));
            }
        }

        this.setState(newState);
    }

    _createWeightOptions(metadata, font) {
        return {
            size: 3 / 4,
            items: metadata ? weights.filter(w => metadata.fonts.some(f => f.weight === w.value && f.style === font.style)) : []
        }
    }

    _createStyleOptions(metadata, font) {
        var options = { items: [] };

        if (metadata && metadata.fonts.some(f => f.style === FontStyle.Italic && f.weight === font.weight)) {
            options.items.push(
                { field: "style", icon: "ico-prop_italic", config: { on: FontStyle.Italic, off: FontStyle.Normal } }
            );
        }
        options.items.push(
            { field: "underline", icon: "ico-prop_underline-solid", config: { on: UnderlineStyle.Solid, off: UnderlineStyle.None } },
            { field: "underline", icon: "ico-prop_underline-dotted", config: { on: UnderlineStyle.Dotted, off: UnderlineStyle.None } },
            { field: "underline", icon: "ico-prop_underline-dashed", config: { on: UnderlineStyle.Dashed, off: UnderlineStyle.None } },
            // { field: "strikeout", icon: "ico-prop_striked" },
            // { field: "script", icon: "ico-prop_striked", config: { on: FontScript.Super, off: FontScript.Normal } },
            // { field: "script", icon: "ico-prop_striked", config: { on: FontScript.Sub, off: FontScript.Normal } }
        );
        return options;
    }

    render() {
        return <PropertyListContainer>
            <DropDownEditor e={this.props.e} p={this.state.family} syncWidth={false} targetHorizontal="right" sourceHorizontal="right" disableAutoClose formatSelectedValue={() => { return { name: this.state.family.get("value") } }}>
                <FontFamilyList e={this.props.e} p={this.state.family} onSelected={this.changeFontFamily} />
            </DropDownEditor>

            <DropDownEditor e={this.props.e} p={this.state.weight}
                onSettingValue={this.changeFontWeight} />

            <ColorSizeLine>
                <div></div>
                <BrushEditor e={this.props.e} p={this.state.color}
                    onSettingValue={this.changeFontColor}
                    onPreviewingValue={this.previewFontColor} />

                <NumericEditor e={this.props.e} p={this.state.size} selectOnEnter={false}
                    onSettingValue={this.changeFontSize}
                    type="subproperty"
                    onPreviewingValue={this.previewFontSize} />
            </ColorSizeLine>

            <PropertyLineContainer>
                <PropertyNameContainer><CarbonLabel id="@spacing" /></PropertyNameContainer>
                <NumericEditor e={this.props.e} p={this.state.lineSpacing}
                    onSettingValue={this.changeLineSpacing}
                    type="subproperty"
                    onPreviewingValue={this.previewLineSpacing} />
            </PropertyLineContainer>

            <PropertyLineContainer>
                <div></div>
                <MultiSwitchEditor className="textAlign" type="subproperty" e={this.props.e} p={this.state.align} onSettingValue={this.changeTextAlign} />
            </PropertyLineContainer>
            <PropertyLineContainer>
                <div></div>
                <MultiSwitchEditor className="textVAlign"  type="subproperty" e={this.props.e} p={this.state.valign} onSettingValue={this.changeTextVAlign} />
            </PropertyLineContainer>

            <PropertyLineContainer>
                <div></div>
                <MultiToggleEditor e={this.props.e} p={this.state.style} onSettingValue={this.changeFontStyle} />
            </PropertyLineContainer>


            {/*
                <NumericEditor e={this.props.e} p={charSpacingProperty}
                               onSettingValue={this.changeFontProperty.bind(this, "charSpacing")}
                               onPreviewingValue={this.previewFontProperty.bind(this, "charSpacing")}/>
            */}

        </PropertyListContainer>
    }

    changeFontFamily = metadata => {
        var font = this.state.value;
        var extension = this.prepareFamilyExtension(font, metadata);
        var newFont = Font.extend(font, extension);

        app.saveFontMetadata(metadata);
        app.loadFont(newFont.family, newFont.style, newFont.weight)
            .then(() => {
                this.setValueByCommand(extension);
                this.focusViewIfNeeded();
            });

    }

    prepareFamilyExtension(font, metadata) {
        var extension = { family: metadata.name, weight: font.weight, style: font.style };
        var i = 0;
        while (!metadata.fonts.some(x => x.style === extension.style && x.weight === extension.weight)) {
            ++i;
            if (i === 1) {
                extension.style = FontStyle.Normal;
            }
            else if (i === 2) {
                extension.weight = FontWeight.Regular;
            }
            else if (i === 3) {
                extension.style = metadata.fonts[0].style;
                extension.weight = metadata.fonts[0].weight;
                break;
            }
        }
        if (extension.weight === font.weight) {
            delete extension.weight;
        }
        if (extension.style === font.style) {
            delete extension.style;
        }
        return extension;
    }

    changeTextAlign = value => {
        var font = this.props.p.get("value");
        font = Font.extend(font, { align: value });
        this.setValueByCommand(font);
        return false;
    };

    changeTextVAlign = value => {
        var font = this.props.p.get("value");
        font = Font.extend(font, { valign: value });
        this.setValueByCommand(font);
        return false;
    };

    changeFontStyle = changes => {
        if (changes.style) {
            var newFont = Font.extend(this.state.value, changes);
            app.loadFont(newFont.family, newFont.style, newFont.weight)
                .then(() => {
                    this.setValueByCommand(changes);
                    this.focusViewIfNeeded();
                });
        }
        else {
            this.setValueByCommand(changes);
            this.focusViewIfNeeded();
        }
        return false;
    };
    changeFontWeight = newWeight => {
        var font = this.state.value;
        var extension = { weight: newWeight };
        var newFont = Font.extend(font, extension);

        app.loadFont(font.family, newFont.style, newFont.weight)
            .then(() => {
                this.setValueByCommand(extension);
                this.focusViewIfNeeded();
            });
        return false;
    };
    changeFontColor = brush => {
        this.setValueByCommand({ color: brush.value });
        return false;
    };
    previewFontColor = brush => {
        this.previewValue({ color: brush.value });
        return true;
    };
    previewFontSize = value => {
        return this.previewFontProperty("size", value);
    };
    changeFontSize = value => {
        return this.changeFontProperty("size", value);
    };
    previewLineSpacing = value => {
        return this.previewFontProperty("lineSpacing", value);
    };
    changeLineSpacing = value => {
        return this.changeFontProperty("lineSpacing", value);
    };
    changeFontProperty(name, value) {
        var changes = {};
        changes[name] = value;
        this.setValueByCommand(changes);
        this.focusViewIfNeeded();
        return false;
    }
    previewFontProperty(name, value) {
        var changes = {};
        changes[name] = value;
        this.previewValue(changes);
        return false;
    }
    focusViewIfNeeded() {
        //TODO: inconvenient either way, think if we need to support the scenario of first changing font property
        //and only then typing text
        // if (Workspace.controller.isInlineEditMode){
        //     Workspace.view.focus();
        // }
    }
}

const ColorSizeLine = styled.div`
    display:grid;
    grid-template-columns: 1fr 60px 60px;
    width:100%;
    margin-bottom:15px;
    margin-top:5px;
    padding: 0 ${theme.margin1};
`;