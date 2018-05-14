import * as React from "react";
import * as PropTypes from "prop-types";
import * as Immutable from "immutable";
import { app } from "carbon-core";
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
import NumericEditor from "../properties/editors/NumericEditor";

var rows = Immutable.Map({
    descriptor: {
        name: "rows",
        displayName: "@rowsCount"
    },
    options: {
        min: 1,
        max: 40
    },
    value: 2,
});

var columns = Immutable.Map({
    descriptor: {
        name: "columns",
        displayName: "@colsCount"
    },
    options: {
        min: 1,
        max: 40
    },
    value: 2,
});

var vmargin = Immutable.Map({
    descriptor: {
        name: "vmargin",
        displayName: "@vmargin"
    },
    options: {
        min: 0,
        max: 200
    },
    value: 20,
});

var hmargin = Immutable.Map({
    descriptor: {
        name: "hmargin",
        displayName: "@hmargin"
    },
    options: {
        min: 0,
        max: 200
    },
    value: 20,
});

export default class RepateDropButton extends Component<any> {
    refs: {
        flyout: FlyoutButton;
    }

    rows: number;
    columns: number;
    vmargin: number;
    hmargin: number;

    componentDidMount() {
        super.componentDidMount();
        this.rows = 2;
        this.columns = 2;
        this.vmargin = 20;
        this.hmargin = 20;
    }

    _action = (event) => {
        event.stopPropagation();
    }

    _stopPropagation(event) {
        event.stopPropagation();
    }

    _repeate = () => {
        var cols = this.columns;
        var rows = this.rows;
        app.actionManager.invoke("repeater.group", JSON.stringify({ columns: cols, rows: rows, innerMarginX:this.hmargin, innerMarginY:this.vmargin }));
        this.refs.flyout.close();
    }

    _onRowsChanged = (value) => {
        this.rows = value;
        return false;
    }

    _onColumnsChanged = (value) => {
        this.columns = value;
        return false;
    }

    _onVMarginChanged = (value) => {
        this.vmargin = value;
        return false;
    }

    _onHMarginChanged = (value) => {
        this.hmargin = value;
        return false;
    }

    render() {
        return <FlyoutButton ref="flyout"
            position={{ targetVertical: "bottom", targetHorizontal: "center" }}
            renderContent={() =>
                <IconButton icon={icons.repeat_menu} width={46} height={46} />
            }>
            <RepeatFlyoutBody onClick={e => e.stopPropagation()}>
                <FlyoutHeader icon={icons.repeat_small} label="@repeater.group" />
                <TextGroup>
                    <NumericEditor type="subproperty" e={null} p={rows} onPreviewingValue={() => false} onSettingValue={this._onRowsChanged} />
                    <NumericEditor type="subproperty" e={null} p={columns} onPreviewingValue={() => false} onSettingValue={this._onColumnsChanged} />
                </TextGroup>
                <TextGroup>
                    <NumericEditor type="subproperty" e={null} p={vmargin} onPreviewingValue={() => false} onSettingValue={this._onVMarginChanged} />
                    <NumericEditor type="subproperty" e={null} p={hmargin} onPreviewingValue={() => false} onSettingValue={this._onHMarginChanged} />
                </TextGroup>
                <RepeatButton label="@makeRepeaterGrid" onClick={this._repeate}></RepeatButton>
            </RepeatFlyoutBody>
        </FlyoutButton>
    }
}

const TextGroup = styled(HorizontalGroup) `
    justify-content:space-between;
    & > * {
        margin-top:22px;
        width:70px;
    }
`

const RepeatButton = styled(MainButton).attrs<any>({}) `
    width:100%;
    margin: 30px 0 10px 0;
`;

const RepeatFlyoutBody = styled(FlyoutBody) `
    min-width:180px;
`
