import * as React from "react";
import * as ReactDom from "react-dom";
import { Component } from "../CarbonFlux";
import * as cx from "classnames";
import { nodeOffset, ensureElementVisible } from "../utils/domUtil";

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
interface IDropDownState{
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
        content:any,
        dropContainer:HTMLElement
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
        if(content) {
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
                'drop__item  drop__item_line  drop__item_selectable',
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

        var dropClasses = cx('drop_down', { drop_open: this.state.open }, this.props.className);

        return <div
            id={this.props.id}
            className={dropClasses}
            onMouseDown={this.toggle}
            onKeyDown={this.onKeyDown}
            onBlur={this.onBlur}
            tabIndex={0}>
            <div className="drop__pill">
                {selectedChild}
                <i className="ico ico-triangle" />
            </div>

            <div ref="content" className="drop__content drop-content_auto-width">
                <div className="drop__list" ref="dropContainer">
                    {options}
                </div>
            </div>
        </div>;
    }
}
