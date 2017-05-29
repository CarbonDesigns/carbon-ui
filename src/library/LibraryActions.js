export default {
    changeTab: (area, tabId) => {
        return {
            type:'LIBRARY_TAB',
            area,
            tabId
        }
    }
}