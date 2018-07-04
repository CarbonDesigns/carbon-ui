import { CellSize } from "../shared/collections/CollectionDefs";
import { ToolboxConfig, Stencil } from "./LibraryDefs";

export default class ToolboxMasonry {
    private columns: number[] = [];
    private columnGroups: number[] = [];

    constructor(private categoryHeight: number, private widthAccessor: (item) => number, private heightAccessor: (item) => number) {
    }

    measure(config: ToolboxConfig<Stencil>, collectionWidth: number, columnWidth: number, keepAspectRatio?: boolean, reverse?: boolean): CellSize[] {
        let colCount = Math.floor(collectionWidth / columnWidth);
        colCount = Math.max(colCount, 1);
        this.columns.length = 0;
        for (var i = 0; i < colCount; i++) {
            this.columns.push(0);
        }

        let flexShare = Math.floor(collectionWidth / this.columns.length - columnWidth);

        let groups = config.groups;
        let result: CellSize[] = [];

        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            result.push(this.placeItem(columnWidth * this.columns.length, this.categoryHeight, columnWidth, flexShare, true));

            if (reverse) {
                for (let j = group.items.length - 1; j >= 0 ; --j) {
                    let item = group.items[j];
                    result.push(this.processItem(item, columnWidth, flexShare, keepAspectRatio));
                }
            }
            else {
                for (let j = 0; j < group.items.length; j++) {
                    let item = group.items[j];
                    result.push(this.processItem(item, columnWidth, flexShare, keepAspectRatio));
                }
            }
        }

        return result;
    }

    private processItem(item: Stencil, columnWidth: number, flexShare: number, keepAspectRatio: boolean) {
        let width = this.widthAccessor(item);
        let height = this.heightAccessor(item);

        return this.placeItem(width, height, columnWidth, flexShare, false, keepAspectRatio);
    }

    private placeItem(width: number, height: number, columnWidth: number, flexShare: number, header?: boolean, keepAspectRatio?: boolean): CellSize {
        let span = Math.round(width / columnWidth);
        span = Math.max(span, 1);
        span = Math.min(span, this.columns.length);

        let colGroups = this.calculateColumnGroups(span);
        let y = Number.MAX_VALUE;
        let col = 0;
        for (let k = 0; k < colGroups.length; ++k) {
            if (colGroups[k] < y) {
                y = colGroups[k];
                col = k;
            }
        }

        if (!header && keepAspectRatio) {
            height = height * (columnWidth * span / width) + flexShare * span;
        }

        for (let k = col; k < col + span; ++k) {
            this.columns[k] = y + height;
        }

        return {
            x: col * (columnWidth + flexShare) + 2,
            y: y+2,
            width: columnWidth * span + flexShare * span - 4,
            height: height - 4,
        };
    }

    private calculateColumnGroups(span: number) {
        if (span === 1) {
            return this.columns;
        }

        this.columnGroups.length = 0;
        let groupCount = this.columns.length + 1 - span;
        for (let i = 0; i < groupCount; ++i) {
            this.columnGroups[i] = this.findHighestColumn(i, span);
        }

        return this.columnGroups;
    }

    private findHighestColumn(i: number, span: number) {
        let result = 0;
        for (let j = i; j < i + span; ++j) {
            result = Math.max(result, this.columns[j]);
        }
        return result;
    }
}