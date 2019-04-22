import * as React from "react";
import { Component } from "../../CarbonFlux";
import styled from "styled-components";
import ActionHeader from "../../header/ActionHeader";
import theme from "../../theme";


export default class TopBar extends Component<any, any> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TopBarContainer>
                <ActionHeader/>
                <LineSeparator/>
            </TopBarContainer>
        );
    }
}

const TopBarContainer = styled.div`
    position: absolute;
    background: ${theme.workspace_background};
    top:0;
    left:0;
    right:0;
    height: 64px;
`;

const LineSeparator = styled.div`
    position:absolute;
    right:0px;
    left:0px;
    margin: 0 5px;
    bottom:0;
    height: 1px;
    display:block;
    background: ${theme.separator_color};
`;
