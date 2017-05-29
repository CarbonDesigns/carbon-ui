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
            term,
            async:true
        }
    },
    iconFinderNoResults:()=> {
        return {
            type:'ICONS_ICONFINDER_EMPTY'
        }
    },
    iconFinderError:(message) => {
        return {
            type:'ICONS_ICONFINDER_ERROR',
            message
        }
    }
};

export default IconsActions;
