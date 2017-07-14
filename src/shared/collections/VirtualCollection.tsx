import React from "react";
import ReactDom from "react-dom";
import { AutoSizer, Dimensions, Index, IndexRange, List, ListRowProps, Collection, CollectionCellRendererParams, CollectionCellSizeAndPosition, SectionRenderedParams } from "react-virtualized";
import { Component } from "../../CarbonFlux";
import { IPaginatedResult } from "carbon-api";
import ScrollContainer from "../ScrollContainer";

export type CellSize = CollectionCellSizeAndPosition;
export type A = SectionRenderedParams;

const SizeZero = { x: 0, y: 0, width: 0, height: 0 };

interface VirtualCollectionProps extends ISimpleReactElementProps {
    cellCount: number;
    cellsMeasurer: (collectionWidth: number) => CellSize[];
    cellRenderer: (index: number) => React.ReactNode;
    overscanCount?: number;
    scrollToCell?: number;
    onScroll?: any;
}

export default class VirtualCollection<T> extends Component<VirtualCollectionProps> {
    private collection: Collection = null;
    private measureCache: CellSize[] = [];
    private lastDimensions: Dimensions = { width: 0, height: 0 };
    private currentDimensions: Dimensions = { width: 0, height: 0 };

    reset() {
        if (this.collection) {
            this.collection.calculateSizeAndPositionData();
            this.collection.forceUpdate();
            this.initScroller();
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.initScroller();
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate(prevProps, prevState);
        this.initScroller();
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

    private ensureCellsMeasured() {
        if (!this.currentDimensions.width || !this.currentDimensions.height) {
            return;
        }
        if (this.lastDimensions.width !== this.currentDimensions.width || this.lastDimensions.height !== this.currentDimensions.height) {
            this.measureCache = this.props.cellsMeasurer(this.currentDimensions.width);
            this.lastDimensions = this.currentDimensions;
        }
    }

    private cellMeasurer = (props: Index) => {
        this.ensureCellsMeasured()

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
                this.currentDimensions = dimensions;
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