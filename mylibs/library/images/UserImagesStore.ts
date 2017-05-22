import {app, FileProxy, Image} from "carbon-core";
import {handles, CarbonStore, dispatch} from "../../CarbonFlux";
import ImagesActions from "./ImagesActions";
import Toolbox from "../Toolbox";

class UserImagesStore extends CarbonStore<any>{
    getInitialState(){
        return {images: []};
    }

    getImages(){
        FileProxy.images(app.companyId())
            .then(data => dispatch(ImagesActions.userImagesLoaded(data.images)));
    }

    findById(id){
        return this.state.images.find(img => img.id === id);
    }

    createElement(id){
        var image = this.findById(id);
        var element = new Image();
        element.setProps({
            width  : image.realWidth,
            height : image.realHeight,
            source : Image.createUrlSource(image.url)
        });
        return element;
    }

    @handles(ImagesActions.userImagesLoaded)
    onImagesLoaded({images}){
        this.setState({images: this.toMetadata(images)});
    }

    @handles(ImagesActions.userImagesAdded)
    onImagesAdded({images}){
        var newImages = this.toMetadata(images);
        var oldImages = this.state.images;
        for (var i = oldImages.length - 1; i >= 0; --i){
            var image = oldImages[i];
            if (newImages.some(img => img.name === image.name)){
                oldImages.splice(i, 1);
            }
        }
        this.setState({images: newImages.concat(oldImages)});
    }

    toMetadata(images){
        return images.map(img => {
            var thumbHeight = 60;
            if (img.thumbHeight > 200){
                thumbHeight = 200;
            }
            else if (img.thumbHeight > 100){
                thumbHeight = 100;
            }

            return {
                id          : img.name,
                type        : UserImagesStore.StoreType,
                url         : img.url,
                name        : `${img.name} (${img.width}×${img.height})`,
                spriteUrl   : img.thumbUrl,
                thumbHeight : thumbHeight,
                realWidth   : img.width,
                realHeight  : img.height,
                cx          : {
                    "cover" : img.thumbHeight > thumbHeight
                }
            };
        });
    }

    static StoreType = "userImage";
}

var store = new UserImagesStore();
Toolbox.registerStore(UserImagesStore.StoreType, store);
export default store;
