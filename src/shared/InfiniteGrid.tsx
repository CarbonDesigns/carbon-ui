import React from "react";
import ReactDom from "react-dom";
import { InfiniteLoader, AutoSizer, Grid, Dimensions, InfiniteLoaderChildProps, SectionRenderedParams, Index, IndexRange, GridCellProps } from "react-virtualized";
import { Component } from "../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "./ScrollContainer";

interface InfiniteGridProps<T = any> extends ISimpleReactElementProps {
    cellWidth: number;
    cellHeight: number;
    cellRenderer: (item: T) => React.ReactNode;
    loadMore: (startIndex: number, stopIndex: number) => Promise<IPaginatedResult<T>>;
    overscanCount?: number;
}

type InfiniteGridState<T> = {
    data: T[];
    totalCount: number;
    invalidateVersion: number;
    noResults: boolean;
}

export default class InfiniteGrid<T = any> extends Component<InfiniteGridProps<T>, InfiniteGridState<T>> {
    static defaultProps: Partial<InfiniteGridProps> = {
        overscanCount: 0
    }

    private onRowsRendered: (params: { startIndex: number, stopIndex: number }) => void = null;
    private columnCount: number = 0;
    private rowCount: number = 0;
    private grid: Grid = null;
    private registerChild: (child: any) => void;
    private firstPageStart = 0;
    private firstPageStop = 0;

    refs: {
        loader: InfiniteLoader;
    }

    constructor(props) {
        super(props);

        this.state = { data: [], totalCount: 0, invalidateVersion: 0, noResults: false };
    }

    componentDidMount() {
        super.componentDidMount();
        this.initScroller();
    }

    componentWillUnmount() {
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.grid);
        ScrollContainer.destroyScroller(gridNode.parentElement);
    }

    componentDidUpdate(prevProps: InfiniteGridProps<T>, prevState: InfiniteGridState<T>) {
        this.initScroller();

        if (this.state.invalidateVersion !== prevState.invalidateVersion) {
            //if the grid has been reset, re-fetch the first page
            this.onRowsRendered({ startIndex: this.firstPageStart, stopIndex: this.firstPageStop });
            this.grid.scrollToPosition({ scrollLeft: 0, scrollTop: 0 });
        }
    }

    getItem(rowIndex: number, columnIndex: number) {
        return this.state.data[rowIndex * this.columnCount + columnIndex];
    }

    reset() {
        this.refs.loader.resetLoadMoreRowsCache();
        this.setState({ data: [], totalCount: 0, invalidateVersion: this.state.invalidateVersion + 1, noResults: false });
    }

    private initScroller() {
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.grid);
        ScrollContainer.initScroller(gridNode.parentElement, { innerSelector: gridNode });
    }

    private registerGrid = (grid) => {
        this.grid = grid;
        this.registerChild(grid);
    }

    private isRowLoaded = (params: Index) => {
        return params.index >= 0 && params.index < this.state.data.length;
    }
    private loadMoreRows = (params: IndexRange) => {
        return this.props.loadMore(params.startIndex, params.stopIndex)
            .then(result => this.setState({
                data: this.appendPage(result.pageData),
                totalCount: result.totalCount,
                noResults: this.state.totalCount === 0 && result.totalCount === 0
            }));
    }
    private appendPage(pageData: T[]) {
        for (var i = 0; i < pageData.length; i++) {
            this.state.data.push(pageData[i]);
        }
        return this.state.data;
    }

    /**
     * On the first load, calculate possible amount of rows and update itself to query for data.
     * On subsequent loads, calculate number of rows based on known data.
     * @param dimensions Current dimensions
     * @param columnCount Number of columns
     */
    private getRowCount(dimensions: Dimensions, columnCount: number) {
        let total = this.state.totalCount;
        if (total === 0 && !this.state.noResults) {
            let possibleRows = Math.ceil(dimensions.height / this.props.cellHeight);
            total = columnCount * possibleRows;
            if (total) {
                setTimeout(() => {
                    this.refs.loader.resetLoadMoreRowsCache();
                    this.setState({ totalCount: total });
                }, 1);
            }

            return 0;
        }

        return columnCount === 0 ? 0 : Math.ceil(total / columnCount);
    }

    private infiniteLoaderChildFunction = (loaderProps: InfiniteLoaderChildProps) => {
        this.onRowsRendered = loaderProps.onRowsRendered;
        this.registerChild = loaderProps.registerChild;

        return <AutoSizer>
            {dimensions => {
                this.columnCount = Math.floor(dimensions.width / this.props.cellWidth);
                this.rowCount = this.getRowCount(dimensions, this.columnCount);

                //cells with aspect ratio
                let actualCellWidth = dimensions.width / (this.columnCount || 1);
                let actualCellHeight = this.props.cellHeight * actualCellWidth / this.props.cellWidth;

                return <div className={this.props.className} style={{ width: dimensions.width, height: dimensions.height }}>
                    <Grid
                        style={{ overflowX: "hidden" }}
                        cellRenderer={this.cellRenderer}
                        columnCount={this.columnCount}
                        columnWidth={actualCellWidth}
                        rowCount={this.rowCount}
                        rowHeight={actualCellHeight}
                        width={dimensions.width}
                        height={dimensions.height}
                        overscanRowCount={Math.ceil(this.props.overscanCount/this.columnCount)}
                        onSectionRendered={params => this.onSectionRendered(params, this.columnCount)}
                        ref={this.registerGrid}
                    />
                </div>
            }}
        </AutoSizer>;
    }

    private cellRenderer = (props: GridCellProps) => {
        let item = this.getItem(props.rowIndex, props.columnIndex);
        let child = item ? this.props.cellRenderer(item) : null;
        return <div key={props.key} style={props.style}>{child}</div>
    }

    private onSectionRendered(params: SectionRenderedParams, columnCount: number) {
        if (!columnCount) {
            return;
        }

        const startIndex = params.rowStartIndex * columnCount + params.columnStartIndex;
        const stopIndex = params.rowStopIndex * columnCount + params.columnStopIndex;

        //memorize most recent size of the first page
        if (!startIndex) {
            this.firstPageStart = startIndex;
            this.firstPageStop = stopIndex;
        }

        this.onRowsRendered({
            startIndex,
            stopIndex
        });
    }

    render() {
        return <InfiniteLoader ref="loader" isRowLoaded={this.isRowLoaded} loadMoreRows={this.loadMoreRows} rowCount={this.state.totalCount}>
            {this.infiniteLoaderChildFunction}
        </InfiniteLoader>;
    }
}