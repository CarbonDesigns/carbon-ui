import * as React from "react";
import ColorPicker from "../../shared/ui/ColorPicker";
import { TabContainer, TabTabs, TabHeader, TabPage, TabArea, TabItem } from "../../shared/TabContainer";
import { BrushGammaSelector, Gammas } from "./BrushGammaSelector";
import { richApp } from '../../RichApp';
import { Component } from '../../CarbonFlux';
import { Brush, BrushType } from "carbon-core";
import LinearGradientPicker from "./LinearGradientPicker";

import { FormattedMessage } from "react-intl";

import * as tinycolor from "tinycolor2";
import { TabAreaStyled, TabPageStyled } from "../../components/CommonStyle";
import styled from "styled-components";
import theme from "../../theme";

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
            brush = Brush.createFromCssColor(value);
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
            var brush = Brush.createFromCssColor(color);

        }
        else {
            brush = Brush.createFromCssColor(color.hex);
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
            this.selectBrush(Brush.createFromCssColor(this.props.brush.value.stops[0][1]));
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
        let tabs = [
            [<BrushTabItem tabId="1" key="1"><div className="icon solid"></div></BrushTabItem>]
        ]
        if (this.props.hasGradient) {
            if (brush.type === BrushType.lineargradient) {
                tabId = "2";
            }
            tabs.push([<BrushTabItem tabId="2" key="2"><div className="icon gradient"></div></BrushTabItem>]);
        }

        return <TabContainer currentTabId={tabId} onTabChanged={this.onTabChanged}>
            <BrushTabsButtons>
                {tabs}
            </BrushTabsButtons>
            <TabAreaStyled>
                <TabPageStyled tabId="1" className="solid">
                    <ColorPicker display={true} color={brush.value || "rgba(0,0,0,0)"} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onColorPickerChange} presetColors={[]} />
                </TabPageStyled>
                <TabPageStyled tabId="2" className="gradient">
                    <LinearGradientPicker brush={brush} positionCSS={{ position: "absolute", left: 0 }} onChangeComplete={this.onGradientPickerChange} onPreview={this.props.onPreview} />
                </TabPageStyled>
            </TabAreaStyled>
        </TabContainer>
    }
}

const BrushTabsButtons = styled.div`
    width:100%;
    height:48px;
    display:flex;
    align-items:center;
    justify-content:flex-end;
`;

const BrushTabItem = styled(TabItem)`
    width:26px;
    height:26px;
    background: ${theme.input_background};
    border-radius:4px;
    position: relative;
    margin:8px;
    cursor:pointer;

    .icon {
        width:18px;
        height:18px;
        margin:4px;
    }

    .gradient {
        background-image: linear-gradient(180deg, ${theme.accent} 0%, ${theme.accent.lighten(0.5)} 100%);
    }

    .solid {
        background: ${theme.accent};
    }
`;