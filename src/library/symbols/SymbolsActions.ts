import { IPage } from "carbon-core";
import { StencilInfo, StencilClickEvent, Stencil } from "../LibraryDefs";

export type SymbolsAction =
    { type: "Symbols_ChangePage", page: IPage } |
    { type: "Symbols_Refresh" } |
    { type: "Symbols_Loaded", page: IPage, config: any, async: true } |
    { type: "Symbols_Dirty", changedId: string, async: true } |
    { type: "Symbols_Search", q: string } |
    { type: "Symbols_ClickedCategory", category: any } |
    { type: "Symbols_ScrolledToCategory", category: any } |
    { type: "SymbolsSearch_ClickedCategory", category: any } |
    { type: "SymbolsSearch_ScrolledToCategory", category: any };