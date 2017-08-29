import { IUIElement, IRectData, ISize } from "carbon-core";

export interface ToolboxStencil {
    id: string;
    title: string;
    realWidth: number;
    realHeight: number;
}

export interface SpriteStencil extends ToolboxStencil {
    spriteMap: IRectData;
    spriteSize: ISize;
    spriteUrl: string;
    spriteUrl2x: string;
    pageId: string;
}

export interface IconSpriteStencil extends SpriteStencil {
    artboardId: string;
}

export type ToolboxConfigGroup<T extends ToolboxStencil> = {
    name: string;
    items: T[];
}

export type ToolboxConfig<T extends ToolboxStencil> = {
    id: string;
    groups: ToolboxConfigGroup<T>[];
}

export type StencilClickEvent = {
    ctrlKey: boolean;
    metaKey: boolean;
    currentTarget: HTMLElement;
}

export interface StencilInfo {
    stencilType: string;
    stencilId: string;
}

export interface SpriteStencilInfo extends StencilInfo {
    pageId: string;
}

export interface IToolboxStore {
    storeType: string;

    findStencil(info: StencilInfo): ToolboxStencil;
    createElement(info: StencilInfo): IUIElement;
    elementAdded(info: StencilInfo);
}

export const SymbolsOverscanCount = 10;
export const SymbolsColumnWidth = 128;
