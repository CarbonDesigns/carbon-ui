export type IconsAction =
    { type: "Icons_Refresh" } |
    { type: "Icons_Loaded", iconSets: any[], config: any, async: true } |
    { type: "Icons_Dirty", changedId: string, async: true } |
    { type: "Icons_ClickedCategory", category: any } |
    { type: "Icons_ScrolledToCategory", category: any };

var IconsActions = {
    search:(term) => {
        return {
            type:'ICONS_SEARCH',
            term
        }
    },
    webSearch:(term) => {
        return {
            type:'ICONS_WEB_SEARCH',
            term
        }
    },
    iconFinderNoResults:()=> {
        return {
            type:'ICONS_ICONFINDER_EMPTY'
        }
    },
    iconFinderError:() => {
        return {
            type:'ICONS_ICONFINDER_ERROR'
        }
    }
};

export default IconsActions;
