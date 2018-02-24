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
    showPageCode:(id)=> {
        return {
            type:'Editor_showPageCode',
            id
        }
    }
}