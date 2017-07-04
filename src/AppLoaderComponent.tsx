import React from "react";
import { Component, dispatchAction } from "./CarbonFlux";

import { app, logger, backend } from "carbon-core";
import RouteComponent, { IRouteComponentProps } from "./RouteComponent";
import { LoginRequiredError } from "./Constants";

export interface IAppLoaderComponentProps extends IRouteComponentProps{
    params: {
        companyName: string,
        appId: string,
        code?: string //for mirroring, think how to separate it
    }
}
export default class AppLoaderComponent extends RouteComponent<IAppLoaderComponentProps>{
    componentDidMount() {
        super.componentDidMount();
        if (!app.isLoaded) {
            this.runApp(this.props.params, this.props.location);
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        app.unload();
    }

    _resolveCompanyId(app, location, companyName) {
        if (app.serverless()) {
            return Promise.resolve({ companyId: "no-server" });
        }
        if (location.state && location.state.companyId) {
            return Promise.resolve({ companyId: location.state.companyId });
        }
        if (!companyName) {
            return backend.ensureLoggedIn()
                .then(() => { return { companyId: backend.getUserId() } });
        }
        return backend.accountProxy.resolveCompanyId(companyName);
    }

    runApp(data: {companyName: string, appId: string}, location) {
        app.init();

        this._resolveCompanyId(app, location, data.companyName)
            .then(x => {
                app.companyId(x.companyId);
                app.id(data.appId);

                if (!app.id() && !app.serverless()) {
                    var token = app.actionManager.subscribe("save", (name, result) => {
                        if (result) {
                            var newUrl = backend.addUrlPath(location.pathname, app.id());
                            this.replacePath(newUrl);
                            token.dispose();
                        }
                    });
                }

                try {
                    app.run().catch(e => {
                        if (e.message === LoginRequiredError){
                            return;
                        }
                        if (e.message === "appNotFound"){
                            this.goToError("appNotFound");
                            return;
                        }

                        logger.fatal("App failed to run", e);
                        this.goToError("appRunError");
                    });
                }
                catch (e) {
                    logger.fatal("App failed to run", e);
                    this.goToError("appRunError");
                }
            })
            .catch(() => this.goToError("unknownCompany"));
    }

    static contextTypes = {
        router: React.PropTypes.any,
        intl: React.PropTypes.object
    }
}