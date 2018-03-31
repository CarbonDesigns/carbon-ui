import * as React from "react";
import {Component} from "../CarbonFlux";

import { app, backend } from "carbon-core";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import { LoginRequiredError } from "../Constants";

interface IQuickAppProps extends IRouteComponentProps{
    params: {
        code: string
    }
}

//this component can be used to render password dialog, some intro page, etc
export default class QuickApp extends RouteComponent<IQuickAppProps> {
    _openApp(code){
        backend.ensureLoggedIn()
            .then(() => backend.shareProxy.use(code))
            .then(x => this._navigate(x))
            .catch(e => {
                if (e.message === LoginRequiredError){
                    return;
                }
                this.goToError("badShareCode");
            });
    }
    _navigate(data){
        var companyName = data.companyName || "anonymous";
        this.goToApp(companyName, data.projectId, data.companyId);
    }

    componentDidMount(){
        super.componentDidMount();
        this._openApp(this.props.params.code);
    }
    render() {
        return <div></div>;
    }
}
