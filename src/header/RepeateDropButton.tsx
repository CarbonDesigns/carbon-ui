import * as React from "react";
import * as PropTypes from "prop-types";
import {app} from "carbon-core";
import * as cx from "classnames";
import { Component } from "../CarbonFlux";
import FlyoutButton from "../shared/FlyoutButton";
import IconButton from "../components/IconButton";
import FlyoutHeader from "../components/FlyoutHeader";
import icons from "../theme-icons";
import styled from "styled-components";
import TextInput from "../components/TextInput";
import { HorizontalGroup, FlyoutBody } from "../components/CommonStyle";
import MainButton from "../components/MainButton";


export default class RepateDropButton extends Component<any> {
    refs: {
        flyout:FlyoutButton;
    }

    rows:HTMLInputElement;
    columns:HTMLInputElement;

    _action = (event)=> {
        event.stopPropagation();
    }

    _stopPropagation(event) {
        event.stopPropagation();
    }

    _repeate = () => {
        var cols = this.columns.valueAsNumber;
        var rows = this.rows.valueAsNumber;
        app.actionManager.invoke("repeater.group", JSON.stringify({columns:cols, rows:rows}));
        this.refs.flyout.close();
    }

    render() {
        return <FlyoutButton ref="flyout"
        position={{ targetVertical: "bottom", targetHorizontal: "center" }}
        renderContent={() =>
            <IconButton icon={icons.repeat_menu} width={46} height={46} />
        }>
        <RepeatFlyoutBody onClick={e=>e.stopPropagation()}>
            <FlyoutHeader icon={icons.repeat_small} label="@repeater.group"/>
            <TextGroup>
                <TextInput type="number" placeholder="rows" innerRef={x=>this.rows = x} min={1} max={100}></TextInput>
                <TextInput type="number" placeholder="columns" innerRef={x=>this.columns = x} min={1} max={100}></TextInput>
            </TextGroup>
            <TextGroup>
                <TextInput type="number" placeholder="v margin"></TextInput>
                <TextInput type="number" placeholder="h margin"></TextInput>
            </TextGroup>
            <RepeatButton label="@makeRepeaterGrid" onClick={this._repeate}></RepeatButton>
        </RepeatFlyoutBody>
    </FlyoutButton>
    }
}

const TextGroup = styled(HorizontalGroup)`
    justify-content:space-between;
    & > * {
        margin-top:12px;
        width:70px;
    }
`

const RepeatButton = styled(MainButton).attrs<any>({})`
    width:100%;
    margin: 10px 0;
`;

const RepeatFlyoutBody = styled(FlyoutBody)`
    min-width:180px;
`
