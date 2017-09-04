import React from "react";
import ColorPicker from "../../shared/ui/ColorPicker";
import { default as TabContainer, TabTabs, TabHeader, TabPage, TabArea } from "../../shared/TabContainer";
import { BrushGammaSelector, Gammas } from "./BrushGammaSelector";
import { richApp } from '../../RichApp';
import { Component } from '../../CarbonFlux';
import { Brush, BrushType } from "carbon-core";
import LinearGradientPicker from "./LinearGradientPicker";

import { FormattedMessage } from "react-intl";

import tinycolor from "tinycolor2";

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
            activeGamma: 0
            // brush:props.brush
        };
    }


    // componentDidUpdate(prevProps, prevState) {
    //     super.componentDidUpdate(prevProps, prevState);
    //     if(this.props.brush !== prevProps.brush) {
    //         this.setState({brush:this.props.brush});
    //     }
    // }

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
        // this.setState({ color: color });
        this.selectBrush(brush);
    };

    onGradientPickerChange = (value) => {
        let brush = Brush.createFromLinearGradientObject(value);
        this.selectBrush(brush);
    }

    selectBrush(brush) {
        this.props.onSelected(brush);
        //this.setState({brush:brush});
    }

    onTabChanged = (index) => {
        if (index === "1") {
            this.selectBrush(Brush.createFromColor(this.props.brush.value.stops[0][1]));
        } else {
            var color1 = this.props.brush.value;
            var color2 = tinycolor(color1).darken(30).toString();
            let gradient = { x1: 0.5, y1: 0, x2: 0.5, y2: 1, stops: [[0, color1], [1, color2]] };
            this.selectBrush(Brush.createFromLinearGradientObject(gradient));
        }
    }

    render() {
        let tabId = "1";

        var brush = this.props.brush;
        if (!Brush.isValid(brush)) {
            brush = Brush.Empty;
        }
        let tabs =[
            [<i key="ico" className="ico-colorpicker-solid" />, <FormattedMessage key="text" id="Solid" />]
        ]
        if (this.props.hasGradient) {
            if (brush.type === BrushType.lineargradient) {
                tabId = "2";
            }
            tabs.push( [<i key="ico" className="ico-colorpicker-gradient" />, <FormattedMessage key="text" id="Gradient" />]);
        }

        {/*[<i key="ico" className="ico-colorpicker-swatches"/>, <FormattedMessage key="text" id="Swatches"/>],*/ }
        return <TabContainer currentTabId={tabId} onTabChanged={this.onTabChanged}>
            <TabTabs
                items={tabs}
            />

            <TabArea className="gui-pages">
                <TabPage className="gui-page" tabId="1">
                    <ColorPicker display={true} color={brush.value || "rgba(0,0,0,0)"} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onColorPickerChange} presetColors={[]} />
                </TabPage>
                <TabPage className="gui-page" tabId="2">
                    <LinearGradientPicker brush={brush} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onGradientPickerChange} onPreview={this.props.onPreview} />
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