import React from "react";
import PropTypes from "prop-types";
import {dispatch, Component} from "../CarbonFlux";

import {backend, DashboardProxy} from "carbon-api";
import FolderTree from "./FolderTree";
import ProjectList from "./ProjectList";
import DashboardActions from "./DashboardActions";
import TopMenu from "../shared/TopMenu";

export default class DashboardPage extends Component<any, any>{
    static childContextTypes  = {
        companyId: PropTypes.string,
        intl: PropTypes.object
    }

    constructor(props:any, context?:any) {
        super(props, context);
        this.state = {};
    }

    getChildContext() {
        return Object.assign({}, this.context, {companyId: this.state.companyId});
    }

    render(){
        return <div className="dashboard-page light-page">
            <TopMenu location={this.props.location} dark={true} />
            <section className="sidemenu-container">
                <FolderTree/>
                <ProjectList/>
            </section>
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
            .then(data => {
                this.setState({companyId:data.companyId});
                return DashboardProxy.dashboard(data.companyId)
            })
            .then(data => dispatch(DashboardActions.refresh(data)));
    }
}