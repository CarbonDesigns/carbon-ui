import * as React from "react";
import * as ReactDom from "react-dom";
import * as cx from "classnames";
import styled, {css} from "styled-components";
import theme from "../theme";
import { RefObject } from "react";

interface ISliderProps {
  value?: number;
  vertical?: boolean;
  valueChanging?: (value: number) => number;
  valueChanged?: (value: number) => void;
}

export default class Slider extends React.Component<ISliderProps, any>{
  private slider: RefObject<HTMLDivElement>;
  private handle: RefObject<HTMLDivElement>;
  private progress: RefObject<HTMLDivElement>;
  private _size: number;
  private _offset: number;
  private _dragging: boolean;
  private _originalPosition: number;

  constructor(props) {
    super(props);
    this.state = { value: this.props.value || 0 }
    this.slider = React.createRef();
    this.handle = React.createRef();
    this.progress = React.createRef();
  }

  _onMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (this.props.vertical) {
      this._offset = this.slider.current.getBoundingClientRect().top;
      this._size = this.slider.current.clientHeight;
    } else {
      this._offset = this.slider.current.getBoundingClientRect().left;
      this._size = this.slider.current.clientWidth;
    }

    this._updatePositionFromEvent(event, false);
    this._handelMouseDown(event);
  }

  _handleDragging = (event) => {
    if (this._dragging) {
      this._updatePositionFromEvent(event, false);
    }
  }

  beginDeltaChange() {
    this.slider.current.classList.add("dragging");
  }

  endDeltaChange() {
    this.slider.current.classList.remove("dragging");
    delete this._originalPosition;
  }

  deltaChange(dv) {
    if (!this._originalPosition) {
      if (!this._size) {
        this._size = this.props.vertical ? this.slider.current.clientHeight : this.slider.current.clientWidth;
      }

      this._originalPosition = this.props.value / 100 * this._size;
    }

    var newPos = this._originalPosition + dv;
    this._updateFromPosition(newPos, true);
  }

  _updatePositionFromEvent = (event, final) => {
    var value = this.props.vertical ? (event.clientY - this._offset) : (event.clientX - this._offset);
    this._updateFromPosition(value, final);
  }

  _updateFromPosition(value, final) {
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
      this.progress.current.style.height = this.handle.current.style.top = percentPosition + '%';
    } else {
      this.progress.current.style.width = this.handle.current.style.left = percentPosition + '%';
    }

    if (final && this.props.valueChanged) {
      this.props.valueChanged(percentPosition);
    }
  }

  _handelMouseDown = (event) => {
    this._dragging = true;
    document.body.addEventListener("mousemove", this._handleDragging);
    document.body.addEventListener("mouseup", this._handelMouseUp);
    this.slider.current.classList.add("dragging");
  }

  _handelMouseUp = (event) => {
    this._dragging = false;
    document.body.removeEventListener("mousemove", this._handleDragging);
    document.body.removeEventListener("mouseup", this._handelMouseUp);
    this.slider.current.classList.remove("dragging");
    this._updatePositionFromEvent(event, true);
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

    return <SliderContainer onMouseDown={this._onMouseDown} vertical={this.props.vertical}>
      <SliderTrack ref={this.slider} vertical={this.props.vertical}>
        <SliderProgress style={progressStyle} ref={this.progress}/>
        <SliderHandle style={handleStyle} vertical={this.props.vertical} ref={this.handle} onMouseDown={this._handelMouseDown} />
      </SliderTrack>
    </SliderContainer>;
  }
}

var SliderContainer = styled.div<{vertical:boolean}>`
    position: relative;
    background:none;
    ${props=>props.vertical?css`width:32px;`:css`height:32px;`};
    overflow: hidden;
    cursor: pointer;
`;

const HandleSize = 12;
var SliderTrack = styled.div<{vertical:boolean}>`
  position: absolute;
  ${props=>props.vertical?css`
    top: ${HandleSize/2}px;
    left: 50%;
    bottom: ${HandleSize/2}px;
    width: 4px;
    margin-left: -2px;
  `:css`
    left: ${HandleSize/2}px;
    top: 50%;
    right: ${HandleSize/2}px;
    height: 4px;
    margin-top: -2px;
  `}
  background-color: ${theme.slider_track};
  transition: background 0.2s;
  box-shadow: 0 1px 3px rgba(1, 2, 3, 0.2) inset;
`;


var SliderHandle = styled.div<{vertical:boolean}>`
  border-radius: 100px;
  width: ${HandleSize}px;
  height: ${HandleSize}px;
  box-shadow: 0 1px 2px rgba(1, 2, 3, 0.28);
  border: 3px solid white;
  position: absolute;
  background: white;
  ${props=>props.vertical?css`
    margin-top:-${HandleSize/2}px;
    top: 0%;
    left: 50%;
    margin-left: -${HandleSize/2}px;
  `:css`
    margin-left: -${HandleSize/2}px;
    left: 0%;
    top: 50%;
    margin-top: -${HandleSize/2}px;
  `}
`;

const SliderProgress = styled.div`
  position:absolute;
  top: 0;
  left: 0;
  height:100%;
  width: 100%;
  background-color: ${theme.slider_progress};
`;

