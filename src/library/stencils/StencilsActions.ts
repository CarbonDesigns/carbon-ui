import { IPage } from "carbon-core";

export type StencilsAction =
    { type: "Stencils_ChangePage", page: IPage } |
    { type: "Stencils_ChangeCategory", category: string } |
    { type: "Stencils_ScrollCategory", category: string } |
    { type: "Stencils_Search", q: string } |
    { type: "Stencils_Clicked", e: React.KeyboardEvent<HTMLElement>, templateType: string, templateId: string, sourceId?: string };