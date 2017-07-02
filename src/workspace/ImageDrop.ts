import Dropzone from "dropzone";
import { dispatch } from "../CarbonFlux";
import ImagesActions from "../library/images/ImagesActions";
import LibraryActions from "../library/LibraryActions";
import DropzoneRegistry from "./DropzoneRegistry";
import { } from "carbon-model";
import {
    IUIElement, IKeyboardState, createUUID, IDropElementData, RepeatContainer, IImage,
    app, backend, Environment, Selection, SvgParser, Matrix, Image, OriginType, IDisposable
} from "carbon-core";

var hiddenInput = document.createElement("div");

const SvgMimeType = "image/svg+xml";

//an image which is dragged, but never actually dropped
let dragImage = new Image();
let dragPosition;
dragImage.size({ width: Image.NewImageSize, height: Image.NewImageSize });
dragImage.source(Image.EmptySource);

function readFromSvgFile(f: File) {
    var reader = new FileReader();
    var name = f.name;
    var extPos = name.lastIndexOf('.');
    if (extPos !== -1) {
        name = name.substr(0, extPos);
    }

    reader.onload = (d: any) => {
        var text = reader.result;

        SvgParser.loadSVGFromString(text).then((result) => {
            var pos = (dragImage as any).position();
            var artboard = app.activePage.getArtboardAtPoint(dragPosition);
            var m = Matrix.createTranslationMatrix(dragPosition.x, dragPosition.y);
            m = artboard.globalMatrixToLocal(m);
            if (result.performArrange) {
                result.performArrange();
            }
            var box = result.getBoundingBox()
            result.name(name);
            result.applyTranslation({ x: m.tx - box.x, y: m.ty - box.y });
            artboard.add(result);
        });
    }
    reader.readAsText(f);
}
function insertSvg(data: DataTransfer, e: MouseEvent) {
    for (var i = 0; i < data.items.length; ++i) {
        var item = data.items[i];
        if (item.type === SvgMimeType) {
            readFromSvgFile(item.getAsFile());
        }
    }
}

function insertDataUrl(image: IImage, file: File) {
    var reader = new FileReader();
    reader.onload = (e) => {
        var dataUrl = reader.result;
        image.source(Image.createUrlSource(dataUrl));
    }
    reader.readAsDataURL(file);
}

function tryInsertIntoRepeater(e: MouseEvent, images: IImage[]): boolean {
    if (images.length <= 1) {
        return false;
    }

    var keys = Environment.controller.keyboardStateFromEvent(e);
    var eventData = Environment.controller.createEventData(e);
    var parent = Environment.controller.getCurrentDropTarget(eventData, keys);
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
    repeater.addDroppedElements(parent, images, eventData);
    return true;
}

interface IDropHandler {
    imageMap: { [name: string]: IImage };

    resolveDropped: (data: IDropElementData) => void;
    rejectDropped: (reason: Error) => void;

    resolveUploaded: (urls: string[]) => void;
}

var keyboardState: IKeyboardState = { ctrl: false, alt: false, shift: false };
var dropHandler: IDropHandler = {
    imageMap: {},
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
                //bug here if image is double clicked while other images are being downloaded
                if (dropHandler.resolveUploaded) {
                    dropHandler.resolveUploaded(response.images.map(x => x.url));
                    dropHandler.resolveUploaded = null;
                }

                for (var i = 0; i < files.length; i++) {
                    var image = dropHandler.imageMap[files[i].name];
                    image.source(Image.createUrlSource(response.images[i].url));
                }
            },
            queuecomplete: function () {
                dispatch(ImagesActions.queueComplete());
                dropHandler.imageMap = {};
            },
            error: function (file: Dropzone.DropzoneFile) {
                if (file.type !== SvgMimeType) {
                    dispatch(ImagesActions.queueFailed(file.name));
                }
            },

            dragenter: function (e) {
                var dropPromise = new Promise<IDropElementData>((resolve, reject) => {
                    dropHandler.resolveDropped = resolve;
                    dropHandler.rejectDropped = reject;
                });
                Environment.controller.beginDragElement(e, dragImage, dropPromise);
            },
            dragover: function (e: MouseEvent) {
                //window is not focused, so keyboard state is not tracked
                keyboardState = Environment.controller.keyboardStateFromEvent(e, keyboardState);

                var eventData = Environment.controller.createEventData(e);
                Environment.controller.onmousemove(eventData, keyboardState);

                // hack to get coordinates
                dragPosition = (Environment.controller as any)._draggingElement.position();
            },
            dragleave: function (e) {
                if (dropHandler.rejectDropped) {
                    dropHandler.rejectDropped(new Error("cancelled"));
                    dropHandler.rejectDropped = null;
                }
            },
            drop: function (e: DragEvent) {
                app.resetCurrentTool();
                Selection.clearSelection();

                var images = [];
                for (let i = 0; i < e.dataTransfer.files.length; ++i) {
                    let image = new Image();
                    image.size({ width: Image.NewImageSize, height: Image.NewImageSize });
                    image.source(Image.EmptySource);
                    image.resizeOnLoad(OriginType.TopLeft);
                    app.assignNewName(image);

                    dropHandler.imageMap[e.dataTransfer.files[i].name] = image;
                    images.push(image);
                }

                var data: DataTransfer = e.dataTransfer;
                var type = data.items[0].type;
                if (type === SvgMimeType) {
                    insertSvg(data, e);
                    dropHandler.rejectDropped(new Error("cancelled"));
                    dropHandler.resolveDropped = null;
                    return;
                }
                else if (tryInsertIntoRepeater(e, images)) {
                    dropHandler.rejectDropped(new Error("cancelled"));
                    dropHandler.resolveDropped = null;
                    return;
                }
                else if (app.serverless()) {
                    for (let i = 0; i < images.length; i++) {
                        insertDataUrl(images[i], data.items[i].getAsFile());
                    }
                }

                dispatch(LibraryActions.changeTab("library", "3"));
                dispatch(LibraryActions.changeTab("images", "1"));

                keyboardState = Environment.controller.keyboardStateFromEvent(e, keyboardState);
                dropHandler.resolveDropped({ e: e, keys: keyboardState, elements: images });

                dropHandler.resolveDropped = null;
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
}

function onUploadRequested(e) {
    e.done = new Promise(resolve => dropHandler.resolveUploaded = resolve);
    hiddenInput.click();
}