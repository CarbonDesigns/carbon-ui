export type IconsAction =
    { type: "Icons_Refresh" } |
    { type: "Icons_Update", async: true } |
    { type: "Icons_Dirty", changedId: string, async: true } |
    { type: "Icons_Search", q: string } |
    { type: "Icons_WebSearch", q: string } |
    { type: "Icons_WebSearchResult", result: any[], async:true } |
    { type: "Icons_ClickedCategory", category: any } |
    { type: "Icons_ScrolledToCategory", category: any } |
    { type: "IconsSearch_ClickedCategory", category: any } |
    { type: "IconsSearch_ScrolledToCategory", category: any };

var IconsActions = {
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
