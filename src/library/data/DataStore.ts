import Toolbox from "../Toolbox";
import LibraryStore from "../LibraryStore";
import { handles, dispatch } from "../../CarbonFlux";
import { app } from "carbon-core";
import { StencilInfo } from "../stencils/StencilsActions";

export default class DataStore<T> extends LibraryStore<T> {
    createElement(info: StencilInfo){
        let templateId = info.templateId;
        var colon = templateId.indexOf(":");
        var providerId = null, field = null;
        if (colon !== -1){
            providerId = templateId.substr(0, colon);
            field = templateId.substr(colon + 1);
        }
        else{
            field = templateId;
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