import React from 'react';
import cx from 'classnames';
import {richApp} from '../../RichApp'
//import {app} from "carbon-core";
import {listenTo, Component} from "../../CarbonFlux";
import AppActions from "../../RichAppActions";

import ViewSettingsButton from "./ViewSettingsButton";

export default class WindowControls extends Component<any, any> {

    constructor(props) {
      super(props);
      this.state={
        open:false,
        frameVisible:richApp.appStore.state.frameVisible,
        resizing: richApp.layoutStore.resizing
      }
    }

    @listenTo(richApp.appStore, richApp.layoutStore)
    onChange(){
      this.setState({
        frameVisible:richApp.appStore.state.frameVisible,
        resizing: richApp.layoutStore.resizing,
        fullscreen: richApp.appStore.state.fullscreen
      })
    }

    open = () => {
        if (!this.state.open){
            this.toggle();
        }
    };
    close = () => {
        if (this.state.open){
            this.toggle();
        }
    };
    toggle = () => {
        this.setState({open: !this.state.open});
    };

    onKeyDown = (e) => {
        //TODO: handle ESC
    };

    _closeGroup=()=>{
      // data-mode-target="#window-controls" data-remove-class="expanded"
    }

    _openGroup=()=>{
      //data-mode-target="#window-controls" data-turn-class="expanded"
    }

    _windowControlButton(id, title, active, tabindex, action) {
      var className = cx("button window-control-button", {_active: active});
      return (
        <div className={className} title={title} id={id} tabIndex={tabindex} onClick={action}>
          <i />
        </div>
      );
    }

    _toggleFullscreen=()=>{
      var that = this;
      if (!window) {
        return;
      }

      var fApi = window['fullScreenApi'];
      if (!fApi.supportsFullScreen) {
        return;
      }

      if (!this.state.fullscreen) {
        fApi.requestFullScreen(document.body);
      } else {
        fApi.cancelFullScreen();
      }
    }

    render() {
        var dropClassName = cx("window-control-button drop drop-down", {_active:this.state.open});
        return(
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
            <ViewSettingsButton className="window-control-button"/>
            {this._windowControlButton("fullscreen", '', this.state.fullscreen, 2, this._toggleFullscreen)}
          </div>
        );
    }
}
