import Toolbox from "../Toolbox";
import LibraryStore from "../LibraryStore";
import { handles, dispatch } from "../../CarbonFlux";
import { app } from "carbon-core";

export default class DataStore<T> extends LibraryStore<T> {
    createElement(id){
        var colon = id.indexOf(":");
        var providerId = null, field = null;
        if (colon !== -1){
            providerId = id.substr(0, colon);
            field = id.substr(colon + 1);
        }
        else{
            field = id;
        }

        var provider = providerId ? app.dataManager.getProvider(providerId) : app.dataManager.getBuiltInProvider();
        return provider.createElement(app, field);
    }

    elementAdded(){
        app.dataManager.generateForSelection();
    }

    static StoreType = "data";
}

var store = new DataStore();
Toolbox.registerStore(DataStore.StoreType, store);