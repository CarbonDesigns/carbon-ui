import React from "react";
import ReactDom from "react-dom";
import { InfiniteLoader, AutoSizer, Dimensions, InfiniteLoaderChildProps, Index, IndexRange, List, ListRowProps } from "react-virtualized";
import { Component } from "../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "./ScrollContainer";

interface InfiniteListProps<T> extends ISimpleReactElementProps {
    rowHeight: number | ((item: T, index: number) => number);
    rowRenderer: (item: T) => React.ReactNode;
    loadMore: (startIndex: number, stopIndex: number) => Promise<IPaginatedResult<T>>;
}

type InfiniteListState<T> = {
    data: T[];
    totalCount: number;
    invalidateVersion: number;
}

/**
 * Just a guess number for infinite loader to initiate fetch. Must be >= 40, otherwise, two initial requests are made for some reason.
 */
const InitialTotalCount = 40;

export default class InfiniteList<T> extends Component<InfiniteListProps<T>, InfiniteListState<T>> {
    private onRowsRendered: (params: { startIndex: number, stopIndex: number }) => void = null;
    private list: List = null;
    private registerChild: (child: any) => void;
    private firstPageStart = 0;
    private firstPageStop = 0;

    refs: {
        loader: InfiniteLoader;
    }

    constructor(props) {
        super(props);

        this.state = { data: [], totalCount: InitialTotalCount, invalidateVersion: 0 };
    }

    componentDidMount() {
        super.componentDidMount();
        this.initScroller();
    }

    componentWillUnmount(){
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.list);
        ScrollContainer.destroyScroller(gridNode.parentElement);
    }

    componentDidUpdate(prevProps: InfiniteListProps<T>, prevState: InfiniteListState<T>) {
        this.initScroller();

        if (this.state.invalidateVersion !== prevState.invalidateVersion) {
            //if the grid has been reset, re-fetch the first page
            this.onRowsRendered({ startIndex: this.firstPageStart, stopIndex: this.firstPageStop });
            this.list.scrollToPosition(0);
        }
    }

    getItem(index: number) {
        return this.state.data[index];
    }

    reset() {
        this.refs.loader.resetLoadMoreRowsCache();
        this.setState({ data: [], totalCount: InitialTotalCount, invalidateVersion: this.state.invalidateVersion + 1 });
    }

    private initScroller(){
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.list);
        ScrollContainer.initScroller(gridNode.parentElement, {innerSelector: gridNode});
    }

    private registerList = (list) => {
        this.list = list;
        this.registerChild(list);
    }

    private isRowLoaded = (params: Index) => {
        return params.index >= 0 && params.index < this.state.data.length;
    }
    private getRowHeight = (params: Index) => {
        if (typeof this.props.rowHeight === "function") {
            let item = this.getItem(params.index);
            if (!item) {
                return 0;
            }
            return this.props.rowHeight(item, params.index);
        }
        return this.props.rowHeight;
    }
    private loadMoreRows = (params: IndexRange) => {
        return this.props.loadMore(params.startIndex, params.stopIndex)
            .then(result => this.setState({
                data: this.appendPage(result.pageData),
                totalCount: result.totalCount
            }));
    }
    private appendPage(pageData: T[]) {
        for (var i = 0; i < pageData.length; i++) {
            this.state.data.push(pageData[i]);
        }
        return this.state.data;
    }

    private infiniteLoaderChildFunction = (loaderProps: InfiniteLoaderChildProps) => {
        this.onRowsRendered = loaderProps.onRowsRendered;
        this.registerChild = loaderProps.registerChild;

        return <AutoSizer>
            {dimensions => {
                return <div style={{width: dimensions.width, height: dimensions.height}}>
                    <List
                        className={this.props.className}
                        rowRenderer={this.rowRenderer}
                        rowCount={this.state.totalCount}
                        rowHeight={this.getRowHeight}
                        width={dimensions.width}
                        height={dimensions.height}
                        onRowsRendered={this.onRowsRendered}
                        ref={this.registerList}
                    />
                </div>
            }}
        </AutoSizer>;
    }

    private rowRenderer = (props: ListRowProps) => {
        let item = this.getItem(props.index);
        let child = item ? this.props.rowRenderer(item) : null;
        return <div key={props.key} style={props.style}>{child}</div>
    }

    render() {
        return <InfiniteLoader ref="loader" isRowLoaded={this.isRowLoaded} loadMoreRows={this.loadMoreRows} rowCount={this.state.totalCount}>
            {this.infiniteLoaderChildFunction}
        </InfiniteLoader>;
    }
}