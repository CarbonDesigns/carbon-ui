import * as React from "react";
import * as PropTypes from "prop-types";
import {backend} from "carbon-api";
import {handles, Component} from "./CarbonFlux";
import RouteComponent, { RouteComponentProps } from "./RouteComponent";
import { LandingPage } from "./landing/LandingPage";

interface LandingSelectorProps extends RouteComponentProps {
    landingComponent: React.Component;
}

export class LandingSelector extends RouteComponent<LandingSelectorProps, any>{
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
                    this.props.history.replace({
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
            return <LandingPage {...this.props}/>
        }
        return null;
    }

    static contextTypes = {
        intl: PropTypes.any,
        router: PropTypes.any
    }
}