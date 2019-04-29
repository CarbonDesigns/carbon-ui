import * as React from "react";
import * as PropTypes from "prop-types";
import { app } from "carbon-core";
import * as cx from "classnames";
import { Component, CarbonLabel, dispatchAction } from "../CarbonFlux";
import styled from "styled-components";
import theme from "../theme";

interface ICodeDesignSwitchProps extends IReactElementProps {
    mode: "code" | "visual";
}

export default class CodeDesignSwitch extends Component<ICodeDesignSwitchProps> {
    _action = (event) => {
        event.stopPropagation();
    }

    _stopPropagation(event) {
        event.stopPropagation();
    }

    setMode(mode) {
        dispatchAction({ type: "Carbon_PrototypeMode", mode });
    }

    render() {

        return (
            <SwitchContainer>
                <SkewContainer>
                    <LeftSwitch onClick={() => this.setMode("visual")} active={this.props.mode === "visual"}><CarbonLabel id="@visual" /></LeftSwitch>
                    <RightSwitch onClick={() => this.setMode("code")} active={this.props.mode === "code"}><CarbonLabel id="@code" /></RightSwitch>
                </SkewContainer>
            </SwitchContainer>
        )
    }
}

const SkewContainer = styled.div`
    overflow:hidden;
    border-radius:8px;
    width:144px;
    height:20px;
    display:flex;
`;

const SwitchContainer = styled.div`
    display:flex;
    align-items:center;
    width:100%;
`;

const SwitchItem = styled.div<{ active: boolean }>`
    height: 20px;
    width:82px;
    background-color:${p => !p.active ? '#d7d7d7' : theme.accent};
    color:${p => p.active ? theme.text_color : theme.text_color_alternate};
    ${p => p.active ? 'background-image: linear-gradient(to right, #ff4295 0%, #ff292c 100%);' : ''}
    font:${theme.default_font};
    display:flex;
    justify-content: center;
    align-items: center;
    cursor:pointer;
`;

const LeftSwitch = styled(SwitchItem) `
    transform: skew(-20deg);
    margin-left:-10px;
    padding-left:10px;
    & > span {
        transform: skew(20deg);
    }
`;

const RightSwitch = styled(SwitchItem) `
    margin-left:2px;
    transform: skew(-20deg);
    padding-right:10px;
    margin-right:-10px;
    & > span {
        transform: skew(20deg);
    }
`;


