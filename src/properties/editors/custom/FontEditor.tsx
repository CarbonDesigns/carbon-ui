import React from 'react';
import Immutable from "immutable";

import EditorComponent, { IEditorProps } from "../EditorComponent";
import NumericEditor from "../NumericEditor";
import DropDownEditor from "../DropdownEditor";
import BrushEditor from "../BrushEditor";
import MultiToggleEditor from "../MultiToggleEditor";
import TextAlignEditor from "../custom/TextAlignEditor";
import FontFamilyList from './FontFamilyList';
import { richApp } from "../../../RichApp";

import { app, Font, TextAlign, FontScript, FontWeight, FontStyle, UnderlineStyle, Brush } from "carbon-core";

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
                displayName: "Typeface"
            },
            options: {
                size: 3 / 4
            },
            value: font.family,
        });
        var size = Immutable.Map({
            descriptor: {
                name: "size",
                displayName: "Size"
            },
            options: {
                size: 1 / 4,
                min: 1
            },
            value: font.size,
        });
        var weight = Immutable.Map({
            descriptor: {
                name: "weight",
                displayName: "Weight"
            },
            options: this._createWeightOptions(metadata, font),
            value: font.weight,
        });
        var lineSpacing = Immutable.Map({
            descriptor: {
                name: "lineSpacing",
                displayName: "Line spacing"
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
            options: {
                size: 1 / 4
            },
            value: Brush.createFromColor(font.color),
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
                    { value: TextAlign.left, icon: "ico-prop_align-left", prop: "align" },
                    { value: TextAlign.center, icon: "ico-prop_align-center", prop: "align" },
                    { value: TextAlign.right, icon: "ico-prop_align-right", prop: "align" },
                    { value: TextAlign.justify, icon: "ico-prop_align-right", prop: "align" },

                    { value: TextAlign.top, icon: "ico-prop_align-top", prop: "valign" },
                    { value: TextAlign.middle, icon: "ico-prop_align-middle", prop: "valign" },
                    { value: TextAlign.bottom, icon: "ico-prop_align-bottom", prop: "valign" }
                ]
            },
            value: font,
        });

        this.state = {
            family,
            size,
            weight,
            style,
            align,
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
        if (oldFont.align !== newFont.align || oldFont.valign !== newFont.valign) {
            newState.align = oldState.align.set("value", newFont); //yes, full font
        }
        if (oldFont.color !== newFont.color) {
            newState.color = oldState.color.set("value", Brush.createFromColor(newFont.color));
        }
        if (oldFont.lineSpacing !== newFont.lineSpacing) {
            newState.lineSpacing = oldState.lineSpacing.set("value", newFont.lineSpacing);
        }

        if (oldFont.family !== newFont.family || oldFont.weight !== newFont.weight || oldFont.style !== newFont.style) {
            var metadata = app.getFontMetadata(newFont.family);

            newState.weight = newState.weight || oldState.weight;
            newState.weight = newState.weight.set("options", this._createWeightOptions(metadata, newFont));

            newState.style = newState.style || oldState.style;
            newState.style = newState.style.set("options", this._createStyleOptions(metadata, newFont));
        }

        this.setState(newState);
    }

    _createWeightOptions(metadata, font) {
        return {
            size: 3 / 4,
            items: weights.filter(w => metadata.fonts.some(f => f.weight === w.value && f.style === font.style))
        }
    }
    _createStyleOptions(metadata, font) {
        var options = { items: [] };

        if (metadata.fonts.some(f => f.style === FontStyle.Italic && f.weight === font.weight)) {
            options.items.push(
                { field: "style", icon: "ico-prop_italic", config: { on: FontStyle.Italic, off: FontStyle.Normal } }
            );
        }
        options.items.push(
            { field: "underline", icon: "ico-prop_underline-solid", config: { on: UnderlineStyle.Solid, off: UnderlineStyle.None } },
            { field: "underline", icon: "ico-prop_underline-dotted", config: { on: UnderlineStyle.Dotted, off: UnderlineStyle.None } },
            { field: "underline", icon: "ico-prop_underline-dashed", config: { on: UnderlineStyle.Dashed, off: UnderlineStyle.None } },
            { field: "strikeout", icon: "ico-prop_striked" },
            { field: "script", icon: "ico-prop_striked", config: { on: FontScript.Super, off: FontScript.Normal } },
            { field: "script", icon: "ico-prop_striked", config: { on: FontScript.Sub, off: FontScript.Normal } }
        );
        return options;
    }

    render() {
        return <div className="props-group__list">
            <NumericEditor e={this.props.e} p={this.state.size} selectOnEnter={false}
                onSettingValue={this.changeFontSize}
                onPreviewingValue={this.previewFontSize} />

            <DropDownEditor e={this.props.e} p={this.state.family} disableAutoClose formatSelectedValue={() => {return {name: this.state.family.get("value")}}}>
                <FontFamilyList e={this.props.e} p={this.state.family} onSelected={this.changeFontFamily} ref="fontFamilyList" />
            </DropDownEditor>

            <BrushEditor e={this.props.e} p={this.state.color}
                onSettingValue={this.changeFontColor}
                onPreviewingValue={this.previewFontColor} />

            <DropDownEditor e={this.props.e} p={this.state.weight}
                onSettingValue={this.changeFontWeight} />

            <MultiToggleEditor e={this.props.e} p={this.state.style}
                onSettingValue={this.changeFontStyle} />

            <TextAlignEditor e={this.props.e} p={this.state.align}
                onSettingValue={this.changeTextAlign} />

            {/*
                <NumericEditor e={this.props.e} p={charSpacingProperty}
                               onSettingValue={this.changeFontProperty.bind(this, "charSpacing")}
                               onPreviewingValue={this.previewFontProperty.bind(this, "charSpacing")}/>
            */}

            <NumericEditor e={this.props.e} p={this.state.lineSpacing}
                onSettingValue={this.changeLineSpacing}
                onPreviewingValue={this.previewLineSpacing} />
        </div>
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

    };
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

    changeTextAlign = changes => {
        this.setValueByCommand(changes);
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
        // if (Environment.controller.isInlineEditMode){
        //     Environment.view.focus();
        // }
    }
}