import { app, IApp, util, PatchType } from "carbon-core";
import CarbonActions, { CarbonAction } from '../../CarbonActions';
import { handles, CarbonStore } from "../../CarbonFlux";
import Toolbox from "../Toolbox";
import { IToolboxStore, StencilInfo, Stencil, ToolboxConfig, DataStencil } from "../LibraryDefs";
import { DataAction } from "./DataActions";
import CustomDataProvider from "./CustomDataProvider";

export interface CustomCatalogStoreState {
    config: ToolboxConfig<DataStencil>;
    editing: boolean;
}

class CustomCatalogStore extends CarbonStore<CustomCatalogStoreState> implements IToolboxStore {
    storeType = "customData";

    private providers: CustomDataProvider[] = [];

    findStencil(info: StencilInfo) {
        for (let i = 0; i < this.state.config.groups.length; ++i) {
            for (let j = 0; j < this.state.config.groups[i].items.length; ++j) {
                let stencil = this.state.config.groups[i].items[j];
                if (stencil.id === info.stencilId) {
                    return stencil;
                }
            }
        }
        return null;
    }
    createElement(stencil: Stencil) {
        var colon = stencil.id.indexOf(":");
        var providerId = stencil.id.substr(0, colon);
        var field = stencil.id.substr(colon + 1);

        var provider = this.providers.find(x => x.id === providerId);
        return provider.createElement(app, field);
    }

    elementAdded() {
        app.dataManager.generateForSelection();
    }

    onAction(action: DataAction | CarbonAction) {
        super.onAction(action);

        switch (action.type) {
            case "Data_AddCatalog":
                this.onAddNew();
                return;
            case "Data_SaveCatalog":
                this.onSave(action.name, action.data);
                return;
            case "Data_CancelCatalog":
                this.onCancel();
                return;
            case "Carbon_AppLoaded":
                app.enablePropsTracking();
                return;
            case "Carbon_AppUpdated":
                this.updateState();
                return;
            case "Carbon_PropsChanged":
                if (action.element === app && action.props.dataProviders) {
                    this.updateState();
                }
                return;
        }
    }

    private onAddNew() {
        this.setState({ editing: true });
    }
    private onSave(name, text: string) {
        var data = text.split('\n');
        var provider = new CustomDataProvider(util.createUUID(), name, data, "list");
        app.patchProps(PatchType.Insert, "dataProviders", provider.toJSON());

        this.setState({ editing: false });
    }
    private onCancel() {
        this.setState({ editing: false });
    };

    private updateProviders() {
        this.providers = app.props.dataProviders.map(x => CustomDataProvider.fromJSON(x));
        this.providers.forEach(x => app.dataManager.registerProvider(x.id, x));
    }
    private updateState() {
        this.updateProviders();

        if (this.providers.length) {
            this.setState({
                config: {
                    id: "custom",
                    groups: [{
                        name: "Lists",
                        items: this.providers
                            .filter(x => x.format === "list")
                            .map(x => {
                                var config = x.getConfig();
                                return { title: x.name, examples: config.groups[0].examples, id: x.id + ":default" }
                            })
                    }]
                }
            });
        }
    }
}

export default Toolbox.registerStore(new CustomCatalogStore());