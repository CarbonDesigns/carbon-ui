import * as React from "react";
import * as ReactDom from "react-dom";
import { Component } from "../CarbonFlux";
import { nodeOffset, ensureElementVisible } from "../utils/domUtil";
import styled from "styled-components";
import Icon from "../components/Icon";
import icons from "../theme-icons";
import theme from "../theme";
import * as cx from "classnames";

function stopPropagation(e) {
    if (e) {
        e.stopPropagation();
    }
}

export interface IDropdownProps {
    selectedItem: any,
    className?: string,
    mods?: string,
    id?: string,
    autoClose?: boolean,

    onSelect: (item: any) => void,
    onClick?: () => void,

    renderSelected?: (item?: any) => void,
    renderEmpty?: () => void,
}
interface IDropDownState {
    open: boolean;
}
export default class Dropdown extends Component<IDropdownProps, IDropDownState> {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    refs: {
        content: any,
        dropContainer: HTMLElement
    }

    selectItem = (e) => {
        var dropContainer = this.refs.dropContainer;
        // item is the number of dropContainer DOM child
        var item = Array.prototype.indexOf.call(dropContainer.children, e.currentTarget);
        if (item !== this.props.selectedItem) {
            this.props.onSelect(item);
            if (this.props.autoClose) {
                this.close();
            }
        }
    };

    open = () => {
        if (!this.state.open) {
            this.toggle();
        }
    };

    close = () => {
        if (this.state.open) {
            this.toggle();
        }
    };

    toggle = (event = null) => {
        this.setState({ open: !this.state.open });
        stopPropagation(event);
    };

    onKeyDown = (e) => {
        //TODO: handle ESC
    };

    onBlur = (e) => {
        if (this.props.autoClose) {
            this.close();
        }
    };

    _renderSelectedItem() {
        var selectedItemIndex = this.props.selectedItem;

        if (typeof this.props.renderSelected === 'function') {
            return this.props.renderSelected(selectedItemIndex);
        }

        if (selectedItemIndex) {
            var children = React.Children.toArray(this.props.children);
            return React.cloneElement(children[selectedItemIndex] as React.DOMElement<any, any>, { key: selectedItemIndex + "_selected" });
        }

        if (this.props.renderEmpty) {
            return this.props.renderEmpty();
        }

        return null;
    };

    ensurePosition() {
        var content = this.refs["content"] as HTMLElement;
        if (content) {
            ensureElementVisible(content, document.documentElement);
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.ensurePosition();
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate(prevProps, prevState);
        this.ensurePosition();
    }

    _renderContent() {
        const selectedItemIndex = this.props.selectedItem;

        return React.Children.map(this.props.children, (child_component: React.DOMElement<any, any>, i) => {
            const classes = cx(
                '_item',
                { _active: selectedItemIndex === i },
                child_component.props.className
            );

            return React.cloneElement(child_component, {
                className: classes,
                key: i,
                onClick: child_component.props.onClick || this.selectItem,
                onMouseDown: stopPropagation
            });
        });
    };

    render() {
        var selectedChild = null;
        var options = null;

        if (React.Children.count(this.props.children) > 0) {
            selectedChild = this._renderSelectedItem();
            options = this._renderContent()
        }

        var dropClasses = cx({ open: this.state.open }, this.props.className);

        return <DropdownContainer
            id={this.props.id}
            className={dropClasses}
            onMouseDown={this.toggle}
            onKeyDown={this.onKeyDown}
            onBlur={this.onBlur}
            tabIndex={0}>
            <div className="selectedElement">
                {selectedChild}
                <Icon className="icon" icon={icons.triangle_down} color={theme.icon_default} />
            </div>

            <div ref="content" className="drop_content">
                <div className="list" ref="dropContainer">
                    {options}
                </div>
            </div>
        </DropdownContainer>;
    }
}

const DropdownContainer = styled.div`
    width:100%;
    position:relative;

    & .selectedElement {
        height:28px;
        line-height:28px;
        width:100%;
        background:${theme.input_background};
        font:${theme.font_largeInput};
        color:${theme.text_color};
        display:grid;
        grid-template-columns: 1fr 10px;
        align-items:center;
        padding: 0 ${theme.margin1};
    }

    &.open .selectedElement {
        box-shadow: ${theme.dropdown_shadow};
        opacity:0.3;
        & .icon {
            display:none;
        }
    }

    & .drop_content {
        max-height: 0px;
        min-width: 100%;
        width: auto;
        overflow:hidden;
        background: ${theme.input_background};
        box-shadow: ${theme.dropdown_shadow};
        z-index:100;
        position:absolute;
        white-space: normal;
        left:0;
        right:0;

        & ._item {
            padding: 0 ${theme.margin1};
            height: 28px;
            line-height: 28px;
            cursor:pointer;
            &:hover {
                background: ${theme.accent};
                border-left: 2px solid ${theme.accent};
            }

            border-left: 2px solid ${theme.input_background};

            &._active {
                border-left: 2px solid ${theme.accent};
            }
        }
    }

    &.open .drop_content {
        max-height: 1000px;
        transition:max-height 0.4s cubic-bezier(.39, .38, .59,  1.32) 0s;
    }

    & .list {

    }
`;
