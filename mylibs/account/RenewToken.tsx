import React from "react";
import {backend, logger} from "carbon-api";

export default class RenewToken extends React.Component<void, void>{
    componentDidMount(){
        backend.renewTokenCallback();
    }
    render(){
        return <div></div>
    }
}