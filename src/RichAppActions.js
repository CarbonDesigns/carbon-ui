var RichAppActions = {
    progressHideDelayed: ()=> {
        return {
            type: 'RichAppActions_progressHideDelayed'
        }
    },
    showMainMenu: ()=> {
        return {
            type: 'RichAppActions_showMainMenu'
        }
    },
    canUndoRedo: (canUndo, canRedo)=> {
        return {
            type: 'RichAppActions_canUndoRedo',
            async: true,
            canUndo,
            canRedo
        }
    },
    switchPreviewMode: ()=> {
        return {
            type: 'RichAppActions_switchPreviewMode'
        }
    },
    selectionChanged: (selection)=> {
        return {
            type: 'RichAppActions_selectionChanged',
            selection
        }
    },
    hideMainMenu: ()=> {
        return {
            type: 'RichAppActions_hideMainMenu'
        }
    },
    switchFrameState: (frameVisible) => {
        return {
            type: 'RichAppActions_switchFrameState',
            frameVisible
        }
    },
    changeTool: (action)=> {
        return {
            type: 'RichAppActions_changeTool',
            async: true,
            action
        }
    },
    changeCurrentPageScale: (scale)=> {
        return {
            type: 'RichAppActions_changeCurrentPageScale',
            scale,
            async:true
        }
    },
    fullscreenEvent: (fullscreen) => {
        return {
            type: 'RichAppActions_fullscreenEvent',
            fullscreen
        }
    }
};

export default RichAppActions;
