import React from "react";
import ReactDom from "react-dom";
import cx from 'classnames';
import BrushTabs from "./BrushTabs";
import FlyoutActions from '../../FlyoutActions';
import {Component, dispatch} from '../../CarbonFlux';
import {Brush} from "carbon-core";

import {FormattedHTMLMessage} from "react-intl";

export default class BrushSelector extends Component<any, any> {
    constructor(props){
        super(props);
        this.state = {};
        this.state.newStyle = Brush.toCss(props.brush);
        this.state.initialStyle = this.state.newStyle;
    }

    selectBrush = brush => {
        this.setState({newStyle: Brush.toCss(brush)});
        this.props.onSelected(brush);
    };

    onKeyDown = e => {
        if (e.key === "Escape" && e.target.tagName !== "INPUT"){
            this.ok();
        }
    };

    ok = () => {
        dispatch(FlyoutActions.hide());
    };
    cancel = () => {
        this.props.onCancelled();
        dispatch(FlyoutActions.hide());
    };

    componentDidMount(){
        (ReactDom.findDOMNode(this) as HTMLElement).focus();
    }

    render(){
        var classes = cx("colorpicker-popup", this.props.className);
        return <div className={classes} onKeyDown={this.onKeyDown} tabIndex={1}>
            <BrushTabs brush={this.props.brush} onSelected={this.selectBrush}/>
            <footer>
                <div className="swatches__color-input">
                    <i style={this.state.initialStyle}></i>
                    <span>→</span>
                    <ins></ins>
                    <i style={this.state.newStyle}></i>
                </div>
            </footer>
            <div className="bottom-right-controls">
                <div className="button_accept" onClick={this.ok}></div>
                <div className="button_cancel" onClick={this.cancel}></div>
            </div>
        </div>;
    }
}