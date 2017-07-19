import Toolbox from "../Toolbox";
import { handles, dispatch, CarbonStore } from "../../CarbonFlux";
import { app } from "carbon-core";
import { IToolboxStore, StencilInfo } from "../LibraryDefs";
import { DataAction } from "./DataActions";

export type DataStoreState = {
    config: any;
    activeCategory: any;
    lastScrolledCategory: any;
}

export class DataStore extends CarbonStore<DataStoreState> implements IToolboxStore {
    storeType: string = "Data";

    constructor() {
        super();

        let config = app.dataManager.getBuiltInProvider().getConfig();

        this.state = {
            config,
            activeCategory: config.groups[0],
            lastScrolledCategory: null
        }
    }

    createElement(info: StencilInfo){
        let templateId = info.templateId;
        var colon = templateId.indexOf(":");
        var providerId = templateId.substr(0, colon);
        var field = templateId.substr(colon + 1);

        var provider = app.dataManager.getBuiltInProvider();
        return provider.createElement(app, field);
    }

    elementAdded(){
        app.dataManager.generateForSelection();
    }

    onAction(action: DataAction) {
        super.onAction(action);

        switch (action.type) {
            case "Data_ClickedCategory":
                this.onCategoryClicked(action.category);
                return;
            case "Data_ScrolledToCategory":
                this.onScrolledToCategory(action.category);
                return;
        }
    }

    private onCategoryClicked(category) {
        this.setState({ activeCategory: category, lastScrolledCategory: category });
    }
    private onScrolledToCategory(category) {
        this.setState({ activeCategory: category });
    }
}

export default Toolbox.registerStore(new DataStore());