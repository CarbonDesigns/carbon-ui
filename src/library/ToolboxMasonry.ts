import { CellSize } from "../shared/collections/CollectionDefs";

export default class ToolboxMasonry {
    private columns: number[] = [];
    private columnGroups: number[] = [];

    constructor(private categoryHeight: number, private widthAccessor: (item) => number, private heightAccessor: (item) => number) {
    }

    measure(config, collectionWidth: number, columnWidth: number, keepAspectRatio?: boolean): CellSize[] {
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

            for (let j = 0; j < group.items.length; j++) {
                let item = group.items[j];
                let width = this.widthAccessor(item);
                let height = this.heightAccessor(item);

                result.push(this.placeItem(width, height, columnWidth, flexShare, false, keepAspectRatio));
            }
        }

        return result;
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
            x: col * (columnWidth + flexShare),
            y,
            width: columnWidth * span + flexShare * span,
            height: height
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