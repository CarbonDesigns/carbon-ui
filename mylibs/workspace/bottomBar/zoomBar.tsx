import React from 'react';
import {CompositeElement} from "carbon-core";
import cx from 'classnames';
import {app, Environment} from "carbon-core";
import Dropdown from "../../shared/Dropdown";
import VerticalSlider from "../../shared/VerticalSlider";
import {richApp} from "../../RichApp";
import {listenTo, Component} from '../../CarbonFlux';
import AppActions from '../../RichAppActions';
import {default as bem, join_bem_mods} from '../../utils/commonUtils';

class ContiniouseAction extends Component<any, void> {
  stopExecution = true;

  _onMouseDown=(event)=>{
    app.actionManager.invoke(this.props.action);
    var that = this;
    function invokeByTimer(){
        if(!that.stopExecution){
            setTimeout(function(){
                app.actionManager.invoke(that.props.action);
                invokeByTimer();
            }, 50);
        }
    }
    this.stopExecution = false;
    setTimeout(function(){
        invokeByTimer();
    }, 200);

    event.stopPropagation();
    window.addEventListener('blur', this._onMouseUp);
    document.addEventListener('mouseup', this._onMouseUp);
  }

  _onMouseUp=(event)=>{
    this.stopExecution = true;
    event.preventDefault();
    event.stopPropagation();
    window.removeEventListener('blur', this._onMouseUp);
    document.removeEventListener('mouseup', this._onMouseUp);
  }

  render() {
    return(
    <div className="button" tabIndex={this.props.tabIndex} title={app.actionManager.getActionFullDescription(this.props.action)} id={this.props.id} onMouseDown={this._onMouseDown} onMouseUp={this._onMouseUp}>
      <i />
    </div>)
  }
}

class ZoomMenuAction extends Component<any, void> {
  _onMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  _onClick=(event)=> {
    if(this.props.disabled){
      return;
    }
    app.actionManager.invoke(this.props.action)
    event.preventDefault();
    event.stopPropagation();
  }

  render() {
    return (<span title={app.actionManager.getActionFullDescription(this.props.action)} onMouseDown={this._onMouseDown} onClick={this._onClick}>
      {app.actionManager.getActionDescription(this.props.action)}
    </span>)
  }
}

class ZoomMenuDropAction extends ZoomMenuAction {
  render() {
    var className = cx("drop__item", {disabled:this.props.disabled});

    return (
      <div className={className} title={app.actionManager.getActionFullDescription(this.props.action)} onMouseDown={this._onMouseDown} onClick={this._onClick}>
        <span>
          {app.actionManager.getActionDescription(this.props.action)}
        </span>
      </div>
    )
  }
}

class ZoomMenu extends Dropdown {
  [name:string]:any;
  props:any;
  _onMouseDown=(event)=> {
    this.toggle();
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    this._startValue = event.clientY;
    this.props.onBeginDeltaChange && this.props.onBeginDeltaChange();
  }

  _onMouseUp=()=>{
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    this.props.onEndDeltaChange && this.props.onEndDeltaChange();
  }

  _onMouseMove=(event)=>{
    var dv = event.clientY - this._startValue;
    this.props.onDelta && this.props.onDelta(dv);
  }

  render() {
    let mods = join_bem_mods(this.props.mods, {
      down: false,
      open: this.state.open
    });
    let classname = bem('drop', null, mods, this.props.className);

    return (<div className={classname} id="zoom__drop" tabIndex={2} onMouseDown={this._onMouseDown} onKeyDown={this.onKeyDown} onBlur={this.close}>
      <i className="ico ico-triangle-up" />
      <div className="drop__content drop-content_auto-width drop-content_with-slider">
        {this.props.children}
      </div>
    </div>)
  }
}

export default class ZoomBar extends Component<any, any> {
  [name:string]:any;

  refs:{
    slider:any;
  }

  constructor(props) {
    super(props);
    this._minZoom = .01;
    this._maxZoom = 16;
    this.state = {scale:richApp.appStore.state.scale, selectionCount:0};
  }

  @listenTo(richApp.appStore)
  onChange() {
    this.setState({scale:richApp.appStore.state.scale, selectionCount:richApp.appStore.state.selectionCount});
  }

  _onValueChanged=(value) =>{
    var v = 1 - value/100;
    if(v < 0.5) {
      // range 1 - .25
      v = v / 0.5; // 0..1
      v = (1-this._minZoom) * v + this._minZoom;
    } else  {
      // range 1 - 16
      v = (v - 0.5) / .5; // 0..1
      v = (this._maxZoom - 1) * v + 1
    }

    richApp.Dispatcher.dispatch(AppActions.changeCurrentPageScale(v));
    Environment.view.zoom(v);
  }

  scaleToValue(scale){
    var  v = scale;
    if(v < 1) {
      // range 1 - .25
      // 1=>0  .25=>1
      v = (1 - v) / (1 - this._minZoom);
      v = .5 + v * 0.5; // 0..1
    } else  {
      // range 1 - 16
      // 16=>0, 1=>0.5
      v = (this._maxZoom - v) / (this._maxZoom - 1); // 0..1
      v *= 0.5;
    }

    return v*100;
  }

  selectOnFocus(e){
      e.target.select();
  }

  onChangeText = e => {
      var value = parseInt(e.target.value);
      if(!isNaN(value)) {
        value = value / 100;
        this.setState({scale:value});
        Environment.view.zoom(value);
      }
  };

  onBlurText = e => {
    var value = parseInt(e.target.value);
    if(isNaN(value)){
      this.setState({scale:this.state.scale});
    }
  }

  onKeyDown = e => {
    if(e.keyCode == 38 /* ArrowUp */) {
      var newValue = (this.state.scale * 100 + (e.shiftKey?10:1)) / 100;
      if(newValue < this._minZoom) {
        newValue = this._minZoom;
      }
      this.setState({scale:newValue});
      Environment.view.zoom(newValue);
      e.preventDefault();
    } else if(e.keyCode === 40 /*ArrowDown*/) {
      var newValue = (this.state.scale * 100 - (e.shiftKey?10:1)) / 100;
      if(newValue > this._maxZoom) {
        newValue = this._maxZoom;
      }
      this.setState({scale:newValue});
      Environment.view.zoom(newValue);
      e.preventDefault();
    }
  }

  onKeyUp = e => {

  }

  render() {
    var scale = this.state.scale;

    return(
      <div id="zoombar">
        <ContiniouseAction id="zoom-out" action="zoomOut" tabIndex="0"/>
        <ContiniouseAction id="zoom-in"  action="zoomIn" tabIndex="1"/>
        <div id="zoom">
          <label htmlFor="zoom__input" id="zoom__input-container">
            <input size={3} value={~~(scale*100)} ref="zoomInput" tabIndex={1} onFocus={this.selectOnFocus} onBlur={this.onBlurText} onChange={this.onChangeText} onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp} id="zoom__input" /><span>%</span><div className="bg" />
          </label>
          <ZoomMenu onDelta={(d)=>{this.refs.slider.deltaChange(d)}} onBeginDeltaChange={()=>{this.refs.slider.beginDeltaChange()}} onEndDeltaChange={()=>{this.refs.slider.endDeltaChange()}}>
              <VerticalSlider ref="slider" value={this.scaleToValue(scale)} valueChanged={this._onValueChanged}/>
              <div className="drop__slider-scales">
                <ZoomMenuAction action="zoom8:1"/>
                <ZoomMenuAction action="zoom2:1"/>
                <ZoomMenuAction action="zoom100"/>
                <ZoomMenuAction action="zoom1:2"/>
                <ZoomMenuAction action="zoom1:4"/>
              </div>
              <div className="drop__list">
                <ZoomMenuDropAction action="zoomFit"/>
                <ZoomMenuDropAction action="zoomSelection" disabled={this.state.selectionCount === 0}/>
                <ZoomMenuDropAction action="pageCenter"/>
              </div>
          </ZoomMenu>
        </div>
      </div>
    )
  }
}
