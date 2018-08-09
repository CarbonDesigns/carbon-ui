import * as React from "react";
import { CarbonLabel } from "../../CarbonFlux";
import EditorComponent, { IEditorProps } from "./EditorComponent";
import FlyoutButton from '../../shared/FlyoutButton';
import ScrollContainer from '../../shared/ScrollContainer';
import styled from "styled-components";
import theme from "../../theme";
import { PropertyLineContainer, PropertyNameContainer } from "../PropertyStyles";
import Icon from "../../components/Icon";
import icons from "../../theme-icons";

export interface IDropdownEditorProps extends IEditorProps {
    onValueChanged?: (item: any) => void;
    onOpened?: () => void;
    onClosed?: () => void;
    formatSelectedValue?: (item: any) => any;
    disableAutoClose?: boolean;
}

export class BaseDropdownEditor<T, TProps extends IDropdownEditorProps> extends EditorComponent<T, TProps> {
    refs: {
        prop: HTMLElement
    }

    flyout:FlyoutButton;

    _getItemBy = (key, value) => {
        var items = this.extractOption(this.props, "items");

        if (typeof items === "function") {
            items = items(this.props.e);
        }

        if (items) {
            for (var i = 0, l = items.length; i < l; i++) {
                var item = items[i];

                if (item[key] === value) {
                    return item
                }
            }
        }

        return null;
    };

    _onOptionSelected(item) {
        var matchingItem = this._getItemBy('name', item.name);
        if (matchingItem) {
            if (this.props.onValueChanged) {
                this.props.onValueChanged(matchingItem);
            }
            else {
                this.setValueByCommand(matchingItem.value);
            }
        }
        this.flyout.close();
    };

    _onOpened = () => {
        if (typeof this.props.onOpened === 'function') {
            this.props.onOpened();
        }
    };

    _onClosed = () => {
        if (typeof this.props.onClosed === 'function') {
            this.props.onClosed();
        }
    };

    _renderIcon(item) {
        return item && item.icon ? <i key='icon' className={item.icon} /> : null
    }

    _renderValue = () => {
        return;
    };

    _renderSelectedValue = () => {
        var validItem = this._getItemBy('value', this.propertyValue());

        if (validItem && validItem.selectedContent) {
            return validItem.selectedContent;
        }
        else {
            var validValue = !!validItem
                ? this.propertyValue()
                : null;

            var selectedItem = (typeof this.props.formatSelectedValue === 'function')
                ? this.props.formatSelectedValue(validValue)
                : validItem;

            var caption = (!!selectedItem)
                ? selectedItem.name
                : validValue;

            return <SelectedValue>
                <CarbonLabel id={caption} />
                {this._renderIcon(selectedItem)}
                <Icon icon={icons.triangle_down} color={theme.icon_default}></Icon>
            </SelectedValue>
        }
    };

    _renderContent() {
        if (this.props.children) {
            return this.props.children;
        }

        var items = this.extractOption(this.props, "items");

        if (typeof items === "function") {
            items = items(this.props.e);
        }

        if (items) {
            return <DropContent>
                <ScrollContainer insideFlyout={true}>
                    {items.map(item => {
                        var is_selected = this.propertyValue() === item.value;
                        return <DropItem
                            key={item.name}
                            selected={is_selected}
                            onClick={((item) => (() => this._onOptionSelected(item)))(item)}
                            data-name={item.name}
                        >
                            {item.content ? item.content : <b key="name"><CarbonLabel id={item.name} /></b>}
                            {this._renderIcon(item)}
                        </DropItem>
                    })}
                </ScrollContainer>
            </DropContent>;
        }
        return null;
    }

    render() {
        return <PropertyLineContainer>
            <PropertyNameContainer><CarbonLabel id={this.displayName()} /></PropertyNameContainer>
            <DropButton
                renderContent={this._renderSelectedValue}
                position={{
                    targetVertical: "bottom",
                    targetHorizontal:"left",
                    sourceHorizontal:"left",
                    disableAutoClose: this.props.disableAutoClose,
                    syncWidth: true
                }}
                innerRef={x=>this.flyout = x}
                onOpened={this._onOpened}
                onClosed={this._onClosed}
            >
                {this._renderContent()}
            </DropButton>
        </PropertyLineContainer>
    }
}

const DropContent = styled.div`
    color:${theme.text_color};
    font:${theme.input_font};
    background:${theme.input_background};
    box-shadow:${theme.dropdown_shadow};
    padding:${theme.margin1} 0;
    z-index:1000;
`;

const DropButton = styled(FlyoutButton).attrs<any>({}) `
    width:100%;
`;

const DropItem = styled.div.attrs<{selected:boolean}>({})`
    height:${theme.prop_height};
    line-height:${theme.prop_height};
    padding: 0 ${theme.margin1};
    cursor:pointer;
    &:hover {
        background:${theme.accent};
    }
`;

const SelectedValue = styled.div`
    display:grid;
    grid-template-columns: 1fr 8px;
    align-items: center;
    color:${theme.text_color};
    font:${theme.input_font};
    height:${theme.prop_height};
    line-height:${theme.prop_height};
    background:${theme.input_background};
    padding: 0 4px 0 ${theme.margin1};
    cursor: pointer;
    width:100%;
    z-index:1001;
`;

//quick fix for typescript error
export default class DropdownEditor extends BaseDropdownEditor<any, IDropdownEditorProps>{
}