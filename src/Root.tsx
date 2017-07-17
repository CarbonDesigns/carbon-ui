import React from "react";
import Router from "react-router/lib/Router";
import browserHistory from "react-router/lib/browserHistory";
import routes from "./Routes";
import FlyoutContainer from "./FlyoutContainer";
import DialogContainer from "./dialogs/DialogContainer";
import {Component} from "./CarbonFlux";
import { backend } from "carbon-api";

export default class Root extends Component<any, any>{
    routes: any;

    refs: {
        flyout: FlyoutContainer
    }

    onMouseDown = e => {
        this.refs.flyout.onAppMouseDown(e);
    };

    componentWillMount() {
        backend.loginNeeded.bind(isGuest => {
            browserHistory.push("/login");
        });

        //to avoid warnings about changing routes on hot reload
        this.routes = this.routes || routes;
    }

    render(){
        return <div onMouseDown={this.onMouseDown} className="root">
             <FlyoutContainer ref="flyout"/>
             <div className="content">
                <Router history={browserHistory} routes={this.routes} />
            </div>
            <DialogContainer/>
        </div>;
    }
}
