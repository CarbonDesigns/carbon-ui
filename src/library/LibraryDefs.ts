import { IUIElement } from "carbon-core";

export type StencilInfo = {
    e: React.KeyboardEvent<HTMLElement>;
    templateType: string;
    templateId: string;
    sourceId?: string;
    templatePid?: string;
    templateAid?: string;
    templateWidth?: string;
    templateHeight?: string;
}

export interface IToolboxStore {
    storeType: string;

    createElement(info: StencilInfo): IUIElement;
    elementAdded();
}