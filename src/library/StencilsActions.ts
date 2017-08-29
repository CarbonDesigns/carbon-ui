import { IPage } from "carbon-core";
import { StencilInfo, StencilClickEvent, ToolboxStencil } from "./LibraryDefs";

/**
 * Common actions for all types of stencils.
 */
export type StencilsAction =
    { type: "Stencils_Clicked", e: StencilClickEvent, stencil: StencilInfo } |
    { type: "Stencils_Added", stencilType: string, stencil: ToolboxStencil, async: true };