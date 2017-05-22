import React from "react";
import cx from "classnames";
import ReactDom from "react-dom";
import ImageList from "./ImageList";
import {Component, listenTo, dispatch, handles} from "../../CarbonFlux";
import Search from "../../shared/Search";
import {domUtil} from "carbon-core";
import ImagesActions from './ImagesActions';
import LayoutActions from '../../layout/LayoutActions';
import unsplashStore from "./UnsplashStore";

export default class Unsplash extends Component<any, any>{
    refs: {
        container: HTMLElement,
        page: HTMLElement,
        search: Search
    }

    constructor(props){
        super(props);

        this.state = {
            initialItems: []
        };
    }

    @listenTo(unsplashStore)
    onChange(){
        this.setState({
            term: unsplashStore.state.term,
            initialItems: unsplashStore.state.results,
            message: unsplashStore.state.message,
            error: unsplashStore.state.error
        })
    }

    @handles(LayoutActions.resizePanel, LayoutActions.togglePanelGroup, LayoutActions.windowResized)
    onResizePanel(){
        setTimeout(() => {
            var node = this.refs.container;
            if (node){
                this.setState({
                    containerHeight: node.offsetHeight
                });
            }
        }, 100);
    }

    activated(){
        var page = ReactDom.findDOMNode(this.refs.page);
        // setting focus during css transition causes weird side effects
        // because browser tries to scroll to focused element visible
        domUtil.onCssTransitionEnd(page, () => this.refs.search.focus(), 800);
    }
    changeTerm = term => {
        dispatch(ImagesActions.webSearch(term));
    };

    componentDidMount(){
        super.componentDidMount();
        this.setState({containerHeight: this.refs.container.offsetHeight});
        this.refs.search.query(unsplashStore.state.term);
    }

    _onLoadMore = p => {
        return unsplashStore.runQuery(p);
    };

    render(){
        return <div ref="page">
            <div className="library-page__content" ref="container">
                <div className="filter">
                    <Search onQuery={this.changeTerm} placeholder="Find image..." ref="search" className="search-container"/>
                </div>
                <section className="stencils-group">
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
            return <ImageList className="list"
                              containerHeight={this.state.containerHeight}
                              initialItems={this.state.initialItems}
                              onLoadMore={this._onLoadMore}/>;
        }
        return <div/>;
    }
}
