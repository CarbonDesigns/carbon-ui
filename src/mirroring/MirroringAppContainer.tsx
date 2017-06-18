import React from "react";

import MirroringWorkspace from './MirroringWorkspace';
import AppLoaderComponent from '../AppLoaderComponent';
import { app, backend, params } from "carbon-core";
import { LoginRequiredError } from "../Constants";

//import "./_preview.less";

export default class MirroringAppContainer extends AppLoaderComponent {
    constructor(props) {
        super(props);

        params.mirroring = true;
    }
    componentDidMount(){
        if (this.props.params.code) {
            backend.ensureLoggedIn()
                .then(() => backend.shareProxy.use(this.props.params.code))
                .then(x => this._navigate(x))
                .catch((e) => {
                    if (e.message !== LoginRequiredError){
                        this.goToError("badShareCode");
                        return;
                    }
                    this.goToError("appRunError");
                });
        }
        else {
            super.componentDidMount.apply(this, arguments);
        }
    }

    componentDidUpdate(){
        super.componentDidUpdate.apply(this, arguments);
        if (!app.isLoaded){
            this.runApp(this.props.params, this.props.location);
        }
    }

    _navigate(data){
        var companyName = data.companyName || "anonymous";
        this.context.router.replace({
            pathname: "/m/app/@" + companyName + "/" + data.projectId,
            query: this.props.location.query,
            state: {companyId: data.companyId, userId: data.userId}
        });
    }

    render() {
        if(this.props.params.code) {
            return <div></div>
        }
        return <MirroringWorkspace userId={this.props.location.state.userId}/>;
    }
}
