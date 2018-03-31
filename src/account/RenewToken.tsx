import * as React from "react";
import {backend, logger} from "carbon-api";

export class RenewToken extends React.Component{
    componentDidMount(){
        backend.renewTokenCallback();
    }
    render(){
        return <div></div>
    }
}