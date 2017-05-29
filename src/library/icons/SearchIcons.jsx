import React from "react";
import ReactDom from "react-dom";
import {Component, listenTo} from "../../CarbonFlux";
import Search from "../../shared/Search";
import ScrollContainer from "../../shared/ScrollContainer";
import IconsView from "./IconsView";
import IconsList from "./IconsList";
import IconsActions from "./IconsActions";
import {domUtil} from "carbon-core";
import {richApp} from "../../RichApp";

export default class SearchIcons extends Component {

    constructor(props){
        super(props);
        this.state = {iconFinderIcons: []};
    }

    activated(){
        var page = ReactDom.findDOMNode(this.refs.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        domUtil.onCssTransitionEnd(page, () => this.refs.search.focus(), 800);
    }

    @listenTo(richApp.searchIconsStore, richApp.iconFinderStore)
    onChange(){
        this.setState({
            config: richApp.searchIconsStore.getResults(),
            iconFinderIcons: richApp.iconFinderStore.getResults()
        })
    }

    search = (q) =>{
        richApp.dispatch(IconsActions.search(q));
    };

    render(){

        var {formatMessage} = this.context.intl;
        return <div ref="page">
            <Search className="library-page__header" onQuery={this.search} placeholder={formatMessage({id:"Find icon (Shift+F3)..."})}
                    ref="search"/>

            <div className="library-page__content">
                <ScrollContainer className="stencils-container thin dark">
                    <IconsView config={this.state.config}/>
                    {this.renderWebIcons()}
                </ScrollContainer>
            </div>
        </div>;
    }

    renderWebIcons(){
        if (this.state.iconFinderIcons.length){
            return <section className="stencils-group">
                <div className="stencils-group__name">
                    <strong>IconFinder</strong>
                </div>
                {/*<IconsList icons={this.state.iconFinderIcons}/>*/}
            </section>;
        }
        return null;
    }
}
