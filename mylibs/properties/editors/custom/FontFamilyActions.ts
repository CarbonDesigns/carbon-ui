export default {
    pageLoaded: (result, page) =>{
        return {
            type: 'FontFamilyList_PageLoaded',
            result,
            page
        }
    }
}