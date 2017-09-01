import { app, Image, backend, UserImage } from "carbon-core";
import { handles, CarbonStore, dispatch } from "../../CarbonFlux";
import ImagesActions from "./ImagesActions";
import Toolbox from "../Toolbox";
import { IToolboxStore, StencilInfo, Stencil } from "../LibraryDefs";

export interface UserImageStencil extends Stencil {
    url: string;
    thumbUrl: string;
    thumbHeight: number;
    cover: boolean;
}

export type UserImagesStoreState = {
    images: UserImageStencil[];
    error: boolean;
}

class UserImagesStore extends CarbonStore<UserImagesStoreState> implements IToolboxStore {
    storeType = "userImage";

    constructor() {
        super();

        this.state = {
            images: [],
            error: false
        };
    }

    getImages() {
        backend.fileProxy.images(app.companyId())
            .then(data => dispatch(ImagesActions.userImagesLoaded(data.images)))
            .catch(() => dispatch(ImagesActions.userImagesError()));
    }

    findStencil(info: StencilInfo) {
        return this.state.images.find(img => img.id === info.stencilId);
    }

    createElement(stencil) {
        var element = new Image();
        element.setProps({
            width: stencil.realWidth,
            height: stencil.realHeight,
            source: Image.createUrlSource(stencil.url)
        });
        return element;
    }
    elementAdded() {
    }

    @handles(ImagesActions.userImagesLoaded)
    onImagesLoaded({ images }) {
        this.setState({ images: this.toMetadata(images), error: false });
    }

    @handles(ImagesActions.userImagesError)
    onError({ images }) {
        this.setState({ error: true });
    }

    @handles(ImagesActions.userImagesAdded)
    onImagesAdded({ images }) {
        var newImages = this.toMetadata(images);
        var oldImages = this.state.images;
        for (var i = oldImages.length - 1; i >= 0; --i) {
            var image = oldImages[i];
            if (newImages.some(img => img.title === image.title)) {
                oldImages.splice(i, 1);
            }
        }
        this.setState({ images: newImages.concat(oldImages) });
    }

    toMetadata(images: UserImage[]): UserImageStencil[] {
        return images.map(img => this.createStencil(img));
    }

    createStencil(img: UserImage) {
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
            cover: img.thumbHeight > thumbHeight
        };
    }
}

export default Toolbox.registerStore(new UserImagesStore());
