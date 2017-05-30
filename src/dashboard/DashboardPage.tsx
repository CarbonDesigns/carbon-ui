import React from "react";
import {dispatch, Component} from "../CarbonFlux";

import {backend, DashboardProxy} from "carbon-api";
import FolderTree from "./FolderTree";
import ProjectList from "./ProjectList";
import DashboardActions from "./DashboardActions";

export default class DashboardPage extends Component<any, any>{
    render(){
        return <div className="dashboard">
            <FolderTree/>
            <ProjectList/>
        </div>;
    }
    _resolveCompanyId(){
        if (this.props.location.state && this.props.location.state.companyId){
            return Promise.resolve({companyId: this.props.location.state.companyId});
        }
        if (this.props.params.companyName && this.props.params.companyName !== "guest"){
            return backend.accountProxy.resolveCompanyId(this.props.params.companyName);
        }
        return Promise.resolve({companyId: backend.getUserId()});
    }
    componentDidMount(){
        super.componentDidMount();
        this._resolveCompanyId()
            .then(data => DashboardProxy.dashboard(data.companyId))
            .then(data => dispatch(DashboardActions.refresh(data)));
    }
}