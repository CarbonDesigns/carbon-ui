var StencilsActions =  {
    changePage:(page) =>{
        return {
            type:'STENCILS_CHANGE_PROJECT',
            page
        }
    },
    changeCategory:(category) =>{
        return {
            type:'STENCILS_CHANGE_CATEGORY',
            category
        }
    },
    scrollCategory:(category) =>{
        return {
            type:'STENCILS_SCROLL_CATEGORY',
            category
        }
    },
    search:(q) =>{
        return {
            type:'STENCILS_SEARCH',
            q
        }
    },
    clicked:(e, templateType, templateId, sourceId?) =>{
        return {
            type:'STENCILS_CLICKED',
            e, templateType, templateId, sourceId
        }
    }
}

export default StencilsActions;
