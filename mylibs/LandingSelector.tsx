import React from "react";
import {backend} from "carbon-api";
import {handles, Component} from "./CarbonFlux";
import LandingPage from "./landing/LandingPage";
import RouteComponent, { IRouteComponentProps } from "./RouteComponent";

export default class LandingSelector extends RouteComponent<IRouteComponentProps, any>{
    constructor(props){
        super(props);
        this.state = {renderLanding: false};
    }
    _resolveCompanyName(){
        if (backend.isGuest()){
            return Promise.resolve({companyName: "guest"});
        }
        return backend.accountProxy.getCompanyName();
    }
    componentWillMount(){
        if (backend.isLoggedIn()){
            this._resolveCompanyName()
                .then(data => {
                    this.context.router.replace({
                        pathname: "/@" + (data.companyName || "guest"),
                        state: {companyId: backend.getUserId()}
                    });
                });
        }
        else{
            this.setState({renderLanding: true})
        }
    }

    render(){
        if (this.state.renderLanding){
            return <LandingPage location={this.props.location}/>
        }
        return null;
    }

    static contextTypes = {
        intl: React.PropTypes.any,
        router: React.PropTypes.any
    }
}