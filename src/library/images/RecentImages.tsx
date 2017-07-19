import React from "react";
//import ImageView from "./ImageView";
import {Component, listenTo} from "../../CarbonFlux";
import ScrollContainer from "../../shared/ScrollContainer";
import {richApp} from "../../RichApp";
import ImagesActions from "./ImagesActions";

export default class RecentImages extends Component<any, any>{
    @listenTo(richApp.recentImagesStore)
    onChange(){
        this.setState({config:richApp.recentImagesStore.getConfig()});
    }

    render(){
        if(!this.state || !this.state.config){
            return <div className="gui-page"/>
        }
        return <div className="library-page__content">
                <ScrollContainer className="stencils-container thin dark">
                    {/* <ImageView config={this.state.config.elements}/> */}
                </ScrollContainer>
            </div>;
    }
}
