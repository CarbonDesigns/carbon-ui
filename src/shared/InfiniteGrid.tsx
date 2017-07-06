import React from "react";
import { InfiniteLoader, AutoSizer, Grid, Dimensions, InfiniteLoaderChildProps, SectionRenderedParams, Index, IndexRange, GridCellProps } from "react-virtualized";
import { Component } from "../CarbonFlux";
import { IPaginatedResult } from "carbon-api";

type InfiniteGridProps<T> = {
    cellWidth: number;
    cellHeight: number;
    /**
     * If flex is specified, the cell size is proportionally increased to fill available space horizontally.
     */
    flex?: boolean;
    cellRenderer: (item: T) => React.ReactNode;
    loadMore: (startIndex: number, stopIndex: number) => Promise<IPaginatedResult<T>>;
}

type InfiniteGridState<T> = {
    data: T[];
    totalCount: number;
    invalidateVersion: number;
}

/**
 * Just a guess number for infinite loader to initiate fetch. Must be >= 40, otherwise, two initial requests are made for some reason.
 */
const InitialTotalCount = 40;
var i = 0;

export default class InfiniteGrid<T> extends Component<InfiniteGridProps<T>, InfiniteGridState<T>> {
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

        this.state = { data: [], totalCount: InitialTotalCount, invalidateVersion: 0 };
    }

    componentDidUpdate(prevProps: InfiniteGridProps<T>, prevState: InfiniteGridState<T>) {
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
        this.setState({ data: [], totalCount: InitialTotalCount, invalidateVersion: this.state.invalidateVersion + 1 });
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
                this.columnCount = Math.floor(dimensions.width / this.props.cellWidth);
                this.rowCount = this.columnCount === 0 ? 0 : Math.ceil(this.state.totalCount / this.columnCount);

                let actualCellWidth = this.props.cellWidth;
                let actualCellHeight = this.props.cellHeight;
                if (this.props.flex) {
                    actualCellWidth = dimensions.width / this.columnCount;
                    actualCellHeight = this.props.cellHeight * actualCellWidth / this.props.cellWidth;
                }

                return <Grid
                    cellRenderer={this.cellRenderer}
                    columnCount={this.columnCount}
                    columnWidth={actualCellWidth}
                    rowCount={this.rowCount}
                    rowHeight={actualCellHeight}
                    width={dimensions.width}
                    height={dimensions.height}
                    onSectionRendered={params => this.onSectionRendered(params, this.columnCount)}
                    ref={this.registerGrid}
                />
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