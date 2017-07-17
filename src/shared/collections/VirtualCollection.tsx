import React from "react";
import ReactDom from "react-dom";
import { AutoSizer, Dimensions, Index, IndexRange, List, ListRowProps, Collection, CollectionCellRendererParams, CollectionCellSizeAndPosition, SectionRenderedParams } from "react-virtualized";
import { Component } from "../../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "../ScrollContainer";

export type CellSize = CollectionCellSizeAndPosition;

const SizeZero: CellSize = { x: 0, y: 0, width: 0, height: 0 };
const DimensionsZero: Dimensions = { width: 0, height: 0 };

interface VirtualCollectionProps extends ISimpleReactElementProps {
    cellCount: number;
    cellsMeasurer: (collectionWidth: number) => CellSize[];
    cellRenderer: (index: number) => React.ReactNode;
    overscanCount?: number;
    scrollToCell?: number;
    onScroll?: any;
}

export default class VirtualCollection extends Component<VirtualCollectionProps> {
    private collection: Collection = null;
    private measureCache: CellSize[] = [];
    private lastDimensions: Dimensions = DimensionsZero;
    private suspended = false;

    constructor(props) {
        super(props);
        this.state = {
            version: 0
        };
    }

    reset() {
        if (this.collection) {
            this.ensureCellsMeasured(this.lastDimensions, true);

            this.collection.calculateSizeAndPositionData();
            this.collection.forceUpdate();
        }
    }

    suspend() {
        this.suspended = true;
    }
    resume() {
        this.suspended = false;
    }

    componentDidMount() {
        super.componentDidMount();
        this.initScroller();
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate(prevProps, prevState);
        this.initScroller();
    }

    componentWillReceiveProps(nextProps: VirtualCollectionProps) {
        if (nextProps.cellCount !== this.props.cellCount) {
            this.lastDimensions = DimensionsZero;
        }
    }

    componentWillUnmount() {
        let listNode = ReactDom.findDOMNode<HTMLElement>(this.collection);
        ScrollContainer.destroyScroller(listNode.parentElement);
    }

    private initScroller() {
        let gridNode = ReactDom.findDOMNode<HTMLElement>(this.collection);
        ScrollContainer.destroyScroller(gridNode.parentElement);
        ScrollContainer.initScroller(gridNode.parentElement, { innerSelector: gridNode });
    }

    private registerCollection = (collection) => {
        this.collection = collection;
    }

    private ensureCellsMeasured(currentDimensions: Dimensions, force?: boolean) {
        if (!currentDimensions.width || !currentDimensions.height) {
            return;
        }

        //memorize last dimensions for a later update
        if (this.suspended) {
            this.lastDimensions = currentDimensions;
            return;
        }

        if (force || this.lastDimensions.width !== currentDimensions.width || this.lastDimensions.height !== currentDimensions.height) {
            this.measureCache = this.props.cellsMeasurer(currentDimensions.width);
            this.lastDimensions = currentDimensions;
        }
    }

    private cellMeasurer = (props: Index) => {
        if (props.index < 0 || props.index >= this.measureCache.length) {
            return SizeZero;
        }
        return this.measureCache[props.index];
    }

    private cellRenderer = (props: CollectionCellRendererParams) => {
        return <div key={props.key} style={props.style}>
            {this.props.cellRenderer(props.index)}
        </div>;
    }

    render() {
        return <AutoSizer>
            {dimensions => {
                this.ensureCellsMeasured(dimensions);

                let cellCount = dimensions.width && dimensions.width ? this.props.cellCount : 0;

                return <div style={{ width: dimensions.width, height: dimensions.height }}>
                    <Collection
                        className={this.props.className}
                        cellRenderer={this.cellRenderer}
                        cellCount={cellCount}
                        cellSizeAndPositionGetter={this.cellMeasurer}
                        scrollToCell={this.props.scrollToCell}
                        verticalOverscanSize={this.props.overscanCount || 0}
                        scrollToAlignment={"start"}
                        onScroll={this.props.onScroll}
                        width={dimensions.width}
                        height={dimensions.height}
                        ref={this.registerCollection}
                    />
                </div>
            }}
        </AutoSizer>;
    }
}