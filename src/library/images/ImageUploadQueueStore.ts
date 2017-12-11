import {app} from "carbon-core";
import {handles, CarbonStore, dispatch} from "../../CarbonFlux";
import ImagesActions from "./ImagesActions";
import Immutable from "immutable";
import { DropzoneType } from "../../workspace/DropzoneRegistry";

export const enum UploadStatus {
    added,
    uploading,
    uploaded,
    hidden,
    failed,
    removed
};

export interface IQueueFile{
    status: UploadStatus,
    name: string,
    fileSize: number,
    added_at: number,
    closed_at: number | null,
    removed_at: number | null,
    progress: number,
    dropzoneType: DropzoneType
}

export let QueueFile = Immutable.Record({
    status: UploadStatus.added,
    name: "",
    added_at: 0,
    closed_at: 0,
    progress: 0,
    removed_at: 0,
    fileSize: 0,
    dropzoneType: "workspace"
});

interface IImageUploadQueueStoreState{
    queue: Immutable.OrderedMap<string, any/*Immutable.Record<IQueueFile>*/>
}
class ImageUploadQueueStore extends CarbonStore<IImageUploadQueueStoreState>{
    _clearTimeout: number;

    getInitialState(){
        return {
            queue: Immutable.OrderedMap({})
        };
    }

    getQueue(){
        return this.state.queue;
    }

    addFile(file: Dropzone.DropzoneFile, dropzoneType: DropzoneType){
        return new QueueFile({
            status     : UploadStatus.added,
            name       : file.name,
            fileSize   : file.size,
            added_at   : Date.now(),
            closed_at  : null,
            removed_at : null,
            progress   : 0,
            dropzoneType: dropzoneType
        });
    }

    @handles(ImagesActions.queueAdded)
    onQueueAdded({file, dropzoneType}){
        if (this._clearTimeout){
            clearTimeout(this._clearTimeout);
        }
        this.setState({queue: this.state.queue.set(file.name, this.addFile(file, dropzoneType)) });
    }

    @handles(ImagesActions.queueProgress)
    onQueueProgress({fileName, progress}){
        this.setState({
            queue: this.state.queue.update(fileName, function(file){
                return file.set('progress', progress)
                           .set('status', UploadStatus.uploading)
            })
        });
    }

    @handles(ImagesActions.queueSucceeded)
    onQueueSucceeded({fileName}){
        this.setState({
            queue: this.state.queue.update(fileName, function(file){
                return file.set('progress', 100)
                           .set('status', UploadStatus.uploaded)
                           .set('closed_at', Date.now())
                })
        });
    }
    @handles(ImagesActions.queueComplete)
    onQueueComplete(){
        if (this.state.queue.every(x => x.get("status") === UploadStatus.uploaded)){
            this._clearTimeout = setTimeout(() => dispatch(ImagesActions.queueClear()), 5000);
        }
    }
    @handles(ImagesActions.queueClear)
    onQueueClear(){
        this.setState({queue: this.state.queue.clear()});
    }

    @handles(ImagesActions.queueRemoved)
    onQueueRemoved({fileName}){
        if (this._clearTimeout){
            clearTimeout(this._clearTimeout);
        }
        this.setState({ queue: this.state.queue.update(fileName, function(file){
            //removed might get called when the queue is already cleared
            return file && file.set('status', UploadStatus.removed)
                       .set('removed_at', Date.now())
        })});
    }

    @handles(ImagesActions.queueFailed)
    onQueueFailed({fileName}){
        if (this._clearTimeout){
            clearTimeout(this._clearTimeout);
        }
        this.setState({ queue: this.state.queue.update(fileName, function(file){
            return file.set('status', UploadStatus.failed)
                       .set('closed_at', Date.now())
        })});
    }

    @handles(ImagesActions.queueHidden)
    onQueueHidden({fileName}){
        this.setState({ queue: this.state.queue.update(fileName, function(file){
            return file.set('status', UploadStatus.hidden)
                       .set('removed_at', Date.now())
        })});
    }
}

export default new ImageUploadQueueStore();