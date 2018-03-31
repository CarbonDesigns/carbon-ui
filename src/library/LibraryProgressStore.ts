import ProgressStore from "../shared/ProgressStore";
import {handles} from "../CarbonFlux";

export default class LibraryProgressStore extends ProgressStore{
    //@handles(BackendActions.requestStarted)
    requestStarted({url, data, options}){
        // if (options.category === "library"){
        //     this.show();
        // }
    }

    //@handles(BackendActions.requestEnded)
    requestEnded({url, data, options}){
        // if (options.category === "library"){
        //     this.hideAfterDelay();
        // }
    }
}