import React from "react";
import ReactDom from "react-dom";
import { Component } from "../../CarbonFlux";
import cx from 'classnames';
import { default as bem, join_bem_mods, IHasMods } from '../../utils/commonUtils';
import FlyoutButton from '../FlyoutButton';
import ScrollContainer from '../ScrollContainer';
import { FormattedHTMLMessage } from "react-intl";

function b(a, b, c) { return bem('drop', a, b, c) }

function stopPropagation(e) {
    if (e) {
        e.stopPropagation();
    }
}

export interface IGuiSelectProps extends ISimpleReactElementProps, IHasMods<"line"> {
    /**
     * An index of the selected item, or -1 if no item should be selected.
     */
    selectedItem?: number;

    onSelect: (index: number) => void;

    /**
     * A function to render the default node, if nothing is selected (selectedItem === -1).
     */
    renderDefault?: () => React.ReactInstance | string;
    renderSelected?: (index: number) => React.ReactInstance;
}

export default class GuiSelect extends Component<IGuiSelectProps>{
    refs: {
        scrollContainer: ScrollContainer
    }

    constructor(props) {
        super(props);
    }

    selectItem = (e) => {
        var dropContainer = ReactDom.findDOMNode(this.refs.scrollContainer.getScrollBoxNode());
        // item is the number of dropContainer DOM child
        var item = Array.prototype.indexOf.call(dropContainer.children, e.currentTarget);
        if (item !== this.props.selectedItem) {
            this.props.onSelect(item);
        }
    };

    _renderPill = () => {
        var selectedChild = null;

        var selectedItemIndex = this.props.selectedItem;

        if (selectedItemIndex >= 0) {
            if (typeof this.props.renderSelected === 'function') {
                selectedChild = this.props.renderSelected(selectedItemIndex);
            }
            else {
                var children: any = React.Children.toArray(this.props.children);
                selectedChild = React.cloneElement(children[selectedItemIndex], { key: selectedItemIndex + "_selected" });
            }
        }
        else if (this.props.renderDefault) {
            selectedChild = this.props.renderDefault();
        }
        else {
            selectedChild = '---';
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
                ref="scrollContainer"
            >{options}</ScrollContainer>
        </div>
    }


    render() {
        var dropClasses = bem('drop', null, this.props.mods, this.props.className);

        return <FlyoutButton
            className={dropClasses}
            renderContent={this._renderPill}
            position={{
                targetVertical: "bottom",
                syncWidth: true
            }}>
            {this._renderFlyoutContent()}
        </FlyoutButton>
    }
}
