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
    changeArtboard: (artboard) => {
        return {
            typed: 'Editor_changeArtboard',
            artboard,
            async:true
        }
    }
}