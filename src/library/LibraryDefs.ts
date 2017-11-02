import { IUIElement, IRectData, ISize, IContainerProps } from "carbon-core";

export interface Stencil {
    id: string;
    title: string;
    realWidth?: number;
    realHeight?: number;
}

export interface SpriteStencil extends Stencil {
    spriteMap: IRectData;
    spriteSize: ISize;
    spriteUrl: string;
    spriteUrl2x: string;
    pageId: string;
}

export interface SymbolStencil extends SpriteStencil {
    artboardId: string;
    stateId?: string;
}

export interface DataStencil extends Stencil {
    examples: (string | number)[];
}

export type ToolboxGroup<T extends Stencil> = {
    name: string;
    items: T[];
}

export type ToolboxConfig<T extends Stencil> = {
    id: string;
    groups: ToolboxGroup<T>[];
}

export type PageSpriteCacheItem = {
    id: string;
    version: string;
    spriteUrl: string;
    spriteUrl2x: string;
    spriteSize: ISize;
}

export interface IToolboxStore {
    storeType: string;

    findStencil(info: StencilInfo): Stencil;
    createElement(stencil: Stencil, info: StencilInfo): IUIElement;
    elementAdded(stencil: Stencil);
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

export const SymbolsOverscanCount = 10;
export const SymbolsColumnWidth = 128;

export const IconsOverscanCount = 20;
export const IconSize = 40;

export const ImageLandscapeHeight = 200;
export const ImagePortraitHeight = 300;