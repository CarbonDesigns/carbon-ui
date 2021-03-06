import { ILayer, IApp, ArtboardType, IArtboard, IPage, AppSettings, IUIElement, IDataNode, ISelectComposite, IPrimitive, Primitive } from "carbon-core";

export type CarbonAction =
    { type: "Carbon_AppLoaded" } |
    { type: "Carbon_AppUpdated" } |
    { type: "Carbon_Cancel" } |
    { type: "Carbon_Scroll" } |
    { type: "Carbon_TextEditModeChanged", editing: boolean; } |
    { type: "Carbon_PrototypeMode", mode: "visual" | "code" } |
    { type: "Carbon_AppChanged", primitives: Primitive[] } |
    { type: "Carbon_AppSettingsChanged", settings: AppSettings } |
    { type: "Carbon_Selection", composite: ISelectComposite } |
    { type: "Carbon_PropertiesRequested", composite: ISelectComposite } |
    { type: "Carbon_ScaleChanged", scale: number } |
    { type: "Carbon_PropsChanged", element: IDataNode, props: any, oldProps: any } |
    { type: "Carbon_ResourcePageChanged", page: IPage } |
    { type: "Carbon_ResourceAdded", resourceType: ArtboardType, resource: IArtboard } |
    { type: "Carbon_ResourceChanged", resourceType: ArtboardType, resource: IArtboard } |
    { type: "Carbon_ResourceDeleted", resourceType: ArtboardType, resource: IArtboard, parent: IPage };

//TODO: migrate to union types
var CarbonActions = {
    loaded: (app) => {
        return { type: "Carbon_AppLoaded", app }
    },
    cancel: () => {
        return { type: "Carbon_Cancel" }
    },
    scroll: () => {
        return { type: "Carbon_Scroll" }
    },
    pageChanged: (oldPage, newPage) => {
        return {
            type: "CARBON_PAGE_CHANGED",
            oldPage,
            newPage,
            async: true
        }
    },
    activeArtboardChanged: (oldArtboard, newArtboard) => {
        return {
            type: "CARBON_ARTBOARD_CHANGED",
            oldArtboard,
            newArtboard
        }
    },
    pageAdded: (page) => {
        return {
            type: "CARBON_PAGE_ADDED",
            page
        }
    },
    pageRemoved: (page) => {
        return {
            type: "CARBON_PAGE_REMOVED",
            page
        }
    },
    actionPerformed: (name) => {
        return {
            type: "CARBON_ACTION_PERFORMED",
            name
        }
    },
    elementUsed: (element) => {
        return {
            type: "CARBON_ELEMENT_USED",
            async: true,
            element
        }
    },
    modeChanged: (mode) => {
        return {
            type: "CARBON_MODE_CHANGED",
            mode
        }
    },
    activeLayerChanged: (layer: ILayer) => {
        return {
            type: "CARBON_LAYER_CHANGED",
            layer
        }
    },
    recentColorsChanged: (colors) => {
        return {
            type: "CARBON_RECENTCOLORS_CHANGED",
            colors
        }
    },
    toolChanged: tool => {
        return {
            type: "CARBON_TOOL_CHANGED",
            async: true,
            tool
        }
    }
};

export default CarbonActions;
