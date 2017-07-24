import React from "react";
import ReactDOM from "react-dom";
import { Component } from "../CarbonFlux";
import { GuiButtonedInput, GuiInput, GuiButton } from "../shared/ui/GuiComponents";

export default class LayerRenamer extends Component<any, any> {
    [x: string]: any;
    refs: any;

    constructor(props) {
        super(props);
        this.state = {
            layer_name: this.props.layer_name,
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.input_el = ReactDOM.findDOMNode(this.refs['rename_input_wrapper'].refs['input']);
        this.refs['rename_input_wrapper'].refs['input'].focus();
    }

    _onSaveRenameClick = (ev) => { this.props.save(this.props.layer, this.input_el.value); };

    _onCancelRenameClick = (ev) => { this.props.cancel() };


    _onKeyDown = (ev) => {
        if (ev.key === "Escape") {
            this.props.cancel();
            ev.preventDefault();
            return;
        }
        if (ev.key === "Enter") {
            this.props.save(this.props.layer, this.input_el.value);
            ev.preventDefault();
            return;
        }

        ev.stopPropagation();
    };

    _stopPropagation(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }

    render() {
        return <div className="layers-panel__rename"
            onClick={this._stopPropagation}
            onKeyDown={this.onKeyDown}
        >
            <GuiButtonedInput>
                <GuiInput
                    ref="rename_input_wrapper"
                    className="layers-panel__rename-input"
                    onKeyDown={this._onKeyDown}
                    defaultValue={this.state.layer_name}
                />
                <GuiButton onClick={this._onSaveRenameClick} mods={["hover-success", "square"]} className="layers-panel__rename-save" icon="ok-white" />
                <GuiButton onClick={this._onCancelRenameClick} mods={["hover-cancel", "square"]} className="layers-panel__rename-cancel" icon="cancel" />
            </GuiButtonedInput>
        </div>
    }
}