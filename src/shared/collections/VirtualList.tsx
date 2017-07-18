import React from "react";
import ReactDom from "react-dom";
import { InfiniteLoader, AutoSizer, Dimensions, InfiniteLoaderChildProps, Index, IndexRange, List, ListRowProps } from "react-virtualized";
import { Component } from "../../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "../ScrollContainer";

interface VirtualListProps<T> extends ISimpleReactElementProps {
    data: T[];
    rowHeight: number;
    rowRenderer: (item: T) => React.ReactNode;
}

export default class VirtualList<T> extends Component<VirtualListProps<T>> {
    private list: List = null;

    refs: {
        loader: InfiniteLoader;
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

    private rowRenderer = (props: ListRowProps) => {
        let item = this.props.data[props.index];
        let child = item ? this.props.rowRenderer(item) : null;
        return <div key={props.key} style={props.style}>{child}</div>
    }

    render() {
        return <AutoSizer>
            {dimensions => {
                return <div style={{width: dimensions.width, height: dimensions.height}}>
                    <List
                        className={this.props.className}
                        rowRenderer={this.rowRenderer}
                        rowCount={this.props.data.length}
                        rowHeight={this.props.rowHeight}
                        width={dimensions.width}
                        height={dimensions.height}
                        ref={this.registerList}
                    />
                </div>
            }}
        </AutoSizer>;
    }
}