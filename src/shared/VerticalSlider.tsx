import React from "react";
import ReactDom from "react-dom";
import cx from 'classnames';
import styled, {css} from "styled-components";
import theme from "../theme";

interface ISliderProps {
  value?: number;
  vertical?: boolean;
  valueChanging?: (value: number) => number;
  valueChanged?: (value: number) => void;
}

export default class Slider extends React.Component<ISliderProps, any>{
  private slider: HTMLElement;
  private handle: HTMLElement;
  private _size: number;
  private _offset: number;
  private _dragging: boolean;
  private _originalPosition: number;

  constructor(props) {
    super(props);
    this.state = { value: this.props.value || 0 }
  }

  _onMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (this.props.vertical) {
      this._offset = this.slider.getBoundingClientRect().top;
      this._size = this.slider.clientHeight;
    } else {
      this._offset = this.slider.getBoundingClientRect().left;
      this._size = this.slider.clientWidth;
    }

    this._updatePositionFromEvent(event);
    this._handelMouseDown(event);
  }

  _handleDragging = (event) => {
    if (this._dragging) {
      this._updatePositionFromEvent(event);
    }
  }

  beginDeltaChange() {
    this.slider.classList.add("_dragging");
  }

  endDeltaChange() {
    this.slider.classList.remove("_dragging");
    delete this._originalPosition;
  }

  deltaChange(dv) {
    if (!this._originalPosition) {
      if (!this._size) {
        this._size = this.props.vertical ? this.slider.clientHeight : this.slider.clientWidth;
      }

      this._originalPosition = this.props.value / 100 * this._size;
    }

    var newPos = this._originalPosition + dv;
    this._updateFromPosition(newPos);
  }

  _updatePositionFromEvent = (event) => {
    var value = this.props.vertical ? (event.clientY - this._offset) : (event.clientX - this._offset);
    this._updateFromPosition(value);
  }

  _updateFromPosition(value) {
    var percentPosition = (value / this._size) * 100;

    if (percentPosition > 100) {
      percentPosition = 100;
    }
    else if (percentPosition < 0) {
      percentPosition = 0;
    }

    if (this.props.valueChanging) {
      percentPosition = this.props.valueChanging(percentPosition);
    }

    if (this.props.vertical) {
      this.handle.style.top = percentPosition + '%';
    } else {
      this.handle.style.left = percentPosition + '%';
    }

    if (this.props.valueChanged) {
      this.props.valueChanged(percentPosition);
    }
  }

  _handelMouseDown = (event) => {
    this._dragging = true;
    document.body.addEventListener("mousemove", this._handleDragging);
    document.body.addEventListener("mouseup", this._handelMouseUp);
    this.slider.classList.add("_dragging");
  }

  _handelMouseUp = (event) => {
    this._dragging = false;
    document.body.removeEventListener("mousemove", this._handleDragging);
    document.body.removeEventListener("mouseup", this._handelMouseUp);
    this.slider.classList.remove("_dragging");
  }

  render() {
    var value = this.props.value || 0;
    if (value > 100) {
      value = 100;
    }
    else if (value < 0) {
      value = 0;
    }

    let progressStyle:any = {};
    let handleStyle:any = {};

    if(this.props.vertical) {
      progressStyle.height = value + '%';
      handleStyle.top = value + '%';
    } else {
      progressStyle.width = value + '%';
      handleStyle.left = value + '%';
    }

    return (<SliderContainer onMouseDown={this._onMouseDown} vertical={this.props.vertical}>
      <SliderTrack innerRef={x => this.slider = x} vertical={this.props.vertical}>
        <SliderProgress style={progressStyle}/>
        <SliderHandle style={handleStyle} vertical={this.props.vertical} innerRef={x => this.handle = x} onMouseDown={this._handelMouseDown} />
      </SliderTrack>
    </SliderContainer>);
  }
}

var SliderContainer = styled.div.attrs<{vertical:boolean}>({})`
    position: relative;
    background:none;
    ${props=>props.vertical?css`width:32px;`:css`height:32px;`};
    overflow: hidden;
    cursor: pointer;
`;

var SliderTrack = styled.div.attrs<{vertical:boolean}>({})`
  position: absolute;
  ${props=>props.vertical?css`
    top: 16px;
    left: 50%;
    bottom: 16px;
    width: 4px;
    margin-left: -2px;
  `:css`
    left: 16px;
    top: 50%;
    right: 16px;
    height: 4px;
    margin-top: -2px;
  `}
  background-color: ${theme.slider_track};
  background-color: rgba(255, 255, 255, 0.25);
  transition: background 0.2s;
  box-shadow: 0 1px 3px rgba(1, 2, 3, 0.2) inset;
`;

var SliderHandle = styled.div.attrs<{vertical:boolean}>({})`
  border-radius: 100px;
  width: 12px;
  height: 12px;
  box-shadow: 0 1px 2px rgba(1, 2, 3, 0.28);
  border: 3px solid white;
  position: absolute;
  background: white;
  ${props=>props.vertical?css`
    margin-top: -100%;
    top: 0%;
    left: 50%;
    margin-left: -6px;
  `:css`
    margin-left: -100%;
    left: 0%;
    top: 50%;
    margin-top: -6px;
  `}
`;

const SliderProgress = styled.div`
  position:absolute;
  top: 0;
  left: 0;
  height:100%;
  width: 100%;
  background-image: linear-gradient(to right, #ff4295 0%, #ff292c 100%);
`;

