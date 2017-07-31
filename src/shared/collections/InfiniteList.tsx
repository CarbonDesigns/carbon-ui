import React from "react";
import ReactDom from "react-dom";
import { InfiniteLoader, AutoSizer, Dimensions, InfiniteLoaderChildProps, Index, IndexRange, List, ListRowProps } from "react-virtualized";
import { Component } from "../../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "../ScrollContainer";
import { DimensionsZero } from "./CollectionDefs";
import Antiscroll from "../../external/antiscroll";

interface InfiniteListProps<T> extends ISimpleReactElementProps {
    rowHeight: number | ((item: T, index: number) => number);
    estimatedRowHeight?: number;
    rowRenderer: (item: T) => React.ReactNode;
    loadMore: (startIndex: number, stopIndex: number) => Promise<IPaginatedResult<T>>;
    noContentRenderer?: () => React.ReactNode;
}

type InfiniteListState<T> = {
    data: T[];
    rowCount: number;
    totalCount: number;
    dimensions: Dimensions;
    version: number;
}

/**
 * Just a guess number for infinite loader to initiate fetch.
 */
const InitialTotalCount = 1000;

export default class InfiniteList<T> extends Component<InfiniteListProps<T>, InfiniteListState<T>> {
    private scroller: Antiscroll;
    private onRowsRendered: (params: { startIndex: number, stopIndex: number }) => void = null;
    private list: List = null;
    private registerChild: (child: any) => void;
    private firstPageStart = 0;
    private firstPageStop = 0;

    static defaultProps: Partial<InfiniteListProps<any>> = {
        estimatedRowHeight: 10
    }

    refs: {
        loader: InfiniteLoader;
    }

    constructor(props) {
        super(props);

        this.state = { data: [], totalCount: InitialTotalCount, version: 0, dimensions: DimensionsZero, rowCount: 1 };
    }

    componentDidMount() {
        super.componentDidMount();
        this.initScroller();
    }

    componentWillUnmount(){
        this.scroller.destroy();
    }

    componentDidUpdate(prevProps: InfiniteListProps<T>, prevState: InfiniteListState<T>) {
        this.initScroller();

        if (this.state.version !== prevState.version) {
            //if the list has been reset, re-fetch the first page
            this.onRowsRendered({ startIndex: this.firstPageStart, stopIndex: this.firstPageStop });
            this.list.scrollToPosition(0);
        }
    }

    getItem(index: number) {
        return this.state.data[index];
    }

    reset() {
        this.refs.loader.resetLoadMoreRowsCache();
        let rowCount = this.calculateRowsToFit(this.state.dimensions);
        this.setState({ data: [], totalCount: InitialTotalCount, rowCount, version: this.state.version + 1 });
    }

    private initScroller(){
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.list);
        this.scroller = ScrollContainer.initScroller(gridNode.parentElement, {innerSelector: gridNode});
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
                totalCount: result.totalCount,
                rowCount: result.totalCount
            }));
    }
    private appendPage(pageData: T[]) {
        for (var i = 0; i < pageData.length; i++) {
            this.state.data.push(pageData[i]);
        }
        return this.state.data;
    }

    private calculateRowsToFit(dimensions: Dimensions) {
        let height = this.props.rowHeight;
        if (typeof height === "function") {
            height = this.props.estimatedRowHeight;
        }
        return Math.ceil(dimensions.height / height);
    }

    private onNewDimensions(dimensions: Dimensions) {
        if (!dimensions.width || !dimensions.height) {
            return;
        }

        if (!this.state.dimensions.width || !this.state.dimensions.height) {
            setTimeout(() => {
                this.refs.loader.resetLoadMoreRowsCache();
                let rowCount = this.calculateRowsToFit(dimensions);
                this.setState({ rowCount, dimensions });
            }, 1);

            return;
        }
    }

    private infiniteLoaderChildFunction = (loaderProps: InfiniteLoaderChildProps) => {
        this.onRowsRendered = loaderProps.onRowsRendered;
        this.registerChild = loaderProps.registerChild;

        return <AutoSizer>
            {dimensions => {
                this.onNewDimensions(dimensions);

                return <div style={{width: dimensions.width, height: dimensions.height}}>
                    <List
                        className={this.props.className}
                        rowRenderer={this.rowRenderer}
                        noContentRenderer={this.props.noContentRenderer}
                        rowCount={this.state.rowCount}
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