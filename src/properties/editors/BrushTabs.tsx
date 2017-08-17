import React from "react";
import ColorPicker from "./ColorPicker";
import { default as TabContainer, TabTabs, TabHeader, TabPage, TabArea } from "../../shared/TabContainer";
import { BrushGammaSelector, Gammas } from "./BrushGammaSelector";
import { richApp } from '../../RichApp';
import { Component } from '../../CarbonFlux';
import { Brush, BrushType } from "carbon-core";
import LinearGradientPicker from "./LinearGradientPicker";

import { FormattedHTMLMessage } from "react-intl";

var basicColors = [
    "white",
    "black",
    "rgb(43,43,43)",
    "rgb(85,85,85)",
    "rgb(128,128,128)",
    "rgb(170,170,170)",
    "rgb(213,213,213)"
];


export default class BrushTabs extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            activeGamma: 0,
            color: props.brush.value || "rgba(0,0,0,0)",
        };
    }

    selectSwatch = e => {
        var value = e.currentTarget.dataset.value;
        var brush;
        if (value === "none") {
            brush = Brush.Empty;
        }
        else {
            brush = Brush.createFromColor(value);
        }
        this.selectBrush(brush);
    };
    viewGamma = i => {
        this.setState({ activeGamma: i });
    };

    onColorPickerChange = color => {
        if (color.rgb.a && color.rgb.a !== 1) {
            var rgba = color.rgb;
            color = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
            var brush = Brush.createFromColor(color);

        }
        else {
            brush = Brush.createFromColor(color.hex);
            color = color.hex;
        }
        this.setState({ color: color });
        this.selectBrush(brush);
    };

    onGradientPickerChange = (value) => {
        let brush = Brush.createFromLinearGradientObject(value);
        this.selectBrush(brush);
    }

    selectBrush(brush) {
        this.props.onSelected(brush);
    }

    onTabChanged = (index) => {

    }

    render() {
        let tabId = "1";

        if(this.props.brush.type === BrushType.lineargradient) {
            tabId = "2";
        }
        {/*[<i key="ico" className="ico-colorpicker-gradient"/>, <FormattedHTMLMessage key="text" id="Gradient"/>],
                    [<i key="ico" className="ico-colorpicker-swatches"/>, <FormattedHTMLMessage key="text" id="Swatches"/>],*/}
        return <TabContainer defaultTabId={tabId} onTabChanged={this.onTabChanged}>
            <TabTabs
                items={[
                    [<i key="ico" className="ico-colorpicker-solid" />, <FormattedHTMLMessage key="text" id="Solid" />],
                    [<i key="ico" className="ico-colorpicker-gradient" />, <FormattedHTMLMessage key="text" id="Gradient" />]
                ]}
            />

            <TabArea className="gui-pages">
                <TabPage className="gui-page" tabId="1">
                    <ColorPicker display={true} color={this.state.color} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onColorPickerChange} presetColors={[]} />
                </TabPage>
                <TabPage className="gui-page" tabId="2">
                    <LinearGradientPicker color={this.state.color} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onGradientPickerChange} />
                </TabPage>
                {/*<TabPage className="gui-page swatches" tabId="2">
                    <div className="swatches__basic-colors">
                        <div className="swatch swatch_transparent" onClick={this.selectSwatch} data-value="none"></div>
                        {basicColors.map(x => {
                            return <div className="swatch" onClick={this.selectSwatch} style={{backgroundColor: x}} data-value={x} key={x}></div>
                        })}
                    </div>*/}
                {/*<div className="swatches__recent-colors">
                        <div className="swatch" style1="background-color: #C5A">
                            <i className="swatch__transparenter" style1="opacity: 0"></i>
                        </div>
                        <div className="swatch" style1="background-color: #7D3">
                            <i className="swatch__transparenter" style1="opacity: 0"></i>
                        </div>
                        <div className="swatch" style1="background-color: #4B6">
                            <i className="swatch__transparenter" style1="opacity: 0"></i>
                        </div>
                        <div className="swatch" style1="background-color: #CBE">
                            <i className="swatch__transparenter" style1="opacity: 0"></i>
                        </div>
                        <div className="swatch" style1="background-color: #A6E">
                            <i className="swatch__transparenter" style1="opacity: 0"></i>
                        </div>
                        <div className="swatch" style1="background-color: #10E">
                            <i className="swatch__transparenter" style1="opacity: 0.65"></i>
                        </div>
                        <div className="swatch" style1="background-color: #CB2">
                            <i className="swatch__transparenter" style1="opacity: 0"></i>
                        </div>
                    </div>*/}
                {/*<div className="swatches__gamma-select">
                        <BrushGammaSelector selectedItem={this.state.activeGamma} onSelect={this.viewGamma}/>
                    </div>
                    <div className="swatches__gamma-preview">
                        {Gammas[this.state.activeGamma].colors.map(x => {
                            return <div className="swatch" onClick={this.selectSwatch} style={{backgroundColor: x}} key={x} data-value={x}></div>
                        })}
                    </div>*/}
                {/*</TabPage>*/}


                {/*<div className="gui-page" ref="tab3">*/}
                {/*<span>3</span>*/}
                {/*</div>*/}
            </TabArea>
        </TabContainer>
    }
}