import React, { PropTypes } from "react";
import {Component, listenTo} from "../CarbonFlux";
import {Link} from "react-router";

import DashboardStore from "./DashboardStore";

class ProjectTile  extends Component<any, any>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    _getProjectLink(){
        if (this.props.companyName){
            return {
                pathname: '/app/@' + this.props.companyName + "/" + this.props.id,
                state: {companyId: this.props.companyId}
            };
        }
        return {
            pathname: '/app/' + this.props.id
        };
    }

    _goToProject = () => {
        this.context.router.push(this._getProjectLink())
    }

    _preventDefault(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    render() {
        return <Link to={this._getProjectLink()} className="project-tile" onClick={this._preventDefault} onDoubleClick={this._goToProject}>
            <figure className="project-tile__back" style={{backgroundImage:`url(${this.props.avatar})`}}></figure>
            <div className="project-tile__block">
                <img className="project-tile__image" src={this.props.avatar}/>
                <h1 className="project-tile__name">{this.props.name}</h1>
                <h1 className="project-tile__counter">10 artboards</h1>
            </div>
        </Link>
        //<Link to={this._getProjectLink(x)}><span>{x.get("name")}</span></Link>
    }
}

export default class ProjectList extends Component<any, any>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props){
        super(props);
        this.state = {projects: []};
    }

    @listenTo(DashboardStore)
    _onChanged(){
        this.setState({projects: DashboardStore.state.get("projectList")});
    }

    render(){
        return <div className="dashboard-projects">
            {this.state.projects.map(x => {
                return <ProjectTile
                     key={x.get("id")}
                     id={x.get("id")}
                     name={x.get("name")}
                     companyName={x.get("companyName")}
                     companyId={x.get("companyId")}
                     avatar={x.get("avatar")}/>
            })}
        </div>
    }
}