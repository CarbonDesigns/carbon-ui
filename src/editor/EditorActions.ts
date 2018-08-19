export default {
    run: () => {
        return {
            type: 'Editor_run',
            async: true
        }
    },
    restart: () => {
        return {
            type: 'Editor_restart',
            async: true
        }
    },
    initializeModel: () => {
        return {
            type: 'Editor_initializeModel',
            async: true
        }
    },
    changeState:(stateId) => {
        return {
            type:'PreviewActions_changeState',
            stateId
        }
    },
    changeArtboard: (artboard) => {
        return {
            typed: 'Editor_changeArtboard',
            artboard,
            async:true
        }
    },
    changePage: (page) => {
        return {
            typed: 'Editor_changePage',
            page,
            async:true
        }
    },
    showPageCode:(id)=> {
        return {
            type:'Editor_showPageCode',
            id
        }
    }
}