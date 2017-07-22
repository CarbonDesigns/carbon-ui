import { CollectionCellSizeAndPosition, Dimensions } from "react-virtualized";

export type CellSize = CollectionCellSizeAndPosition;

export const SizeZero: CellSize = { x: 0, y: 0, width: 0, height: 0 };
export const DimensionsZero: Dimensions = { width: 0, height: 0 };
