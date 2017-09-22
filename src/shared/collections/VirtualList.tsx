import React from "react";
import ReactDom from "react-dom";
import { InfiniteLoader, AutoSizer, Dimensions, InfiniteLoaderChildProps, Index, IndexRange, List, ListRowProps, Alignment } from "react-virtualized";
import { Component } from "../../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "../ScrollContainer";
import Antiscroll from "../../external/antiscroll";

interface VirtualListProps<T> extends ISimpleReactElementProps {
    data: T[];
    rowHeight: number | ((item: T, index: number) => number);
    rowRenderer: (item: T, index?: number) => React.ReactNode;
    noContentRenderer?: () => React.ReactNode;
    scrollToRow?: number;
    scrollToAlignment?: Alignment;
    useTranslate3d?: boolean;
    reverse?: boolean;
}

export default class VirtualList<T = any> extends Component<VirtualListProps<T>> {
    private scroller: Antiscroll;
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
        super.componentWillUnmount();
        this.scroller.destroy();
    }

    private initScroller(){
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.list);
        this.scroller = ScrollContainer.initScroller(gridNode.parentElement, {innerSelector: gridNode});
    }

    private registerList = (list) => {
        this.list = list;
    }

    private getRowHeight = (params: Index) => {
        let index = this.props.reverse ? this.props.data.length - params.index - 1 : params.index;
        if (typeof this.props.rowHeight === "function") {
            let item = this.props.data[index];
            return this.props.rowHeight(item, index);
        }
        return this.props.rowHeight;
    }

    private rowRenderer = (props: ListRowProps) => {
        let index = this.props.reverse ? this.props.data.length - props.index - 1 : props.index;
        let item = this.props.data[index];
        let child = item ? this.props.rowRenderer(item, index) : null;
        let style = props.style;
        if (this.props.useTranslate3d) {
            style = {
                transform: "translate3d(" + props.style.left + ","+ props.style.top + ",0)"
            };
        }
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