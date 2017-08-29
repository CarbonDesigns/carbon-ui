import { IPage } from "carbon-core";
import { StencilInfo } from "../LibraryDefs";

export type StencilsAction =
    { type: "Stencils_ChangePage", page: IPage } |
    { type: "Stencils_Refresh" } |
    { type: "Stencils_Loaded", page: IPage, config: any, async: true } |
    { type: "Stencils_Dirty", changedId: string, async: true } |
    { type: "Stencils_Search", q: string } |
    { type: "Stencils_Clicked"} & StencilInfo |
    { type: "Stencils_ClickedCategory", category: any } |
    { type: "Stencils_ScrolledToCategory", category: any } |
    { type: "StencilsSearch_ClickedCategory", category: any } |
    { type: "StencilsSearch_ScrolledToCategory", category: any };