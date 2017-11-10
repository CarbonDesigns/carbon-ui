import React from 'react';
import { FormattedMessage } from "react-intl";
import cx from 'classnames';
import Dots from "./dots";
import ScrollContainer from "./ScrollContainer";
import EnterInput from "./EnterInput";
import { Component, handles, Dispatcher } from "../CarbonFlux";
import { richApp } from "../RichApp";
import { PropertyTracker, Page, IArtboard } from "carbon-core";
import bem from '../utils/commonUtils';

const b = "editable-list";

interface EditableListProps<T> extends ISimpleReactElementProps {
    data: T[];
    idGetter: (item: T) => string;
    nameGetter: (item: T) => string;
    selectedItem?: T;
    editingItem?: T;

    onClick?: (item: T) => void;
    onEdit?: (item: T) => boolean;
    onRename?: (name: string, item: T) => void;
    onDelete?: (item: T) => void;
    canDelete?: boolean | ((item: T) => boolean);

    scrolling?: boolean;
    insideFlyout?: boolean;
}

type EditableListState<T> = {
    controlsOpenItem?: T;
    editingItem?: T;
}

export default class EditableList<T = any> extends Component<EditableListProps<T>, EditableListState<T>> {
    refs: {
        input: EnterInput;
    }

    constructor(props: EditableListProps<T>) {
        super(props);
        this.state = {
            controlsOpenItem: props.editingItem,
            editingItem: props.editingItem
        };
    }

    componentWillReceiveProps(nextProps: Readonly<EditableListProps<T>>) {
        this.setState({
            controlsOpenItem: nextProps.editingItem,
            editingItem: nextProps.editingItem
        });
    }

    private onClick = (e: React.MouseEvent<HTMLElement>) => {
        if(!this.state.controlsOpenItem) {
            this.props.onClick && this.props.onClick(this.getItemFromEvent(e));
        }
    }

    private onOpenControls = (e: React.MouseEvent<HTMLElement>) => {
        this.setState({
            controlsOpenItem: this.getItemFromEvent(e)
        });
    }

    private onBeginEditName = (e: React.MouseEvent<HTMLElement>) => {
        let item = this.getItemFromEvent(e);
        if (this.props.onEdit && !this.props.onEdit(item)) {
            return;
        }
        this.setState({
            editingItem: item,
            controlsOpenItem: item
        });
    }

    private onConfirmRename = () => {
        this.onRename(this.refs.input.getValue() as string);
    }

    private onRename = (name: string) => {
        let item = this.state.editingItem;

        this.setState({
            editingItem: null,
            controlsOpenItem: null
        });

        this.props.onRename(name, item);
    }

    private onDelete = (e: React.MouseEvent<HTMLElement>) => {
        this.props.onDelete(this.getItemFromEvent(e));
    }

    private onCancel = () => {
        this.setState({
            controlsOpenItem: null,
            editingItem: null
        });
    }

    private getItemFromEvent(e: React.MouseEvent<HTMLElement>) {
        let index = parseInt(e.currentTarget.dataset.index);
        return this.props.data[index];
    }

    render() {
        let items = this.props.data.map((item, i) => this.renderItem(item, i));

        if (this.props.scrolling) {
            return <ScrollContainer
                className={bem(b, "scroll-wrap", null, "wrap thin")}
                boxClassName={bem(b)}
                insideFlyout={this.props.insideFlyout}
            >
                {items}
            </ScrollContainer>
        }

        return <div>
            {items}
        </div>
    }

    private renderItem(item: T, index: number) {
        let id = this.props.idGetter(item);
        let name = this.props.nameGetter(item);
        let editing = this.state.editingItem === item;

        let cn = bem(b, "item", {
            "controls-open": this.state.controlsOpenItem === item,
            editing,
            selected: this.props.selectedItem === item
        }, "sortable-item");

        return (
            <div className={cn} key={id}>

                { /* Body */}
                <div className={bem(b, "item-body")} onClick={this.onClick} onDoubleClick={this.onBeginEditName} data-index={index}>
                    {
                        editing ? this.renderInput(name) : this.renderName(name)
                    }
                </div>

                { /* Opener */}
                <div className={bem(b, "item-button", "opener")} onClick={this.onOpenControls} data-index={index}>
                    <div className={bem(b, "item-button-icon")}><Dots /></div>
                </div>

                { /* Board controls */}
                <div className={bem(b, "item-controls")}>
                    <div className={bem(b, "item-button", "closer")} onClick={this.onCancel} data-index={index}>
                        <div className={bem(b, "item-button-icon")}><i className="ico-cancel" /></div>
                    </div>
                    {
                        !editing && this.renderDeleteButton(item, index)
                    }
                    {
                        editing ? this.renderOkButton(index) : this.renderEditButton(index)
                    }
                </div>

            </div>
        )
    }

    private renderInput(name: string) {
        return <div className="inputWrap">
            <EnterInput
                ref="input"
                value={name}
                autoFocus
                changeOnBlur={false}
                onValueEntered={this.onConfirmRename}
            />
        </div>
    }

    private renderName(name: string) {
        return <p className={bem(b, "item-name")}>{name}</p>;
    }

    private renderDeleteButton(item: T, index: number) {
        if (this.props.canDelete === false) {
            return null;
        }
        if (!(this.props.canDelete === true || this.props.canDelete(item))) {
            return null;
        }
        return <div className={bem(b, "item-button", "delete")} onClick={this.onDelete} data-index={index}>
            <div className={bem(b, "item-button-icon")}><i className="ico-trash" /></div>
        </div>
    }

    private renderOkButton(index: number) {
        return <div className={bem(b, "item-button")} onClick={this.onConfirmRename} data-index={index}>
            <div className={bem(b, "item-button-icon")}>
                <i className={"ico-ok"} />
            </div>
        </div>
    }

    private renderEditButton(index: number) {
        return <div className={bem(b, "item-button")} onClick={this.onBeginEditName} data-index={index}>
            <div className={bem(b, "item-button-icon")}>
                <i className={"ico-edit"} />
            </div>
        </div>
    }

    static defaultProps = {
        insideFlyout: false,
        canDelete: true,
        scrolling: true
    }
}

export type EditableStringList = new (props) => EditableList<string>;
export const EditableStringList = EditableList as EditableStringList;

export type EditableArtboardList = new (props) => EditableList<IArtboard>;
export const EditableArtboardList = EditableList as EditableArtboardList;