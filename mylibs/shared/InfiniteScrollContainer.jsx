import React from "react";
import Infinite from "react-infinite";
import {dispatch} from "../CarbonFlux";
import ScrollContainer from "./ScrollContainer";
import classNames from 'classnames';

export default class InfiniteScrollContainer extends ScrollContainer {
    constructor(props){
        super(props);

        this.state = {
            elements: props.initialElements || [],
            elementHeight: props.elementHeight,
            isInfiniteLoading: false,
            page: 0,
            hasMore: true
        };
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.initialElements !== this.props.initialElements){
            if (!this.state.elements.length){
                // If previous result was empty, scroll list is empty and no scrolling occurs.
                // So trigger the event manually to fetch new content on update.
                setTimeout(() => this.handleInfiniteLoad(), 50);
            }
            var newState = {elements: nextProps.initialElements || [], elementHeight: nextProps.elementHeight, page: 0, hasMore: true};
            this.setState(newState);
        }
    }

    handleInfiniteLoad = () =>{
        if (this.state.isInfiniteLoading || !this.state.hasMore){
            return;
        }
        var nextPage = this.state.page + 1;
        this.setState({
            isInfiniteLoading: true,
            page: nextPage
        });

        this.props.onLoadMore(nextPage).then(data =>{
            var newState = {
                isInfiniteLoading: false,
                elements: this.state.elements.concat(data.elements),
                hasMore: data.hasMore
            };
            if (Array.isArray(this.state.elementHeight)){
                newState.elementHeight = this.state.elementHeight.concat(data.elementHeight);
            }
            //this.setElementHeight(this.props, newState);
            this.setState(newState);
        })
    };

    render(){
        var classes = classNames("antiscroll-wrap", this.props.className);
        var {insideFlyout, elementHeight, containerHeight, spinnerDelegate, edgeOffset, onLoadMore, initialElements, ...rest} = this.props;
        return <div {...rest} className={classes} ref="scrollContainer">
            <Infinite className="antiscroll-inner"
                      elementHeight={this.state.elementHeight}
                      containerHeight={containerHeight}
                      infiniteLoadBeginEdgeOffset={edgeOffset || 200}
                      onInfiniteLoad={this.handleInfiniteLoad}
                      loadingSpinnerDelegate={spinnerDelegate}
                      isInfiniteLoading={this.state.isInfiniteLoading}>
                {this.state.elements}
            </Infinite>
        </div>
    }
}
