import React from "react";
import { Component } from "../CarbonFlux";
import bem from "../utils/commonUtils";

export default class LayersHighlight extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            highlight_top: 0,
            highlight_mode: 'none'
        };
    }

    _setModeAndPosition = (highlight_top, highlight_mode) => {
        this.setState({ highlight_top, highlight_mode });
    };

    render() {
        var highlight_style = {
            top: this.state.highlight_top
        };
        var mode = !this.props.dragging_mode ? 'none' : this.state.highlight_mode;
        var cn = bem("layers-panel__highlight", null, mode);

        return <div className={cn} style={highlight_style}></div>;
    }
}