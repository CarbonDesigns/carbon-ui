import React from "react";
import {Component, listenTo} from "../CarbonFlux";
import {Link} from "react-router";

import DashboardStore from "./DashboardStore";

export default class ProjectList extends Component<any, any>{
    constructor(props){
        super(props);
        this.state = {projects: []};
    }

    @listenTo(DashboardStore)
    _onChanged(){
        this.setState({projects: DashboardStore.state.get("projectList")});
    }

    _getProjectLink(x){
        if (x.get("companyName")){
            return {
                pathname: '/app/@' + x.get("companyName") + "/" + x.get("id"),
                state: {companyId: x.get("companyId")}
            };
        }
        return {
            pathname: '/app/' + x.get("id")
        };
    }

    render(){
        return <div className="projects">
            {this.state.projects.map(x => {
                return <div key={x.get("id")}>
                    <Link to={this._getProjectLink(x)}><span>{x.get("name")}</span></Link>
                </div>
            })}
        </div>
    }
}