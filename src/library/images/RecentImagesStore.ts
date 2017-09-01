import { app, Image } from "carbon-core";
import { CarbonStore } from "../../CarbonFlux";
import { ToolboxConfig, SpriteStencil, StencilInfo, SpriteStencilInfo, Stencil } from "../LibraryDefs";
import unsplashStore, { UnsplashStencil } from "./UnsplashStore";
import userImagesStore, { UserImageStencil } from "./UserImagesStore";
import Toolbox from "../Toolbox";
import { StencilsAction } from "../StencilsActions";

export type ImageType =
    { type: "unsplash", stencil: UnsplashStencil } |
    { type: "user", stencil: UserImageStencil };

export interface RecentImage extends Stencil {
    imageType: ImageType;
}

export type RecentImagesStoreState = {
    images: RecentImage[];
    configVersion: number;
}

class RecentImagesStore extends CarbonStore<RecentImagesStoreState> {
    storeType = "recentImages";

    constructor() {
        super();
        this.state = {
            images: [],
            configVersion: 0
        };
    }

    findStencil(info: StencilInfo) {
        return this.state.images.find(x => x.id === info.stencilId);
    }

    createElement(stencil: RecentImage) {
        if (stencil.imageType.type === "unsplash") {
            return unsplashStore.createElement(stencil.imageType.stencil);
        }

        return userImagesStore.createElement(stencil.imageType.stencil);
    }

    elementAdded() {
    }

    onAction(action: StencilsAction) {
        switch (action.type) {
            case "Stencils_Added":
                if (action.stencilType === unsplashStore.storeType || action.stencilType === userImagesStore.storeType) {
                    let index = this.state.images.findIndex(x => x.id === action.stencil.id);

                    if (index !== -1) {
                        this.state.images.splice(index, 1);
                    }

                    if (action.stencilType === unsplashStore.storeType) {
                        this.state.images.push({
                            id: action.stencil.id,
                            title: action.stencil.title,
                            imageType: {
                                type: "unsplash",
                                stencil: action.stencil as UnsplashStencil
                            }
                        });
                    }
                    else {
                        this.state.images.push({
                            id: action.stencil.id,
                            title: action.stencil.title,
                            imageType: {
                                type: "user",
                                stencil: action.stencil as UserImageStencil
                            }
                        });
                    }

                    this.setState({
                        configVersion: ++this.state.configVersion
                    });
                }
                return;
        }
    }
}

export default Toolbox.registerStore(new RecentImagesStore());