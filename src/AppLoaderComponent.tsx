import React from "react";
import PropTypes from "prop-types";
import { Component, dispatchAction } from "./CarbonFlux";

import { app, logger, backend, workspace } from "carbon-core";
import RouteComponent, { IRouteComponentProps } from "./RouteComponent";
import { LoginRequiredError } from "./Constants";
import { CarbonAction } from "./CarbonActions";
import queryString from "query-string";

require("./dialogs/FatalDialog");

export interface IAppLoaderComponentProps extends IRouteComponentProps {
    match: {
        params: {
            companyName: string,
            appId: string,
            code?: string //for mirroring, think how to separate it
        },
    },
    location: {
        pathname: string;
        search: string;
        state: {
            companyId?: string;
            userId?: string; //for mirroring, think how to separate it
        }
    }
}
export default class AppLoaderComponent extends RouteComponent<IAppLoaderComponentProps>{
    canHandleActions() {
        return true;
    }

    onAction(action: CarbonAction) {
        super.onAction(action);

        switch (action.type) {
            case "Carbon_PropsChanged":
                if (action.element === app && action.props.name) {
                    this.updateTitle(app.name());
                }
                return;

            case "Carbon_AppUpdated":
                this.updateTitle(app.name());
                return;
        }
    }

    componentDidMount() {
        if (!app.isLoaded) {
            this.runApp();
        }

        super.componentDidMount();

        workspace.fatalErrorOccurred.bind(this.onFatalError);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        app.unload();
        workspace.fatalErrorOccurred.unbind(this.onFatalError);
    }

    _resolveCompanyId(app) {
        if (app.serverless()) {
            return Promise.resolve({ companyId: "no-server" });
        }
        if (this.props.location.state && this.props.location.state.companyId) {
            return Promise.resolve({ companyId: this.props.location.state.companyId });
        }
        var params;
        if (this.props.match && this.props.match.params) {
            params = this.props.match.params;
        } else {
            params = {};
        }

        if (!params.companyName) {
            return backend.ensureLoggedIn()
                .then(() => { return { companyId: backend.getUserId() } });
        }
        return backend.accountProxy.resolveCompanyId(params.companyName);
    }

    runApp() {
        app.init();

        this._resolveCompanyId(app)
            .then(x => {
                app.companyId(x.companyId);
                var params;
                if (this.props.match && this.props.match.params) {
                    params = this.props.match.params;
                } else {
                    params = {};
                }
                if (params.appId) {
                    app.id = (params.appId);
                }
                var queryParams = queryString.parse(this.props.location.search)
                if (queryParams.r) {
                    app.initializeWithResource(queryParams.r);
                }

                if (!app.id && !app.serverless()) {
                    var token = app.actionManager.subscribe("save", (name, result) => {
                        if (result) {
                            //strip possible resource from query
                            this.replacePath(this.getAppUrlPath(params.companyName), '');
                            token.dispose();
                        }
                    });
                }

                try {
                    app.run().catch(e => {
                        if (e.message === LoginRequiredError) {
                            return;
                        }
                        if (e.message === "appNotFound") {
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

    private onFatalError() {
        dispatchAction({ type: "Dialog_Show", dialogType: "FatalDialog" });
    }

    private getAppUrlPath(companyName: string) {
        if (app.companyId() === backend.getUserId()) {
            return "/app/" + app.id;
        }
        console.assert(!!companyName);
        return "/app/@" + companyName + "/" + app.id;
    }

    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }
}