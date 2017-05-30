import React from "react";
import ReactDom from "react-dom";
import {Component, listenTo} from "../../CarbonFlux";
import Search from "../../shared/Search";
import ScrollContainer from "../../shared/ScrollContainer";
import SpriteView from "./SpriteView";
import StencilsActions from "./StencilsActions";
import {domUtil} from "carbon-core";
import {richApp} from "../../RichApp";

export default class SearchStencils extends Component<any, any>{
    refs: any;

    constructor(props) {
        super(props);
        this.state = {
            config:richApp.searchStencilsStore.getResults()
        }
    }

    @listenTo(richApp.searchStencilsStore)
    onChange(){
        this.setState({config:richApp.searchStencilsStore.getResults()});
    }

    activated(){
        var page = ReactDom.findDOMNode(this.refs.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        domUtil.onCssTransitionEnd(page, () => this.refs.search.focus(), 800);
    }
    search = (q) => {
        richApp.dispatch(StencilsActions.search(q));
    };
    render(){
        var placeHolderMessage = this.context.intl.formatMessage({id:"Find stencil (F3)...", defaultMessage:"Find stencil (F3)..."})
        return <div ref="page">
            <div className="library-page__header">
	            <Search onQuery={this.search} placeholder={placeHolderMessage} ref="search"/>
            </div>

            <div className="library-page__content">
                <ScrollContainer className="stencils-container thin dark">
                    <SpriteView config={this.state.config}/>
                </ScrollContainer>
            </div>
        </div>;
    }
}
