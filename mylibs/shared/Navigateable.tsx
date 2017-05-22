import React from "react";
import {FormattedHTMLMessage} from "react-intl";
import velocity from "velocity-animate";
import ScrollContainer from "./ScrollContainer";
import {listenTo, Component} from "../CarbonFlux";
import cx from "classnames";

//specifically not derived from carbon Component
class Navigator extends React.Component<any, any>{
    constructor(props){
        super(props);
        if(props.config && props.config.length) {
            this.state = {activeCategory: props.config[0].name};
        } else {
            this.state={};
        }
    }

    changeCategory = e => {
        this.updateCategory(e.currentTarget.dataset.category);
        this.props.onCategoryChanged(e.currentTarget.dataset.category);
    };

    updateCategory(c){
        this.setState({activeCategory: c});
    }

    render() {
        if(!this.props|| !this.props.config){
            return <div className="stencils-navigator"/>;
        }
        return <div className="stencils-navigator">
            <ScrollContainer className="wrap thin">
                {this.props.config.map(g =>{
                    var classes = cx({
                        'stencils-navigator__item': true,
                        'active': g.name === this.state.activeCategory
                    });
                    return <div key={g.name} className={classes} onClick={this.changeCategory} data-category={g.name}>
                        <span>{g.name}</span>
                    </div>
                })}
            </ScrollContainer>
        </div>;
    }
}

export default class Navigateable extends Component<any, any>{
    [name: string]: any;
    refs: any;

    constructor(props){
        super(props);
        this._cachedNodes = null;
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._cachedNodes = null;
    }

    scrollToCategory = (c) => {
        var categoryNode = this.props.getCategoryNode(c);
        var scrollPane = this.refs.scrollContainer.getScrollPaneNode();
        this._scrolling = true;
        velocity(categoryNode, "scroll", {
            duration: 200,
            container: scrollPane,
            complete: () => {
                this._scrolling = false;
            }});
    };

    onScroll = (e) => {
        if (!this._scrolling){
            var scrollPane = e.target;
            var scrollTop = scrollPane.scrollTop;
            if (!this._cachedNodes){
                this._cachedNodes = this.props.config.map(g => {
                    var node = this.props.getCategoryNode(g.name);
                    node.dataset["category"] = g.name;
                    return node;
                });
            }
            var activeNode;
            for (var i = this._cachedNodes.length - 1; i >= 0; --i){
                var node = this._cachedNodes[i];
                if (node.offsetTop <= scrollTop){
                    activeNode = node;
                    break;
                }
            }

            if(activeNode) {
                this.refs.navigator.updateCategory(activeNode.dataset.category);
            }
        }
    };

    render(){
        var {config, getCategoryNode, ...other} = this.props;
        return <div {...other}>
            <Navigator config={config} onCategoryChanged={this.scrollToCategory} ref="navigator"/>
            <ScrollContainer onScroll={this.onScroll} ref="scrollContainer" className="stencils-container thin dark">
                {this.props.children}
            </ScrollContainer>
        </div>;
    }
}
