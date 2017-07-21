import React from "react";
import ReactDom from "react-dom";
import cx from 'classnames';

export default class VerticalSlider extends React.Component<any, any>{
    [name:string]:any;
    refs:{
      slider:HTMLElement;
      handle:HTMLElement;
    }
    constructor(props){
        super(props);
        this.state={value:this.props.value||0}
    }

    _onMouseDown=(event)=>{
      event.preventDefault();
      event.stopPropagation();
      this._height = this.refs.slider.clientHeight;
      this._offset = this.refs.slider.getBoundingClientRect().top;
      this._updatePositionFromEvent(event);

      this._handelMouseDown(event);
    }

    _handleDragging=(event)=>{
      if(this._dragging){
          this._updatePositionFromEvent(event);
      }
    }

    beginDeltaChange() {
      this.refs.slider.classList.add("_dragging");
    }

    endDeltaChange() {
      this.refs.slider.classList.remove("_dragging");
      delete this._originalY;
    }

    deltaChange(dv) {
      if(!this._originalY) {
        if(!this._height) {
          this._height = this.refs.slider.clientHeight;
        }

        this._originalY = this.props.value / 100 * this._height;
      }
      var newY = this._originalY + dv;
      this._updateFromY(newY);
    }

    _updatePositionFromEvent=(event)=>{
        var y = event.clientY - this._offset;
        this._updateFromY(y);
    }

    _updateFromY(y) {
      var top = (y / this._height) * 100;

      if (top > 100) top = 100;
      else if (top < 0) top = 0;

      if (this.props.valueChanging) {
        top = this.props.valueChanging(top);
      }
      this.refs.handle.style.top = top + '%';
      if (this.props.valueChanged) {
        this.props.valueChanged(top);
      }
    }

    _handelMouseDown=(event)=>{
      this._dragging = true;
      document.body.addEventListener("mousemove", this._handleDragging);
      document.body.addEventListener("mouseup", this._handelMouseUp);
      this.refs.slider.classList.add("_dragging");
    }

    _handelMouseUp=(event)=>{
      this._dragging = false;
      document.body.removeEventListener("mousemove", this._handleDragging);
      document.body.removeEventListener("mouseup", this._handelMouseUp);
      this.refs.slider.classList.remove("_dragging");
    }

    render(){

        var value = this.props.value || 0;
        if(value > 100) value = 100;
        else if(value < 0) value = 0;

        return (<div className="drop-slider drop-slider_vertical" onMouseDown={this._onMouseDown}>
          <div className="drop-slider__track" ref="slider">
            <div className="drop-slider__handle" style={{top:value+'%'}} ref="handle" onMouseDown={this._handelMouseDown} />
          </div>
        </div>);
    }
}
