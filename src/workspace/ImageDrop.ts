import Dropzone from "dropzone";
import { dispatch, dispatchAction } from "../CarbonFlux";
import ImagesActions from "../library/images/ImagesActions";
import DropzoneRegistry from "./DropzoneRegistry";
import { IUIElement, createUUID, RepeatContainer, IImage, app, backend, Environment, Selection, SvgParser, Matrix, Image, Origin, IDisposable, IContainer, model, ChangeMode, workspace, IFileElement, FileType } from "carbon-core";

const hiddenInput = document.createElement("div");
const SvgMimeType = "image/svg+xml";

interface IDropHandler {
    files: IFileElement[];

    resolveDropped: () => void;
    rejectDropped: (reason: Error) => void;

    resolveUploaded: (urls: string[]) => void;
}

const dropHandler: IDropHandler = {
    files: [],
    resolveDropped: null,
    rejectDropped: null,
    resolveUploaded: null
};

export default class ImageDrop {
    private dropzone: Dropzone;
    private backendToken: IDisposable;

    setup(viewNode) {
        var handlers = {
            addedfile: function (file: Dropzone.DropzoneFile) {
                if (file.type !== SvgMimeType) {
                    dispatch(ImagesActions.queueAdded(file, "workspace"));
                }
            },
            uploadprogress: function (file: Dropzone.DropzoneFile, progress) {
                if (progress) {
                    dispatch(ImagesActions.queueProgress(file.name, progress));
                }
            },
            removedfile: function (file: Dropzone.DropzoneFile) {
                dispatch(ImagesActions.queueRemoved(file.name, "workspace"));
            },
            success: function (file: Dropzone.DropzoneFile, response) {
                dispatch(ImagesActions.queueSucceeded(file.name));
                dispatch(ImagesActions.userImagesAdded(response.images));
            },
            successmultiple: function (files: Dropzone.DropzoneFile[], response) {
                if (dropHandler.resolveUploaded) {
                    dropHandler.resolveUploaded(response.images.map(x => x.url));
                    dropHandler.resolveUploaded = null;
                }

                for (var i = 0; i < files.length; i++) {
                    let fileElement = dropHandler.files.find(x => x.name === files[i].name);
                    fileElement.setExternalUrl(response.images[i].url);
                }
            },
            queuecomplete: function () {
                dispatch(ImagesActions.queueComplete());
                dropHandler.files.length = 0;
            },
            error: function (file: Dropzone.DropzoneFile) {
                if (file.type !== SvgMimeType) {
                    dispatch(ImagesActions.queueFailed(file.name));
                }
            },

            dragenter: function (e: DragEvent) {
                dropHandler.files.length = 0;

                for (let i = 0; i < e.dataTransfer.items.length; ++i){
                    let item = e.dataTransfer.items[i];
                    let file = model.createFile({ type: item.type as FileType });
                    dropHandler.files.push(file);
                }

                let dropPromise = new Promise<void>((resolve, reject) => {
                    dropHandler.resolveDropped = resolve;
                    dropHandler.rejectDropped = reject;
                });
                Environment.controller.beginDragElements(e, dropHandler.files, dropPromise);
            },
            dragover: function (e: MouseEvent) {
                var eventData = Environment.controller.createEventData(e);
                Environment.controller.onmousemove(eventData);
            },
            dragleave: function (e) {
                if (dropHandler.rejectDropped) {
                    dropHandler.rejectDropped(new Error("cancelled"));
                    dropHandler.rejectDropped = null;
                }
            },
            drop: function (e: DragEvent) {
                Environment.controller.resetCurrentTool();

                const maxItemsForIncrementalUpdate = 5;
                let data = e.dataTransfer;
                let elements = [];
                let promises = [];

                if (data.items.length > maxItemsForIncrementalUpdate) {
                    app.beginUpdate();
                }

                for (let i = 0; i < data.files.length; ++i) {
                    let item = data.items[i];
                    let file = dropHandler.files[i];
                    let task = file.drop(item.getAsFile());
                    promises.push(task);
                }

                // if (elements.length && tryInsertIntoRepeater(e, data.files, elements)) {
                    // if (elements.length === 0) {
                    //     dropHandler.rejectDropped(new Error("cancelled"));
                    //     dropHandler.resolveDropped = null;
                    //     return;
                    // }
                //     elements.length = 0;
                // }

                if (dropHandler.files.some(x => x.isImage())) {
                    dispatchAction({ type: "Library_Tab", area: "library", tabId: "3" });
                    dispatchAction({ type: "Library_Tab", area: "images", tabId: "1" });
                }

                dropHandler.rejectDropped(new Error("cancelled"));
                dropHandler.resolveDropped = null;

                Promise.all(promises)
                    .finally(() => {
                        if (data.items.length > maxItemsForIncrementalUpdate) {
                            app.endUpdate();
                        }
                    });
            }
        };

        var config = {
            url: backend.servicesEndpoint + "/api/file/upload",
            headers: backend.getAuthorizationHeaders(),
            uploadMultiple: true,
            params: {
                companyId: backend.getUserId()
            },
            acceptedFiles: "image/*",

            createImageThumbnails: false,
            addRemoveLinks: false,
            previewTemplate: "<div></div>",
            clickable: [hiddenInput],

            accept: function (file: Dropzone.DropzoneFile, done: () => void) {
                if (file.type !== SvgMimeType) {
                    done();
                }
            },

            init: function () {
                for (var eventName in handlers) {
                    this.on(eventName, handlers[eventName]);
                }
            }
        };

        Dropzone.autoDiscover = false;
        this.dropzone = new Dropzone(viewNode, config);
        DropzoneRegistry.register("workspace", this.dropzone);

        Image.uploadRequested.bind(this.dropzone, onUploadRequested);

        this.backendToken = backend.accessTokenChanged.bind(() =>
            this.dropzone['options'].headers = backend.getAuthorizationHeaders());
    }

    active() {
        return !!this.dropzone;
    }

    destroy() {
        if (this.dropzone) {
            this.dropzone.destroy();
            delete this.dropzone;

            Image.uploadRequested.unbind(this.dropzone, onUploadRequested);

            if (this.backendToken) {
                this.backendToken.dispose();
                this.backendToken = null;
            }
        }
    }

    private static tryInsertIntoRepeater(e: MouseEvent, files: FileList, images: IImage[]): boolean {
        if (images.length <= 1) {
            return false;
        }

        var eventData = Environment.controller.createEventData(e);
        var parent = Environment.controller.getCurrentDropTarget();
        var repeater = RepeatContainer.tryFindRepeaterParent(parent);
        if (!repeater) {
            return false;
        }

        //let only one image to resize, others will follow
        for (var i = 1; i < images.length; ++i) {
            images[i].resizeOnLoad(null);
        }

        //image is dragged by its center, think how to do this better
        eventData.x -= Image.NewImageSize / 2;
        eventData.y -= Image.NewImageSize / 2;
        let droppedElements = repeater.addDroppedElements(parent as IContainer, images, eventData);

        return true;
    }

}

function onUploadRequested(e) {
    e.done = new Promise(resolve => dropHandler.resolveUploaded = resolve);
    hiddenInput.click();
}