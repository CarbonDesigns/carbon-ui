import { app, Image, backend } from "carbon-core";
import { handles, CarbonStore, dispatch } from "../../CarbonFlux";
import ImagesActions from "./ImagesActions";
import Toolbox from "../Toolbox";
import { IToolboxStore, StencilInfo } from "../LibraryDefs";

class UserImagesStore extends CarbonStore<any> implements IToolboxStore {
    storeType = "userImage";

    getInitialState() {
        return { images: [] };
    }

    getImages() {
        backend.fileProxy.images(app.companyId())
            .then(data => dispatch(ImagesActions.userImagesLoaded(data.images)));
    }

    findById(id) {
        return this.state.images.find(img => img.id === id);
    }

    createElement(info: StencilInfo) {
        var image = this.findById(info.templateId);
        var element = new Image();
        element.setProps({
            width: image.realWidth,
            height: image.realHeight,
            source: Image.createUrlSource(image.url)
        });
        return element;
    }
    elementAdded() {
    }

    @handles(ImagesActions.userImagesLoaded)
    onImagesLoaded({ images }) {
        this.setState({ images: this.toMetadata(images) });
    }

    @handles(ImagesActions.userImagesAdded)
    onImagesAdded({ images }) {
        var newImages = this.toMetadata(images);
        var oldImages = this.state.images;
        for (var i = oldImages.length - 1; i >= 0; --i) {
            var image = oldImages[i];
            if (newImages.some(img => img.name === image.name)) {
                oldImages.splice(i, 1);
            }
        }
        this.setState({ images: newImages.concat(oldImages) });
    }

    toMetadata(images) {
        return images.map(img => {
            var thumbHeight = 60;
            if (img.thumbHeight > 200) {
                thumbHeight = 200;
            }
            else if (img.thumbHeight > 100) {
                thumbHeight = 100;
            }

            return {
                id: img.name,
                type: this.storeType,
                url: img.url,
                title: `${img.name} (${img.width}×${img.height})`,
                thumbUrl: img.thumbUrl,
                thumbHeight: thumbHeight,
                realWidth: img.width,
                realHeight: img.height,
                cx: {
                    "cover": img.thumbHeight > thumbHeight
                }
            };
        });
    }
}

export default Toolbox.registerStore(new UserImagesStore());
