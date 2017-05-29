export default {
    refresh: (data) => {
        return {
            type: 'Dashboard_refresh',
            data
        }
    },
    changeFolder: (folderId) => {
        return {
            type: 'Dashboard_changeFolder',
            folderId,
            async: true
        }
    }
}