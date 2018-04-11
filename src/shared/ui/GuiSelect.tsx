import * as React from "react";
import * as ReactDom from "react-dom";
import { Component } from "../../CarbonFlux";
import * as cx from "classnames";
import FlyoutButton from '../FlyoutButton';
import ScrollContainer from '../ScrollContainer';
import { FormattedMessage } from "react-intl";
import { IArtboard, IPage } from "carbon-core";
import styled from "styled-components";
import theme from "../../theme";
import icons from "../../theme-icons";
import Icon from "../../components/Icon";

function stopPropagation(e) {
    if (e) {
        e.stopPropagation();
    }
}

export interface IGuiSelectProps<T> extends ISimpleReactElementProps {
    selectedItem?: T;

    items: T[];
    renderItem?: (item: T) => JSX.Element;
    renderCustomItems?: () => JSX.Element[];

    caption?: string;
    onSelect: (item: T) => void;
}

export default class GuiSelect<T = any> extends Component<IGuiSelectProps<T>>{
    static defaultProps: Partial<IGuiSelectProps<any>> = {
    }

    refs: {
        scrollContainer: ScrollContainer
    }

    constructor(props) {
        super(props);
    }

    private selectItem = (e: React.MouseEvent<HTMLDivElement>) => {
        let newIndex = parseInt(e.currentTarget.dataset.index);
        let newItem = this.props.items[newIndex];
        if (newItem !== this.props.selectedItem) {
            this.props.onSelect(newItem);
        }
    };

    private renderPill = () => {
        let selectedChild = null;

        if (this.props.selectedItem) {
            selectedChild = this.props.renderItem ? this.props.renderItem(this.props.selectedItem) : this.props.selectedItem;
        }
        else if (this.props.caption) {
            selectedChild = <FormattedMessage id={this.props.caption} tagName="i" />
        }
        else {
            selectedChild = <i>---</i>;
        }

        return <CurrentItem>
            {selectedChild}
            <Icon icon={icons.triangle_down} color={theme.icon_default}></Icon>
        </CurrentItem>
    };

    private renderFlyoutContent() {
        let options = this.props.items.map((item, i) => {
            var renderedItem = this.props.renderItem ? this.props.renderItem(item) : item;
            return <DropItem key={i} data-index={i} onClick={this.selectItem} onMouseDown={stopPropagation}>{renderedItem}</DropItem>;
        });

        if (this.props.renderCustomItems) {
            options = options.concat(this.props.renderCustomItems().map((element, i) => {
                return <DropItem key={this.props.items.length + i} onMouseDown={stopPropagation}>{element}</DropItem>;
            }));
        }

        return <DropContent className={this.props.className}>
            <ScrollContainer
                insideFlyout={true}
                ref="scrollContainer"
            >{options}</ScrollContainer>
        </DropContent>
    }

    render() {
        return <FlyoutButton
            renderContent={this.renderPill}
            position={{
                targetVertical: "bottom",
                targetHorizontal:"left",
                sourceHorizontal:"left",
                syncWidth: true
            }}>
            {this.renderFlyoutContent()}
        </FlyoutButton>
    }
}

//common selects
export type ArtboardSelect = new (props) => GuiSelect<IArtboard>;
export const ArtboardSelect = GuiSelect as ArtboardSelect;

export type PageSelect = new (props) => GuiSelect<IPage>;
export const PageSelect = GuiSelect as PageSelect;

const DropContent = styled.div`
    color:${theme.text_color};
    font:${theme.input_font};
    background:${theme.input_background};
    box-shadow:${theme.dropdown_shadow};
    padding:${theme.margin1} 0;
    z-index:1000;
`;

const CurrentItem = styled.div`
    display:grid;
    grid-template-columns: 1fr 8px;
    align-items: center;
    color:${theme.text_color};
    font:${theme.input_font};
    height:${theme.prop_height};
    line-height:${theme.prop_height};
    background:${theme.input_background};
    padding: 0 4px 0 ${theme.margin1};
    width:100%;
    z-index:1001;
`;

const DropItem = styled.div`
    height:${theme.prop_height};
    line-height:${theme.prop_height};
    padding: 0 ${theme.margin1};
    cursor:pointer;
    &:hover {
        background:${theme.accent};
    }
`;