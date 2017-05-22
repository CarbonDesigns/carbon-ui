import React from "react";
import ReactDom from "react-dom";
import cx from "classnames";
import IconsList from "./IconsList";
import {Component, listenTo, handles, dispatch} from "../../CarbonFlux";
import Search from "../../shared/Search";
import {domUtil} from "carbon-core";
import IconsActions from './IconsActions';
import iconFinderStore from "./IconFinderStore";

export default class IconFinder extends Component{
    constructor(props){
        super(props);

        this.state = {
            initialItems: []
        };
    }

    @listenTo(iconFinderStore)
    onChange(){
        this.setState({
            term: iconFinderStore.state.term,
            initialItems: iconFinderStore.state.results,
            message: iconFinderStore.state.message,
            error: iconFinderStore.state.error
        })
    }

    activated(){
        var page = ReactDom.findDOMNode(this.refs.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        domUtil.onCssTransitionEnd(page, () => this.refs.search.focus(), 800);
    }
    _onLoadMore = p => {
        return iconFinderStore.runQuery(p);
    };

    changeTerm = term => {
        dispatch(IconsActions.webSearch(term));
    };

    componentDidMount(){
        super.componentDidMount();
        this.refs.search.query(iconFinderStore.state.term);
    }

    render(){
        return <div ref="page">
            <div className="library-page__content">
                <div className="filter">
                    <Search onQuery={this.changeTerm} placeholder="Find icon..." ref="search" className="search-container"/>
                </div>
                <section className="stencils-group" ref="container">
                    {this._renderList()}
                </section>
            </div>
        </div>;
    }

    _renderList(){
        if (this.state.message){
            //TODO: misha, design for message and error state
            return <span className={cx("message", {error: this.state.error})}>{this.state.message}</span>
        }
        if (this.state.term){
            return <IconsList className="list"
                              container={this.refs.container}
                              initialItems={this.state.initialItems}
                              onLoadMore={this._onLoadMore}/>;
        }
        return <div/>;
    }
}
