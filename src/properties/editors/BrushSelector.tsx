import * as React from "react";
import * as ReactDom from "react-dom";
import * as cx from "classnames";
import BrushTabs from "./BrushTabs";
import {Component, dispatch} from '../../CarbonFlux';
import {Brush} from "carbon-core";

import {FormattedMessage} from "react-intl";
import CarbonActions from "../../CarbonActions";

interface IBrushSelectorState {
    newStyle?:any;
    initialStyle?:any;
}

export default class BrushSelector extends Component<any, IBrushSelectorState> {
    constructor(props){
        super(props);
        this.state = {
            newStyle: Brush.toCss(props.brush),
            initialStyle : {type:0, value:""}
        };
    }

    selectBrush = brush => {
        this.setState({newStyle: Brush.toCss(brush)});
        this.props.onSelected(brush);
    };

    ok = () => {
        dispatch(CarbonActions.cancel());
    };
    cancel = () => {
        this.props.onCancelled();
        dispatch(CarbonActions.cancel());
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