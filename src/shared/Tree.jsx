import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

var ExpandArrow = (props)=>{
    var className = cx("arrow", {collapsed:props.collapsed});
    return <div className="arrow-area" onClick={props.onClick}>
        <div className={className} />
    </div>
};

var DefaultNode = (item)=>{
    return <span>{item.name}</span>
};

class Node extends React.Component {
    constructor(props){
        super(props);
        this.state= {collapsed:false};
    }

    _toggle = event => {
        this.setState({collapsed:!this.state.collapsed});
        event.stopPropagation();
        event.preventDefault();
    };

    _onClick = event => {
        this.context.onClick(this.props.item, event);
        if (this.props.item.children && !event.isDefaultPrevented()){
            this._toggle(event);
        }
        else{
            event.stopPropagation();
            event.preventDefault();
        }
    };

    _renderChildren(){
        if (this.state.collapsed || !this.props.item.children){
            return null;
        }

        return <div className="content">{this.props.item.children.map(x => <Node item={x} key={x.name} />)}</div>;
    }

    _renderArrow(){
        if (this.props.item.children){
            return <ExpandArrow collapsed={this.state.collapsed} onClick={this._toggle}/>
        }
        return null;
    }

    render() {
        return <div className="node">
            <div className="header" onClick={this._onClick}>
                {this._renderArrow()}
                {this.context.template(this.props.item)}
            </div>
            {this._renderChildren()}
        </div>
    }
}
Node.contextTypes = {onClick: PropTypes.any, template: PropTypes.any};


export default class Tree extends React.Component{
    render(){
        var {data, className, ...other} = this.props;
        return <div className={cx("tree", className)} {...other}>
            {data.map(x => <Node item={x} key={x.name} />)}
        </div>;
    }
    getChildContext() {
        return {onClick: this.props.onClick, template: this.props.nodeTemplate || DefaultNode};
    }
}
Tree.childContextTypes = {onClick: PropTypes.any, template: PropTypes.any};