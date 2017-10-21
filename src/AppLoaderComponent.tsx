import React from "react";
import PropTypes from "prop-types";
import { Component, dispatchAction } from "./CarbonFlux";

import { app, logger, backend, workspace } from "carbon-core";
import RouteComponent, { IRouteComponentProps } from "./RouteComponent";
import { LoginRequiredError } from "./Constants";
import { CarbonAction } from "./CarbonActions";

require("./dialogs/FatalDialog");

export interface IAppLoaderComponentProps extends IRouteComponentProps{
    params: {
        companyName: string,
        appId: string,
        code?: string //for mirroring, think how to separate it
    },
    location: {
        pathname: string;
        query: {
            r: string;
        },
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
        super.componentDidMount();

        workspace.fatalErrorOccurred.bind(this.onFatalError);

        if (!app.isLoaded) {
            this.runApp();
        }
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
        if (!this.props.params.companyName) {
            return backend.ensureLoggedIn()
                .then(() => { return { companyId: backend.getUserId() } });
        }
        return backend.accountProxy.resolveCompanyId(this.props.params.companyName);
    }

    runApp() {
        app.init();

        this._resolveCompanyId(app)
            .then(x => {
                app.companyId(x.companyId);
                if (this.props.params.appId) {
                    app.id(this.props.params.appId);
                }
                if (this.props.location.query.r) {
                    app.initializeWithResource(this.props.location.query.r);
                }

                if (!app.id() && !app.serverless()) {
                    var token = app.actionManager.subscribe("save", (name, result) => {
                        if (result) {
                            //strip possible resource from query
                            this.replacePath(this.getAppUrlPath(this.props.params.companyName), {});
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

    private onFatalError() {
        dispatchAction({ type: "Dialog_Show", dialogType: "FatalDialog" });
    }

    private getAppUrlPath(companyName: string) {
        if (app.companyId() === backend.getUserId()) {
            return "/app/" + app.id();
        }
        console.assert(!!companyName);
        return "/app/@" + companyName + "/" + app.id();
    }

    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }
}