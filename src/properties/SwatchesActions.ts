import { Brush } from "carbon-core";

export type SwatchSlotName = "fill" | "stroke";

export type SwatchesAction =
    { type: "Swatches_ChangeSlot", active: SwatchSlotName} |
    { type: "Swatches_Update", fill: Brush, stroke: Brush };