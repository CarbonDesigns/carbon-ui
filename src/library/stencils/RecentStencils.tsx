import React from "react";

import {listenTo, Component} from "../../CarbonFlux";
import ScrollContainer from "../../shared/ScrollContainer";
import SpriteView from "./SpriteView";
import {richApp} from "../../RichApp";

export default class RecentStencils extends Component<any, any>{

    constructor(props) {
        super(props);
        this.state = {
            config: richApp.recentStencilsStore.getConfig()
        }
    }

    @listenTo(richApp.recentStencilsStore)
    onChange(){
        this.setState({
            config: richApp.recentStencilsStore.getConfig()
        });
    }

    render(){
        return <div>
            <div className="library-page__content">
                <ScrollContainer className="stencils-container thin dark">
                    {/* <SpriteView config={this.state.config.elements}/> */}
                </ScrollContainer>
            </div>
        </div>;
    }
}