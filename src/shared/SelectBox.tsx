import React from "react";
import ReactDom from "react-dom";
import { Component } from "../CarbonFlux";
import cx from 'classnames';
import { default as bem, join_bem_mods } from '../utils/commonUtils';

import FlyoutButton from './FlyoutButton';
import ScrollContainer from './ScrollContainer';
import { FormattedHTMLMessage } from "react-intl";


function b(a, b, c) { return bem('drop', a, b, c) }

function stopPropagation(e) {
    if (e) {
        e.stopPropagation();
    }
}


export default class SelectBox extends Component<any, any>{
    static propTypes = {
        selectedItem: React.PropTypes.any,
        className: React.PropTypes.any,
        mods: React.PropTypes.any,
        id: React.PropTypes.any,
        onSelect: React.PropTypes.func,
        onClick: React.PropTypes.func,
        renderSelected: React.PropTypes.func,
        renderEmpty: React.PropTypes.func,
    };

    refs: any;

    constructor(props) {
        super(props);
    }

    selectItem = (e) => {
        var dropContainer = ReactDom.findDOMNode(this.refs['scroll_container'].refs['scrollBox']);
        // item is the number of dropContainer DOM child
        var item = Array.prototype.indexOf.call(dropContainer.children, e.currentTarget);
        if (item !== this.props.selectedItem) {
            this.props.onSelect(item);
        }
    };

    _renderPill = () => {
        var selectedChild = null;

        if (React.Children.count(this.props.children) > 0) {
            var selectedItemIndex = this.props.selectedItem;

            if (typeof this.props.renderSelected === 'function') {
                selectedChild = this.props.renderSelected(selectedItemIndex);
            } else if (selectedItemIndex !== null) {
                var children: any = React.Children.toArray(this.props.children);
                selectedChild = React.cloneElement(children[selectedItemIndex], { key: selectedItemIndex + "_selected" });
            } else if (typeof this.props.renderEmpty === 'function') {
                selectedChild = this.props.renderEmpty();
            } else {
                selectedChild = '---'
            }
        }

        return <div className="drop__pill">
            {selectedChild}
            <i className="ico ico-triangle" />
        </div >
    };

    _renderFlyoutContent() {
        var options = null;

        if (React.Children.count(this.props.children) > 0) {

            var selectedItemIndex = this.props.selectedItem;

            options = React.Children.map(this.props.children, (child_component: any, ind) => {
                var classes = bem('drop', 'item',
                    { line: true, selectable: true },
                    [{ _active: selectedItemIndex === ind }, child_component.props.className]
                );

                return React.cloneElement(child_component, {
                    className: classes,
                    key: ind,
                    onClick: child_component.props.onClick || this.selectItem,
                    onMouseDown: stopPropagation
                });
            });
        }

        return <div className={bem('drop', 'content', ["auto-width", "in-flyout"])}>
            <ScrollContainer
                boxClassName="drop__list"
                insideFlyout={true}
                ref="scroll_container"
            >{options}</ScrollContainer>
        </div>
    }


    render() {
        var dropClasses = bem('drop', null, this.props.mods, this.props.className);

        return (
            <FlyoutButton
                className={dropClasses}
                renderContent={this._renderPill}
                position={{
                    targetVertical: "bottom",
                    syncWidth: true,
                    disableAutoClose: this.props.disableAutoClose
                }}
            >
                {this._renderFlyoutContent()}
            </FlyoutButton>
        )
        // }
    }
}
