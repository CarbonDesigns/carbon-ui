import React from "react";
import ReactDom from "react-dom";
import { InfiniteLoader, AutoSizer, Dimensions, InfiniteLoaderChildProps, Index, IndexRange, List, ListRowProps, Alignment } from "react-virtualized";
import { Component } from "../../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "../ScrollContainer";

interface VirtualListProps<T> extends ISimpleReactElementProps {
    data: T[];
    rowHeight: number | ((item: T, index: number) => number);
    rowRenderer: (item: T, index?: number) => React.ReactNode;
    noContentRenderer?: () => React.ReactNode;
    scrollToRow?: number;
    scrollToAlignment?: Alignment;
}

export default class VirtualList<T> extends Component<VirtualListProps<T>> {
    private list: List = null;

    static defaultProps: Partial<VirtualListProps<any>> = {
        scrollToAlignment: "auto"
    }

    reset(keepScroll?: boolean) {
        this.list.recomputeRowHeights();
        if (!keepScroll) {
            this.list.scrollToRow(0);
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.initScroller();
    }

    componentWillUnmount(){
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.list);
        ScrollContainer.destroyScroller(gridNode.parentElement);
    }

    private initScroller(){
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.list);
        ScrollContainer.initScroller(gridNode.parentElement, {innerSelector: gridNode});
    }

    private registerList = (list) => {
        this.list = list;
    }

    private getRowHeight = (params: Index) => {
        if (typeof this.props.rowHeight === "function") {
            let item = this.props.data[params.index];
            return this.props.rowHeight(item, params.index);
        }
        return this.props.rowHeight;
    }

    private rowRenderer = (props: ListRowProps) => {
        let item = this.props.data[props.index];
        let child = item ? this.props.rowRenderer(item, props.index) : null;
        return <div key={props.key} style={props.style}>{child}</div>
    }

    render() {
        return <AutoSizer>
            {dimensions => {
                return <div style={{width: dimensions.width, height: dimensions.height}}>
                    <List
                        className={this.props.className}
                        rowRenderer={this.rowRenderer}
                        noContentRenderer={this.props.noContentRenderer}
                        scrollToIndex={this.props.scrollToRow}
                        scrollToAlignment={this.props.scrollToAlignment}
                        rowCount={this.props.data.length}
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