import React from "react";
import ReactDom from "react-dom";
import { AutoSizer, Dimensions, Index, IndexRange, List, ListRowProps } from "react-virtualized";
import { Component } from "../../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "../ScrollContainer";

export interface IGroup<T> {
    items: T[];
}

export interface IGroupedList<T> {
    groups: IGroup<T>[];
}

type HeaderRow<T> = { header: true; group: IGroup<T> };
type ItemsRow<T> = { header: false; group: IGroup<T>, items: T[] };
type Row<T> = HeaderRow<T> | ItemsRow<T>;

interface VirtualGroupedListProps<T> extends ISimpleReactElementProps {
    data: IGroupedList<T>;
    headerRowHeight: number;
    itemHeight: number;
    itemWidth: number;
    headerRenderer: (item: IGroup<T>) => React.ReactNode;
    itemRenderer: (item: T, group: IGroup<T>) => React.ReactNode;
}

export default class VirtualGroupedList<T> extends Component<VirtualGroupedListProps<T>> {
    private list: List = null;
    private rows: Row<T>[] = [];

    componentDidMount() {
        super.componentDidMount();
        this.initScroller();
    }

    componentWillUnmount() {
        let listNode = ReactDom.findDOMNode<HTMLElement>(this.list);
        ScrollContainer.destroyScroller(listNode.parentElement);
    }

    private initScroller() {
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.list);
        ScrollContainer.initScroller(gridNode.parentElement, { innerSelector: gridNode });
    }

    private getRowHeight = (params: Index) => {
        let row = this.rows[params.index];
        if (row.header) {
            return this.props.headerRowHeight;
        }
        return this.props.itemHeight;
    }

    private registerList = (list) => {
        this.list = list;
    }

    private rowRenderer = (props: ListRowProps) => {
        let item = this.rows[props.index];
        if (item.header === true) {
            return <div className="grouped-list__row" key={props.key} style={props.style}>{this.props.headerRenderer(item.group)}</div>;
        }

        return <div className="grouped-list__row" key={props.key} style={props.style}>
            {item.items.map((x, i) => this.props.itemRenderer(x, item.group))}
        </div>;
    }

    private prepareRows(dimensions: Dimensions) {
        this.rows = [];

        if (!dimensions.width || !dimensions.height) {
            return;
        }

        for (let i = 0; i < this.props.data.groups.length; i++) {
            let group = this.props.data.groups[i];
            if (group.items.length) {
                this.rows.push({ header: true, group: group });

                let columns = Math.floor(dimensions.width / this.props.itemWidth);
                let rows = Math.ceil(group.items.length / columns);

                let row: ItemsRow<T> = null;
                for (let j = 0; j < group.items.length; j++) {
                    let item = group.items[j];
                    if (j % columns === 0) {
                        row = null;
                    }
                    if (!row) {
                        row = { header: false, items: [], group };
                        this.rows.push(row);
                    }
                    row.items.push(item);
                }
            }
        }
    }

    render() {
        return <AutoSizer>
            {dimensions => {
                this.prepareRows(dimensions);

                return <div style={{ width: dimensions.width, height: dimensions.height }}>
                    <List
                        className={this.props.className}
                        rowRenderer={this.rowRenderer}
                        rowCount={this.rows.length}
                        rowHeight={this.getRowHeight}
                        width={dimensions.width}
                        height={dimensions.height}
                        ref={this.registerList}
                    />
                </div>
            }}
        </AutoSizer>;
    }
}