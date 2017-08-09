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
    }
};

export default RichAppActions;
