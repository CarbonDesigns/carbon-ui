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
    duplicateProject: (companyId, projectId) => {
        return {
            type: 'Dashboard_duplicateProject',
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