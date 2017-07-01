import { IPage } from "carbon-core";

export type StencilsAction =
    { type: "Stencils_ChangePage", page: IPage } |
    { type: "Stencils_Refresh" } |
    { type: "Stencils_Loaded", page: IPage, config: any, changedId: string, dirtyConfig: boolean, async: true } |
    { type: "Stencils_Dirty", changedId: string, async: true } |
    { type: "Stencils_ChangeCategory", category: string } |
    { type: "Stencils_ScrollCategory", category: string } |
    { type: "Stencils_Search", q: string } |
    { type: "Stencils_Clicked", e: React.KeyboardEvent<HTMLElement>, templateType: string, templateId: string, sourceId?: string };