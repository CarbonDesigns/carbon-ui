import React from "react";
import ReactDom from "react-dom";
import { Component } from "../../CarbonFlux";
import cx from 'classnames';
import { default as bem, join_bem_mods, IHasMods } from '../../utils/commonUtils';
import FlyoutButton from '../FlyoutButton';
import ScrollContainer from '../ScrollContainer';
import { FormattedMessage } from "react-intl";
import { IArtboard, IPage } from "carbon-core";

function b(a, b, c) { return bem('drop', a, b, c) }

function stopPropagation(e) {
    if (e) {
        e.stopPropagation();
    }
}

export interface IGuiSelectProps<T> extends ISimpleReactElementProps, IHasMods<"line"> {
    selectedItem?: T;

    items: T[];
    renderItem?: (item: T) => JSX.Element;
    renderCustomItems?: () => JSX.Element[];

    caption?: string;
    onSelect: (item: T) => void;
}

export default class GuiSelect<T = any> extends Component<IGuiSelectProps<T>>{
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

        return <div className="drop__pill">
            {selectedChild}
            <i className="ico ico-triangle" />
        </div >
    };

    private renderFlyoutContent() {
        let options = this.props.items.map((item, i) => {
            let classes = bem('drop', 'item',
                { line: true, selectable: true },
                [{ _active: item === this.props.selectedItem }]
            );

            var renderedItem = this.props.renderItem ? this.props.renderItem(item) : item;
            return <div className={classes} key={i} data-index={i} onClick={this.selectItem} onMouseDown={stopPropagation}>{renderedItem}</div>;
        });

        if (this.props.renderCustomItems) {
            options = options.concat(this.props.renderCustomItems().map((element, i) => {
                let classes = bem('drop', 'item', { line: true, selectable: true });
                return <div className={classes} key={this.props.items.length + i} onMouseDown={stopPropagation}>{element}</div>;
            }));
        }

        return <div className={bem('drop', 'content', ["auto-width", "in-flyout"], this.props.className)}>
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
            renderContent={this.renderPill}
            position={{
                targetVertical: "bottom",
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