import {DropzoneType} from "../../workspace/DropzoneRegistry";

var ImagesActions = {
    changeTab:(tabId) => {
        return {
            type:'IMAGES_TAB_CHANGED',
            tabId
        }
    },
    search:(term) => {
        return {
            type:'IMAGES_SEARCH',
            term
        }
    },
    webSearch:(term) => {
        return {
            type:'IMAGES_WEB_SEARCH',
            term
        }
    },
    userImagesLoaded:(images)=> {
        return {
            type:'IMAGES_USER_IMAGES_LOADED',
            images
        }
    },
    userImagesAdded:(images)=> {
        return {
            type:'IMAGES_USER_IMAGES_ADDED',
            images
        }
    },
    unsplashNoResults:()=> {
        return {
            type:'IMAGES_NOTHING_FOUND'
        }
    },
    unsplashError:()=> {
        return {
            type:'IMAGES_CONNECTION_ERROR'
        }
    },

    queueAdded:(file, dropzoneType: DropzoneType)=> {
        return {
            type:'IMAGES_QUEUE_FILE_ADDED',
            file,
            dropzoneType
        }
    },
    queueProgress:(fileName, progress)=> {
        return {
            type:'IMAGES_QUEUE_FILE_PROGRESS',
            fileName,
            progress
        }
    },
    queueRemoved:(fileName, dropzoneType: DropzoneType)=> {
        return {
            type:'IMAGES_QUEUE_FILE_REMOVED',
            fileName,
            dropzoneType
        }
    },
    queueFailed:(fileName)=> {
        return {
            type:'IMAGES_QUEUE_FILE_FAILED',
            fileName
        }
    },
    queueSucceeded:(fileName)=> {
        return {
            type:'IMAGES_QUEUE_FILE_SUCCEEDED',
            fileName
        }
    },
    queueComplete:()=> {
        return {
            type:'IMAGES_QUEUE_COMPLETE'
        }
    },
    queueClear:()=> {
        return {
            type:'IMAGES_QUEUE_CLEAR'
        }
    },
    queueHidden:(fileName)=> {
        return {
            type:'IMAGES_QUEUE_FILE_HIDDEN',
            fileName
        }
    }
};

export default ImagesActions;
