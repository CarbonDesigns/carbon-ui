import { ILayer } from "carbon-core";

var CarbonActions = {
    loaded:(app)=>{
        return {
            type:"CARBON_LOADED",
            app
        }
    },
    pageChanged:(oldPage, newPage)=>{
        return {
            type:"CARBON_PAGE_CHANGED",
            oldPage,
            newPage,
            async:true
        }
    },
    activeArtboardChanged:(oldArtboard, newArtboard)=>{
        return {
            type:"CARBON_ARTBOARD_CHANGED",
            oldArtboard,
            newArtboard
        }
    },
    pageAdded:(page)=>{
        return {
            type:"CARBON_PAGE_ADDED",
            page
        }
    },
    pageRemoved:(page)=>{
        return {
            type:"CARBON_PAGE_REMOVED",
            page
        }
    },
    actionPerformed:(name)=>{
        return {
            type:"CARBON_ACTION_PERFORMED",
            name
        }
    },
    restoredLocally:()=>{
        return {type:"CARBON_RESTORED_LOCALLY"}
    },
    elementSelected:(selection, prevSelectedElements?)=> {
        return {
            type:"CARBON_ELEMENT_SELECTED",
            selection,
            prevSelectedElements
        }
    },
    elementUsed:(element)=> {
        return {
            type:"CARBON_ELEMENT_USED",
            async:true,
            element
        }
    },
    logEvent:(events)=>{
        return {
            type:"CARBON_LOG_EVENT",
            events
        }
    },
    modeChanged:(mode)=>{
        return {
            type:"CARBON_MODE_CHANGED",
            mode
        }
    },
    activeLayerChanged:(layer: ILayer)=>{
        return {
            type:"CARBON_LAYER_CHANGED",
            layer
        }
    },
    appChanged:(primitives)=>{
        return {
            type:"CARBON_APP_CHANGED",
            primitives
        }
    },
    propsChanged:(element, props, oldProps)=>{
        return {
            type:"CARBON_PROPS_CHANGED",
            element,
            props,
            oldProps
        }
    },
    resourceChanged:(resourceType, element)=>{
        return {
            type:"CARBON_RESOURCE_CHANGED",
            element,
            resourceType
        }
    },
    inlineEditModeChanged: mode => {
        return {
            type:"CARBON_INLINE_MODE",
            mode
        }
    },
    toolChanged: tool => {
        return {
            type:"CARBON_TOOL_CHANGED",
            tool
        }
    }
};

export default CarbonActions;
