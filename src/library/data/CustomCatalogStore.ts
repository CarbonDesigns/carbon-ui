import { app, IApp } from "carbon-core";
import CarbonActions, { CarbonAction } from '../../CarbonActions';
import { handles, CarbonStore } from "../../CarbonFlux";
import Toolbox from "../Toolbox";
import { IToolboxStore, StencilInfo, Stencil } from "../LibraryDefs";
import { DataAction } from "./DataActions";

export interface CustomCatalogStoreState {
    config: any;
    editing: boolean;
}

class CustomCatalogStore extends CarbonStore<CustomCatalogStoreState> implements IToolboxStore {
    storeType = "customData";
    _app: IApp;

    findStencil(info: StencilInfo) {
        for (let i = 0; i < this.state.config.groups.length; ++i) {
            for (let j = 0; j < this.state.config.groups[i].children.length; ++j) {
                let stencil = this.state.config.groups[i].children[j];
                if (stencil.templateId === info.stencilId) {
                    return stencil;
                }
            }
        }
        return null;
    }
    createElement(stencil: Stencil) {
        let templateId = stencil.id;
        var colon = templateId.indexOf(":");
        var providerId = null, field = null;
        if (colon !== -1) {
            providerId = templateId.substr(0, colon);
            field = templateId.substr(colon + 1);
        }
        else {
            field = templateId;
        }

        var provider = providerId ? app.dataManager.getProvider(providerId) : app.dataManager.getBuiltInProvider();
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
            case "Carbon_PropsChanged":
                if (action.element === this._app && action.props.dataProviders !== undefined) {
                    this._updateState();
                }
                return;
        }
    }

    @handles(CarbonActions.loaded)
    onLoaded({ app }) {
        this._app = app;
        this._app.enablePropsTracking();

        this._updateState();
    }

    private onAddNew() {
        this.setState({ editing: true });
    }
    private onSave(name, data) {
        app.dataManager.createCustomProvider(name, data);
        this.setState({ editing: false });
    }
    private onCancel() {
        this.setState({ editing: false });
    };

    _updateState() {
        var customProviders = app.dataManager.getCustomProviders();
        if (customProviders.length) {
            this.setState({
                config: {
                    groups: [{
                        name: "Lists",
                        children: customProviders
                            .filter(x => x.format === "list")
                            .map(x => {
                                var config = x.getConfig();
                                return { name: x.name, examples: config.groups[0].examples, templateType: this.storeType, templateId: x.id + ":default" }
                            })
                    }]
                }
            });
        }
    }
}

export default Toolbox.registerStore(new CustomCatalogStore());