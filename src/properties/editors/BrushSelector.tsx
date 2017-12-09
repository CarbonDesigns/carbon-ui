import React from "react";
import ReactDom from "react-dom";
import cx from 'classnames';
import BrushTabs from "./BrushTabs";
import FlyoutActions from '../../FlyoutActions';
import {Component, dispatch} from '../../CarbonFlux';
import {Brush} from "carbon-core";

import {FormattedMessage} from "react-intl";

interface IBrushSelectorState {
    newStyle?:any;
    initialStyle?:any;
}

export default class BrushSelector extends Component<any, IBrushSelectorState> {
    constructor(props){
        super(props);
        this.state = {
            newStyle: Brush.toCss(props.brush),
            initialStyle : this.state.newStyle
        };
    }

    selectBrush = brush => {
        this.setState({newStyle: Brush.toCss(brush)});
        this.props.onSelected(brush);
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
        return <div className={classes} tabIndex={1}>
            <BrushTabs brush={this.props.brush} onSelected={this.selectBrush} hasGradient={this.props.hasGradient} onPreview={this.props.onPreview}/>
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