import * as React from "react";
import EditorComponent, { IEditorProps } from "./EditorComponent";
import * as cx from "classnames";
import { FormattedMessage } from "react-intl";
import Icon from "../../components/Icon";
import styled from "styled-components";
import * as Immutable from "immutable";
import theme from "../../theme";
import { PropertyLineContainer, PropertyNameContainer } from "../PropertyStyles";
import { CarbonLabel } from "../../CarbonFlux";

interface IMultiSwitchEditorProps extends IEditorProps {
    type?: "subproperty";
}

export default class MultiSwitchEditor extends EditorComponent<IEditorProps, any> {
    render() {
        var items = this.extractOption(this.props, "items");
        if (!items) {
            return <div></div>
        }
        let switchControl = <MultiSwitchEditorContainer className={this.props.className}>
            {items.map((x, index) => this.renderItem(x, index === 0, index === items.length - 1))}
        </MultiSwitchEditorContainer>;

        if (this.props.type === "subproperty") {
            return switchControl;
        } else {
            return <PropertyLineContainer>
                <PropertyNameContainer><CarbonLabel id={this.displayName()} /></PropertyNameContainer>
                {switchControl}
            </PropertyLineContainer>
        }
    }

    renderItem(x, first, last) {
        return <SwitchItem active={x.value === this.propertyValue()} first={first} last={last} onClick={this.onChange} key={"value__" + x.value} data-field={x.value}>
            <Icon className="icon" icon={x.icon}></Icon>
        </SwitchItem>
    }

    onChange = (e) => {
        var value = parseInt(e.currentTarget.dataset.field);

        if (this.props.onSettingValue && this.props.onSettingValue(value) === false) {
            return;
        }
        this.setValueByCommand(value);
    };
}

const SwitchItem = styled.div.attrs<any>({}) `
    height:24px;
    flex:1;
    background:${theme.input_background};
    margin:0 1px;
    border-radius:1px;
    display:flex;
    justify-content:center;
    align-items:center;
    cursor:pointer;
    .icon {
        background:${props => props.active ? theme.accent : theme.icon_default};
    }
`;

const MultiSwitchEditorContainer = styled.div`
    display:flex;
    height:24px;
    width:100%;
`;