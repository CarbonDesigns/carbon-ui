import * as React from "react";
import * as cx from "classnames";
import * as Immutable from "immutable";

import EditorComponent, { IEditorProps } from "../EditorComponent";
import NumericEditor from "../NumericEditor";
import { richApp } from "../../../RichApp";

import { ISize, Brush, StrokePosition } from "carbon-core";
import { PropertyNameContainer, PropertyTupleContainer, PropertyListHeader, PropertyListContainer, PropertyLineContainer } from "../../PropertyStyles";
import { FormattedMessage } from "react-intl";
import Slider from "../../../components/Slider";

import styled from "styled-components";
import BrushEditor from "../BrushEditor";
import { dispatchAction, CarbonLabel } from "../../../CarbonFlux";
import GuiSelect from "../../../shared/ui/GuiSelect";
import { GuiCheckbox } from "../../../shared/ui/GuiComponents";
import FlyoutButton from "../../../shared/FlyoutButton";
import IconButton from "../../../components/IconButton";
import icons from "../../../theme-icons";
import theme from "../../../theme";
import { FlyoutBody } from "../../../components/CommonStyle";
import MultiSwitchEditor from "../MultiSwitchEditor";

interface INumericEditorProps extends IEditorProps {
}

interface IStrokesEditorState {
    version: number;
}

type StrokePositionSelect = new (props) => GuiSelect<StrokePosition>;
const StrokePositionSelect = GuiSelect as StrokePositionSelect;

function strokePositionLabel(s: StrokePosition | undefined) {
    switch (s) {
        case StrokePosition.Center:
            return "@strokeposition.center";
        case StrokePosition.Inside:
            return "@strokeposition.inside";
        case StrokePosition.Outside:
            return "@strokeposition.outside";
        case undefined:
            return "";
    }
    assertNever(s);
}


class DashEditor extends React.Component<any, any> {
    changeDash1 = (value) => {
        return value;
    }
    render() {
        var dash = Immutable.Map({
            descriptor: {
                name: "dash",
                displayName: "@dash"
            },
            options: {
                min: 0,
                step: 1
            },
            value: 0
        });
        var gap = Immutable.Map({
            descriptor: {
                name: "gap",
                displayName: "@gap"
            },
            options: {
                min: 0,
                step: 1
            },
            value: 0
        });
        return <DashEditorLine>
            <NumericEditor e={this.props.e} p={dash}
                onSettingValue={this.changeDash1}
                type="subproperty" />
            <NumericEditor e={this.props.e} p={gap}
                onSettingValue={this.changeDash1}
                type="subproperty" />
            <NumericEditor e={this.props.e} p={dash}
                onSettingValue={this.changeDash1}
                type="subproperty" />
            <NumericEditor e={this.props.e} p={gap}
                onSettingValue={this.changeDash1}
                type="subproperty" />

        </DashEditorLine>;
    }
}

export default class StrokesEditor extends EditorComponent<ISize, IEditorProps, IStrokesEditorState> {
    constructor(props) {
        super(props);
        this.state = { version: 0 };
    }
    _onJoinsChanged = (value) => {
        this.setPropValueByCommand("lineJoin", value);
        this.setState({ version: this.state.version + 1 });
        return false;
    }

    _onCapChanged = (value) => {
        this.setPropValueByCommand("lineCap", value);
        this.setState({ version: this.state.version + 1 });
        return false;
    }

    render() {
        var p = this.props.p;
        var e = this.props.e;

        var value = p.get("value");
        var opacityProp = Immutable.Map({
            descriptor: {
                name: "opacity",
                displayName: "@opacity"
            },
            options: {
                min: 0,
                max: 100,
                step: 1
            },
            value: value.o
        });

        var widthProp = Immutable.Map({
            descriptor: {
                name: "strokeWidth",
                displayName: "@strokeWidth"
            },
            options: {
                min: 0,
                max: 100,
                step: 1
            },
            value: e.strokeWidth()
        });

        var lineJoin = e.getDisplayPropValue("lineJoin");
        var joinsProperty = Immutable.Map({
            descriptor: {
                name: 'join',
                displayName: "@join"
            },
            options: {
                items: [
                    { value: 0, icon: icons.join1 },
                    { value: 1, icon: icons.join2 },
                    { value: 2, icon: icons.join3 }
                ]
            },
            value: lineJoin
        });

        var lineCap = e.getDisplayPropValue("lineCap");
        var capProperty = Immutable.Map({
            descriptor: {
                name: 'cap',
                displayName: "@cap"
            },
            options: {
                items: [
                    { value: 0, icon: icons.ends1 },
                    { value: 1, icon: icons.ends2 },
                    { value: 2, icon: icons.ends3 }
                ]
            },
            value: lineCap
        });

        var descriptor = e.findPropertyDescriptor("strokePosition");
        var strokePosition = e.getDisplayPropValue("strokePosition", descriptor);

        return <PropertyListContainer>
            <PropertyListHeader>
                <FormattedMessage id="@strokes" />
            </PropertyListHeader>

            <StrokeLineContainer>
                <GuiCheckbox labelless={true} checked={value.e} onChange={this._enableChanged} />
                <BrushEditor e={this.props.e} p={this.props.p} />
                <StrokePositionSelect
                    selectedItem={strokePosition}
                    items={StrokesEditor.StrokePositions}
                    renderItem={StrokesEditor.renderStrokePositionLabel}
                    onSelect={this._onChangeStrokePosition}>
                </StrokePositionSelect>
                <NumericEditor e={this.props.e} p={widthProp}
                    onSettingValue={this.changeStrokeWidthProperty}
                    type="subproperty"
                    uom="px"
                    onPreviewingValue={this.previewStrokeWidthProperty} />

                <FlyoutButton
                    renderContent={() =>
                        <IconButton icon={icons.settings} />
                    }

                    position={{ targetVertical: "bottom", targetHorizontal: "right" }}
                >
                    <StrokeSettings>
                        <FlyoutBody>
                            <StrokeDetailsBody>
                                <div className="joinsLabel" ><CarbonLabel id="@joins" /></div>
                                <div className="capLabel" ><CarbonLabel id="@cap" /></div>
                                <MultiSwitchEditor className="joinsEditor" e={e} p={joinsProperty} onSettingValue={this._onJoinsChanged} />
                                <MultiSwitchEditor className="capEditor" e={e} p={capProperty} onSettingValue={this._onCapChanged} />
                            </StrokeDetailsBody>
                            <DashEditor />
                        </FlyoutBody>
                    </StrokeSettings>
                </FlyoutButton>
            </StrokeLineContainer>
        </PropertyListContainer>
    }

    static StrokePositions = [StrokePosition.Center, StrokePosition.Inside, StrokePosition.Outside];
    private static renderStrokePositionLabel = (item) => <FormattedMessage id={strokePositionLabel(item)} tagName="p" />;

    _onChangeStrokePosition = (value) => {
        this.setPropValueByCommand("strokePosition", value);
        this.setState({ version: this.state.version + 1 });
    }

    _enableChanged = (event) => {
        var newBrush = Brush.extend(this.props.p.get('value') as any, { e: event.target.checked });
        this.setValueByCommand(newBrush);
    }

    onValueChanged = (value) => {
        this.changeOpacityProperty(value, this.props.p.get('value'));
    }

    onValueChanging = (value) => {
        this.previewOpacityProperty(null, value);
        return value;
    }

    changeOpacityProperty = (value, p) => {
        var brush = Brush.extend(this.props.p.get('value'), { o: value / 100 });

        this.setValueByCommand(brush);
        return false;
    };

    previewOpacityProperty(name, value) {
        var brush = Brush.extend(this.props.p.get('value'), { o: value / 100 });

        this.previewValue(value);
        return false;
    }

    changeStrokeWidthProperty = (value, p) => {
        this.setPropValueByCommand("strokeWidth", value);
        return false;
    };

    previewStrokeWidthProperty(name, value) {
        this.previewPropValue("strokeWidth", value);
        return false;
    }

    setPropValueByCommand = (propName, value, async = false) => {
        if (this._setValueTimer) {
            clearTimeout(this._setValueTimer);
        }

        var changes = {};
        changes[propName] = value;

        dispatchAction({ type: "Properties_Changed", changes, async });
    };

    previewPropValue(propName, value) {
        if (this._setValueTimer) {
            clearTimeout(this._setValueTimer);
        }

        var changes = {};
        changes[propName] = value;

        dispatchAction({ type: "Properties_Preview", changes, async: false });
    }
}

const StrokeLineContainer = styled.div`
    display:grid;
    grid-column-gap: ${theme.margin1};
    grid-template-columns: 26px 54px 1fr 50px 18px;
    align-items:center;
    padding:0 ${theme.margin1};
    margin-bottom: ${theme.margin1};
`;

const SliderContainer = styled.div`
    grid-column-gap: 18px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr ${theme.rightPropSize};
    align-items: center;
`;

const BrushLineContainer = styled.div`
    display:grid;
    grid-template-columns:1fr 2fr 1fr;
    grid-column-gap: 10px;
    padding:0 9px;
    margin-top: 9px;
    width:100%;
`;

const StrokeSettings = styled.div`
`;

const StrokeDetailsBody = styled.div`
    width: 200px;
    padding: 0 12px;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-column-gap: 12px;
    grid-row-gap: 12px;
    grid-template-columns: auto 1fr;
    align-items:center;
    text-align:right;

    font:${theme.prop_name_font};
    color:${theme.text_color};

    & .joinsEditor {
        grid-column:2;
        grid-row:1;
    }

    & .joinsLabel {
        grid-column:1;
        grid-row:1;
    }

    & .capEditor {
        grid-column:2;
        grid-row:2;
    }

    & .capLabel {
        grid-column:1;
        grid-row:2;
    }
`;

const DashEditorLine = styled.div`
    display:grid;
    width:100%;
    grid-template-columns: 46px 46px 46px 46px;
    align-items:center;
    justify-items:center;
    grid-column-gap: 4px;
    margin-bottom: 12px;
    margin-top: 12px;
`;
