import React from "react";
import {Component} from "../../CarbonFlux";
import IconFinderApi from "./IconFinderApi";

export default class IconFinderSet extends React.Component{
    constructor(props){
        super(props);
        this.state = {icons: []};
    }

    componentDidMount(){
        var api = new IconFinderApi();
        api.listIconsInSet("snipicons")
            .then(data => {
                this.setState({icons: data.icons});
            })
    }
    render(){
        return <div style={{maxWidth: 300, background: "red"}}>
            {this.state.icons.map(x => <div style={{width: 40, height: 40, background: "green", margin: 2, display: "inline-block"}} />)}
        </div>
    }
}