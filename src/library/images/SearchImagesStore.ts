
import { handles, CarbonStore, dispatchAction } from "../../CarbonFlux";
import ToolboxConfiguration from "../ToolboxConfiguration";
import { CarbonAction } from "../../CarbonActions";
import { app, Symbol, IPage, ArtboardType, IArtboard, Artboard, backend } from "carbon-core";
import { ToolboxConfig, SpriteStencil, ToolboxGroup, IToolboxStore, StencilInfo, SpriteStencilInfo } from "../LibraryDefs";
import Toolbox from "../Toolbox";
import userImagesStore, { UserImageStencil } from "./UserImagesStore";
import { ImagesAction } from "./ImagesActions";

export type SearchImagesStoreState = {
    images: UserImageStencil[];
    query: string;
    error: boolean;
}

class SearchImagesStore extends CarbonStore<SearchImagesStoreState> implements IToolboxStore {
    storeType = "searchImages";

    constructor() {
        super();
        this.state = {
            images: [],
            error: false,
            query: ""
        };
    }

    findStencil(info: StencilInfo) {
        return this.state.images.find(img => img.id === info.stencilId);
    }

    createElement(stencil: UserImageStencil) {
        return userImagesStore.createElement(stencil);
    }

    elementAdded() { }

    onAction(action: ImagesAction) {
        switch (action.type) {
            case "Images_Search":
                this.search(action.q);
                return;
            case "Images_Error":
                this.setState({
                    error: true
                });
                return;
            case "SearchImages_Loaded":
                this.setState({
                    images: userImagesStore.toMetadata(action.images),
                    error: false
                });
                return;
        }
    }

    private search(q) {
        let r = new RegExp(q, "gi");

        backend.fileProxy.images(app.companyId())
            .then(data => {
                let result = [];
                for (let i = 0; i < data.images.length; ++i) {
                    let image = data.images[i];
                    r.lastIndex = 0;
                    if (r.test(image.name)) {
                        result.push(image);
                    }
                }

                dispatchAction({ type: "SearchImages_Loaded", images: result });
            })
            .catch(() => dispatchAction({ type: "Images_Error" }));

        this.setState({ query: q });
    }
}

export default Toolbox.registerStore(new SearchImagesStore());