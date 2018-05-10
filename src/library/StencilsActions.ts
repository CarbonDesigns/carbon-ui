import { IPage, IView } from "carbon-core";
import { StencilInfo, StencilClickEvent, Stencil } from "./LibraryDefs";

/**
 * Common actions for all types of stencils.
 */
export type StencilsAction =
    { type: "Stencils_Clicked", e: StencilClickEvent, stencil: StencilInfo } |
    { type: "Stencils_Added", stencilType: string, stencil: Stencil, async: true };