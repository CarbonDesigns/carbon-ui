import React from "react";
import ReactDom from "react-dom";
import { InfiniteLoader, List, WindowScroller, AutoSizer, Grid, Dimensions, InfiniteLoaderChildProps, SectionRenderedParams, Index, IndexRange, GridCellProps } from "react-virtualized";
import { Component } from "../../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "../ScrollContainer";
import { DimensionsZero } from "./CollectionDefs";
import Antiscroll from "../../external/antiscroll";
import { GuiSpinner, GuiSpinnerMod } from "../ui/GuiComponents";
import { Operation } from "../Operation";

interface InfiniteGridProps<T = any> extends ISimpleReactElementProps {
    cellWidth: number;
    cellHeight: number;
    cellRenderer: (item: T) => React.ReactNode;
    windowScroll?: boolean;
    loadMore: (startIndex: number, stopIndex: number) => Promise<IPaginatedResult<T>>;
    noContentRenderer?: () => React.ReactNode;
    spinnerMods?: GuiSpinnerMod;
    filter?: string;
}

type InfiniteGridState<T> = {
    data: T[];
    version: number;
    rowCount: number;
    columnCount: number;
    totalCount: number;
    dimensions: Dimensions;
    operation: Operation;
}

/**
 * Just a guess number for infinite loader to initiate fetch.
 */
const InitialTotalCount = 1000;

export default class InfiniteGrid<T = any> extends Component<InfiniteGridProps<T>, InfiniteGridState<T>> {
    private scroller: Antiscroll;
    private onRowsRendered: (params: { startIndex: number, stopIndex: number }) => void = null;
    private grid: Grid = null;
    private registerChild: (child: any) => void;
    private firstPageStart = 0;
    private firstPageStop = 0;

    refs: {
        loader: InfiniteLoader;
    }

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            dimensions: DimensionsZero,
            rowCount: 0,
            columnCount: 0,
            totalCount: InitialTotalCount,
            version: 0,
            operation: null
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.initScroller();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.scroller.destroy();
    }

    componentWillReceiveProps(nextProps: InfiniteGridProps<T>) {
        if (nextProps.filter !== this.props.filter) {
            this.reset();
        }
    }

    componentDidUpdate(prevProps: InfiniteGridProps<T>, prevState: InfiniteGridState<T>) {
        this.initScroller();

        if (this.state.version !== prevState.version) {
            //if the grid has been reset, re-fetch the first page
            this.onRowsRendered({ startIndex: this.firstPageStart, stopIndex: this.firstPageStop });
            this.grid.scrollToPosition({ scrollLeft: 0, scrollTop: 0 });
        }
    }

    getItem(rowIndex: number, columnIndex: number) {
        return this.state.data[rowIndex * this.state.columnCount + columnIndex];
    }

    reset() {
        this.refs.loader.resetLoadMoreRowsCache();

        let newState = this.recalculateStateToFit(this.state.dimensions);
        newState = Object.assign({ data: [], version: this.state.version + 1 }, newState);
        newState.totalCount = InitialTotalCount;
        this.setState(newState);

        // If number of rows/columns does not change, the grid needs to be forcefully updated
        // to hide content
        this.grid.forceUpdate();
    }

    private initScroller() {
        if (this.props.windowScroll) {
            this.scroller = ScrollContainer.initScroller(document.documentElement);
        }
        else {
            let gridNode = ReactDom.findDOMNode(this.grid) as HTMLElement;
            this.scroller = ScrollContainer.initScroller(gridNode.parentElement, { innerSelector: gridNode });
        }
    }

    private registerGrid = (grid) => {
        this.grid = grid;
        this.registerChild(grid);
    }

    private isRowLoaded = (params: Index) => {
        return params.index >= 0 && params.index < this.state.data.length;
    }
    /**
     * Initial request saves the operation to show a loading spinner.
     * Subsequent requests do not show spinner and are not delayed.
     * Probably, the cells which are not loaded should instead draw their outline with spinners inside.
     */
    private loadMoreRows = (params: IndexRange) => {
        let isEmpty = this.state.data.length === 0;
        let operation = new Operation(!isEmpty);
        if (isEmpty) {
            this.setState({ operation });
        }
        return operation.start()
            .then(() => this.props.loadMore(params.startIndex, params.stopIndex))
            .then(data => operation.stop(data))
            .then(result => {
                let rowCount = Math.ceil(result.totalCount / this.state.columnCount);
                this.setState({
                    data: this.appendPage(result.pageData),
                    totalCount: result.totalCount,
                    rowCount,
                    operation: null
                });
            });
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
     */
    private onNewDimensions(dimensions: Dimensions) {
        if (!dimensions.width || !dimensions.height) {
            return;
        }

        if (!this.state.dimensions.width || !this.state.dimensions.height) {
            setTimeout(() => {
                this.refs.loader.resetLoadMoreRowsCache();
                let newState = this.recalculateStateToFit(dimensions);
                this.setState(newState);
            }, 1);

            return;
        }

        if (this.state.dimensions.width !== dimensions.width || this.state.dimensions.height !== dimensions.height) {
            let newState = null;
            if (this.state.data.length) {
                let columnCount = this.getColumnCount(dimensions);
                let rowCount = Math.ceil(this.state.totalCount / columnCount);
                newState = { columnCount, rowCount, dimensions };
            }
            else if (!this.state.dimensions.width || !this.state.dimensions.height) {
                // If the grid already takes space, but does not have any results,
                // do not recalculate state to avoid requests on window resize
                newState = this.recalculateStateToFit(dimensions);
            }

            if (newState) {
                setTimeout(() => this.setState(newState), 1);
            }
        }
    }

    private recalculateStateToFit(dimensions: Dimensions) {
        let rowCount = Math.ceil(dimensions.height / this.props.cellHeight);
        let columnCount = this.getColumnCount(dimensions);
        let totalCount = columnCount * rowCount;
        return { totalCount, columnCount, rowCount, dimensions };
    }

    private getColumnCount(dimensions: Dimensions) {
        return Math.floor(dimensions.width / this.props.cellWidth);
    }

    private infiniteLoaderChildFunctionWindowScroller = (loaderProps: InfiniteLoaderChildProps) => {
        this.onRowsRendered = loaderProps.onRowsRendered;
        this.registerChild = loaderProps.registerChild;

        return <WindowScroller>
            {(scrollerProps: any) =>
                <AutoSizer disableHeight>
                    {dimensions => {
                        this.onNewDimensions(dimensions);

                        let actualCellWidth = this.props.cellWidth;
                        let actualCellHeight = this.props.cellHeight;

                        return <Grid
                            style={InfiniteGrid.GridStyle}
                            autoHeight
                            cellRenderer={this.cellRenderer}
                            noContentRenderer={this.props.noContentRenderer}
                            columnCount={this.state.columnCount}
                            columnWidth={actualCellWidth}
                            isScrolling={scrollerProps.isScrolling}
                            onScroll={scrollerProps.onChildScroll}
                            rowCount={this.state.rowCount}
                            rowHeight={actualCellHeight}
                            width={dimensions.width}
                            height={scrollerProps.height}
                            scrollTop={scrollerProps.scrollTop}
                            onSectionRendered={this.onSectionRendered}
                            ref={this.registerGrid}
                        />
                    }}
                </AutoSizer>
            }
        </WindowScroller>;
    }

    private infiniteLoaderChildFunction = (loaderProps: InfiniteLoaderChildProps) => {
        this.onRowsRendered = loaderProps.onRowsRendered;
        this.registerChild = loaderProps.registerChild;

        return <AutoSizer>
            {dimensions => {
                this.onNewDimensions(dimensions);

                //cells with aspect ratio
                let actualCellWidth = dimensions.width / (this.state.columnCount || 1);
                let actualCellHeight = this.props.cellHeight * actualCellWidth / this.props.cellWidth;

                return <div className={this.props.className} style={{ width: dimensions.width, height: dimensions.height }}>
                    <Grid
                        style={{ overflowX: "hidden" }}
                        cellRenderer={this.cellRenderer}
                        noContentRenderer={this.props.noContentRenderer}
                        columnCount={this.state.columnCount}
                        columnWidth={actualCellWidth}
                        rowCount={this.state.rowCount}
                        rowHeight={actualCellHeight}
                        width={dimensions.width}
                        height={dimensions.height}
                        onSectionRendered={this.onSectionRendered}
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

    private onSectionRendered = (params: SectionRenderedParams) => {
        if (!this.state.columnCount) {
            return;
        }

        const startIndex = params.rowStartIndex * this.state.columnCount + params.columnStartIndex;
        const stopIndex = params.rowStopIndex * this.state.columnCount + params.columnStopIndex;

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
        return <div style={InfiniteGrid.TopDivStyle}>
            { this.state.operation ? <GuiSpinner mods={this.props.spinnerMods} /> : null}
            <InfiniteLoader ref="loader" isRowLoaded={this.isRowLoaded} loadMoreRows={this.loadMoreRows}
                rowCount={this.state.totalCount}>
                {this.props.windowScroll ? this.infiniteLoaderChildFunctionWindowScroller : this.infiniteLoaderChildFunction}
            </InfiniteLoader>
        </div>;
    }

    private static TopDivStyle: React.CSSProperties = {flex: "auto"};
    private static GridStyle: React.CSSProperties = { overflowX: "hidden", display: "flex", "justifyContent": "center" };
}