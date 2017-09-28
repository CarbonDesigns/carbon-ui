export default {
    refresh: (data) => {
        return {
            type: 'Dashboard_refresh',
            data
        }
    },
    deleteProject: (companyId, projectId) => {
        return {
            type: 'Dashboard_deleteProject',
            projectId,
            companyId
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