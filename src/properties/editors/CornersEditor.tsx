import * as React from "react";
import EditorComponent, { IEditorProps } from "./EditorComponent";
import * as cx from "classnames";
import { FormattedMessage } from "react-intl";
import { QuadAndLock } from "carbon-core";
import { PropertyLineContainer } from "../PropertyStyles";
import MultiSwitchEditor from "./MultiSwitchEditor";
import themeIcons from "../../theme-icons";
import * as Immutable from "immutable";
import Slider from "../../components/Slider";
import styled from "styled-components";
import NumericEditor from "./NumericEditor";
import theme from "../../theme";

type CornersEditorState = {
    value: QuadAndLock;
}

const corners = ["⌜", "⌝", "⌟", "⌞"]

export default class CornersEditor extends EditorComponent<QuadAndLock, IEditorProps, CornersEditorState> {

    constructor(props) {
        super(props);
        var value = this.props.p.get('value');
    }

    _setValue(key, val) {
        var current;
        var value = this.props.p.get('value');
        if (value.locked && key === 'upperLeft') {
            current = QuadAndLock.createFromObject({
                locked: true,
                upperLeft: val,
                upperRight: val,
                bottomLeft: val,
                bottomRight: val
            });
        } else {
            current = QuadAndLock.extend(value, { [key]: val });
        }
        // this.setState({value: current});
        this.setValueByCommand(current);

        return false;
    };

    _previewValue(key, val) {
        var current;
        var value = this.props.p.get('value');
        if (value.locked && key === 'upperLeft') {
            current = QuadAndLock.createFromObject({
                locked: true,
                upperLeft: val,
                upperRight: val,
                bottomLeft: val,
                bottomRight: val
            });
        } else {
            current = QuadAndLock.extend(value, { [key]: val });
        }

        this.previewValue(current);

        return false;
    };

    _onLockChanged = (value) => {
        this._setValue('locked', !!value);
        return false;
    };

    _onCornerChanging = (value) => {
        let maxRadius = Math.min(this.props.e.width, this.props.e.height) / 2 | 0;
        var v = value * maxRadius / 100;
        this._previewValue('upperLeft', v);
        return value;
    }

    _onCornerChanged = (value) => {
        let maxRadius = Math.min(this.props.e.width, this.props.e.height) / 2 | 0;
        var v = value * maxRadius / 100;
        this._setValue('upperLeft', v);
        return false;
    }

    changeRadiusProperty = (value) => {
        return false;
    }

    previewRadiusProperty = (value) => {
        return false;
    }

    _onPreviewingValue(value) {
        return false;
    }

    _setting4Value = (name) => {
        return (value) => {
            this._setValue(name, value);
            return false;
        }
    }
    _preview4Value = (name) => {
        return (value) => {
            this._previewValue(name, value);
            return false;
        }
    }

    renderValues(locked, value) {
        let maxRadius = Math.min(this.props.e.width, this.props.e.height) / 2 | 0;
        if (locked) {
            var radiusProp = Immutable.Map({
                descriptor: {
                    name: 'radius',
                    displayName: '@radius'
                },
                value: value.upperLeft,
                options:{
                    min:0,
                    max:maxRadius,
                    step:1
                }
            });


            return <SliderContainer>
                <Slider value={value['upperLeft'] * 100 / (maxRadius || 1)}
                    valueChanging={this._onCornerChanging}
                    valueChanged={this._onCornerChanged}
                />
                <NumericEditor e={this.props.e} p={radiusProp}
                    onSettingValue={this._setting4Value("upperLeft")}
                    uom={'px'}
                    type="subproperty"
                    onPreviewingValue={this._preview4Value("upperLeft")} />
            </SliderContainer>
        }

        return <FourCornersContainer>
            {["upperLeft", "upperRight", "bottomRight", "bottomLeft"].map((n, i) => {
                return <NumericEditor
                    type="subproperty"
                    key={n}
                    e={this.props.e}
                    onSettingValue={this._setting4Value(n)}
                    onPreviewingValue={this._preview4Value(n)}
                    p={Immutable.Map({
                        descriptor: {
                            name: n,
                            displayName: corners[i]
                        },
                        options:{
                            min:0,
                            max:maxRadius
                        },
                        value: value[n]
                    })}
                />
            })
            }
        </FourCornersContainer>
    }

    render() {
        var value = this.props.p.get('value');
        var e = this.props.e;
        var locked = value.locked;

        var lockProperty = Immutable.Map({
            descriptor: {
                name: 'lock',
                displayName: "@lock"
            },
            options:{
                items: [
                    { value: 1, icon: themeIcons.corner1 },
                    { value: 0, icon: themeIcons.corner4 }
                ]
            },
            value: locked ? 1 : 0
        });

        return <CornerEditorLineContainer>
            <MultiSwitchEditor e={e} p={lockProperty} type="subproperty" onSettingValue={this._onLockChanged} />
            {this.renderValues(locked, value)}
        </CornerEditorLineContainer>;
    }
}

const CornerEditorLineContainer = styled.div`
    display:grid;
    grid-template-columns:80px 1fr;
    align-items: center;
    grid-column-gap: 10px;
    padding:0 9px;
    margin-top: 9px;
    width:100%;
    min-height:36px;
`;

const SliderContainer = styled.div`
    grid-column-gap: 18px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr ${theme.rightPropSize};
    align-items: center;
`;

const FourCornersContainer = styled.div`
    grid-column-gap: 9px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    align-items: center;
`;