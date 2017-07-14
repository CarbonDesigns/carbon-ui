import {CarbonStore, handles} from "../CarbonFlux";
import LibraryActions from "./LibraryActions";

export class LibraryTabStore extends CarbonStore{
    constructor(){
        super();

        this.state = {
            library: "2",
            stencils: "1",
            icons: "1",
            images: "1",
            data: "1"
        };
    }

    @handles(LibraryActions.changeTab)
    changeTab({area, tabId}){
        this.setState({[area]: tabId});
    }
}

export default new LibraryTabStore();