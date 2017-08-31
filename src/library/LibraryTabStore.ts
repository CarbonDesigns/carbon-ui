import {CarbonStore, handles} from "../CarbonFlux";
import { LibraryAction } from "./LibraryActions";

type LibraryTabStoreState = {
    library: string;
    stencils: string;
    icons: string;
    images: string;
    data: string;
}

export class LibraryTabStore extends CarbonStore<LibraryTabStoreState> {
    constructor(){
        super();

        this.state = {
            library: "1",
            stencils: "1",
            icons: "1",
            images: "1",
            data: "1"
        };
    }

    onAction(action: LibraryAction){
        switch (action.type) {
            case "Library_Tab":
                this.setState({[action.area]: action.tabId});
                return;
        }
    }
}

export default new LibraryTabStore();