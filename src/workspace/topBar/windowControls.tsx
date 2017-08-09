import React from 'react';
import cx from 'classnames';
import { richApp } from '../../RichApp'
//import {app} from "carbon-core";
import { listenTo, Component } from "../../CarbonFlux";
import AppActions from "../../RichAppActions";
import ViewSettingsButton from "./ViewSettingsButton";
import appStore from "../../AppStore";
import FullScreenApi from "../../shared/FullScreenApi";
import { util } from "carbon-core";

export default class WindowControls extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            frameVisible: appStore.state.frameVisible,
            resizing: richApp.layoutStore.resizing,
            fullscreen: FullScreenApi.isFullScreen()
        }

        this.onResize = util.debounce(this.onResize, 100);
    }

    componentDidMount() {
        super.componentDidMount();

        window.addEventListener("resize", this.onResize);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        window.removeEventListener("resize", this.onResize);
    }

    @listenTo(appStore, richApp.layoutStore)
    onChange() {
        this.setState({
            frameVisible: appStore.state.frameVisible,
            resizing: richApp.layoutStore.resizing
        })
    }

    open = () => {
        if (!this.state.open) {
            this.toggle();
        }
    };
    close = () => {
        if (this.state.open) {
            this.toggle();
        }
    };
    toggle = () => {
        this.setState({ open: !this.state.open });
    };

    onKeyDown = (e) => {
        //TODO: handle ESC
    };

    onResize = () => {
        this.setState({ fullscreen: FullScreenApi.isFullScreen() });
    }

    _closeGroup = () => {
        // data-mode-target="#window-controls" data-remove-class="expanded"
    }

    _openGroup = () => {
        //data-mode-target="#window-controls" data-turn-class="expanded"
    }

    _windowControlButton(id, title, active, tabindex, action) {
        var className = cx("button window-control-button", { _active: active });
        return (
            <div className={className} title={title} id={id} tabIndex={tabindex} onClick={action}>
                <i />
            </div>
        );
    }

    _toggleFullscreen = () => {
        var that = this;

        if (!FullScreenApi.supportsFullScreen) {
            return;
        }

        if (!FullScreenApi.isFullScreen()) {
            FullScreenApi.requestFullScreen(document.body);
        }
        else {
            FullScreenApi.cancelFullScreen();
        }
    }

    render() {
        var dropClassName = cx("window-control-button drop drop-down", { _active: this.state.open });
        return (
            <div id="window-controls">
                {/*
            <div className="window-control-group-closer" onClick={this._closeGroup}>
              <i />
            </div>
            <div className="window-controls-group">
              {[
                "snap-toggle",
                "ruler-toggle",
                "columns-toggle",
                "frame-toggle",
                "grid-toggle",
                "guides-toggle"
                ].map(this._windowControlButton)}
            </div>
            <div className="window-control-group-closer-opener" onClick={this._openGroup}>
            <i />
            </div>


            */}
                {/*this._windowControlButton("compact-mode", this.props.compactMode)*/}
                <ViewSettingsButton className="window-control-button" />
                {FullScreenApi.supportsFullScreen ? this._windowControlButton("fullscreen", '', this.state.fullscreen, 2, this._toggleFullscreen) : null}
            </div>
        );
    }
}
