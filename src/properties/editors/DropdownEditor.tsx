import React from 'react';
import ReactDom from "react-dom";
import cx from 'classnames';
import bem from '../../utils/commonUtils';

import EditorComponent, { IEditorProps, IEditorState } from "./EditorComponent";
import FlyoutButton from '../../shared/FlyoutButton';
import ScrollContainer from '../../shared/ScrollContainer';
import { FormattedHTMLMessage } from "react-intl";

export interface IDropdownEditorProps extends IEditorProps {
    onValueChanged?: (item: any) => void;
    onOpened?: () => void;
    onClosed?: () => void;
    formatSelectedValue?: (item: any) => any;
    disableAutoClose?: boolean;
}

export class BaseDropdownEditor<TProps extends IDropdownEditorProps> extends EditorComponent<TProps, IEditorState<any>> {
    static propTypes = {
        p: React.PropTypes.any,
        className: React.PropTypes.string,
        disableAutoClose: React.PropTypes.bool,
        formatSelectedValue: React.PropTypes.func,
        onClosed: React.PropTypes.func,
        onOpened: React.PropTypes.func,
        onValueChanged: React.PropTypes.func,
    };

    refs: {
        prop: HTMLElement
    }

    _getItemBy = (key, value) => {
        var items = this.extractOption(this.props, "items");

        if (typeof items === "function") {
            items = items();
        }

        if (items !== null && items) {
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
        if (matchingItem !== null) {
            if (this.props.onValueChanged) {
                this.props.onValueChanged(matchingItem);
            }
            else {
                this.setValueByCommand(matchingItem.value);
            }
        }
    };

    _onOpened = () => {
        var node = this.refs.prop;
        if (node && node.classList) {
            node.classList.add("_active");
        }
        if (typeof this.props.onOpened === 'function') {
            this.props.onOpened();
        }
    };

    _onClosed = () => {
        var node = this.refs.prop;
        if (node && node.classList) {
            node.classList.remove("_active");
        }
        if (typeof this.props.onClosed === 'function') {
            this.props.onClosed();
        }
    };

    _renderIcon(item) {
        return item && item.icon ? <i key='icon' className={item.icon} /> : null
    }

    _renderValue = (item) => {
        return;
    };

    _renderSelectedValue = () => {
        // if (!this.state.value) {
        //     return null;
        // }


        var validItem = this._getItemBy('value', this.state.value);

        if (validItem && validItem.selectedContent) {
            return validItem.selectedContent;
        }
        else {
            var validValue = validItem !== null
                ? this.state.value
                : null;

            var selectedItem = (typeof this.props.formatSelectedValue === 'function')
                ? this.props.formatSelectedValue(validValue)
                : validItem;

            var caption = (!!selectedItem)
                ? selectedItem.name
                : validValue;

            return [
                <b className="prop__v">{caption}</b>,
                this._renderIcon(selectedItem)
            ];
        }


    };


    _renderContent() {
        if (this.props.children) {
            return this.props.children;
        }
        var items = this.extractOption(this.props, "items");

        if (typeof items === "function") {
            items = items();
        }

        if (items) {
            return <ScrollContainer className="flyout__content prop__options-container" boxClassName="prop_selectbox__dropdown" insideFlyout={true}>
                <div className={this.b("options")}>
                    {items.map(item => {
                        var is_selected = this.state.value === item.value;
                        return <section
                            key={item.name}
                            className={this.b("option", { selected: is_selected })}
                            onClick={((item) => ((ev) => this._onOptionSelected(item)))(item)}
                            data-name={item.name}
                        >
                            {item.content !== null ? item.content : <b key="name">{item.name}</b>}
                            {this._renderIcon(item)}
                        </section>
                    })}
                </div>
            </ScrollContainer>;
        }
        return null;
    }

    render() {
        var p = this.props.p;

        var classes = this.b(null, "selectbox", this.widthClass(this.props.className || "prop_width-1-1"));

        return <div className={classes} ref="prop">
            <div className="prop__name"><FormattedHTMLMessage id={this.displayName()} /></div>
            <FlyoutButton
                className="prop__value"
                renderContent={this._renderSelectedValue}
                position={{
                    targetVertical: "bottom",
                    syncWidth: true,
                    disableAutoClose: this.props.disableAutoClose
                }}
                onOpened={this._onOpened}
                onClosed={this._onClosed}
            >
                {this._renderContent()}
            </FlyoutButton>
        </div>
    }
}

//quick fix for typescript error
export default class DropdownEditor extends BaseDropdownEditor<IDropdownEditorProps>{
}