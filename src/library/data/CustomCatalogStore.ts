import { app, IApp } from "carbon-core";
import CarbonActions from '../../CarbonActions';
import { handles, CarbonStore } from "../../CarbonFlux";
import Toolbox from "../Toolbox";
import { IToolboxStore, StencilInfo } from "../LibraryDefs";
import { DataStore } from "./DataStore";

class CustomCatalogStore extends DataStore<any> implements IToolboxStore {
    storeType = "customData";
    _app: IApp;

    createElement(info: StencilInfo) {
        return null;
    }

    @handles(CarbonActions.loaded)
    onLoaded({ app }) {
        this._app = app;
        this._app.enablePropsTracking();

        this._updateState();
    }

    @handles(CarbonActions.propsChanged)
    _onPropsChanged({ element, props }) {
        if (element === this._app && props.dataProviders !== undefined) {
            this._updateState();
        }
    }

    _updateState() {
        var customProviders = app.dataManager.getCustomProviders();
        if (customProviders.length) {
            this.setState({
                config: [{
                    name: "Lists",
                    children: customProviders
                        .filter(x => x.format === "list")
                        .map(x => {
                            var config = x.getConfig();
                            return { name: x.name, examples: config[0].examples, templateType: this.storeType, templateId: x.id + ":default" }
                        })
                }]
            });
        }
    }
}

export default Toolbox.registerStore(new CustomCatalogStore());