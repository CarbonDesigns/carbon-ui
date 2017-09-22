import React from "react";
import ReactDom from "react-dom";
import cx from 'classnames';
export default class Slider extends React.Component{
    constructor(props){
        super(props);
        this.state={value:this.props.value||0}
    }

    _onMouseDown=(event)=>{
        event.preventDefault();
        event.stopPropagation();
        this._height = this._slider.clientHeight;
        this._offset = this._slider.getBoundingClientRect().top;
        this._updatePositionFromEvent(event);
    }

    _handleDragging=(event)=>{
        if(this._dragging){
            this._updatePositionFromEvent(event);
        }
    }

    _updatePositionFromEvent=(event)=>{
        var y = event.clientX - this._offset;
        var max = (y / this._height) * 100;

        if(max > 100) max = 100;
        else if(max < 0) max = 0;

        if(this.props.valueChanging) {
            max = this.props.valueChanging(max);
        }
        this._handle.style.left = max+'%';
        if(this.props.valueChanged) {
            this.props.valueChanged(max);
        }
    }

    _handelMouseDown=(event)=>{
        this._dragging = true;
        document.body.addEventListener("mousemove", this._handleDragging);
        document.body.addEventListener("mouseup", this._handelMouseUp);
    }

    _handelMouseUp=(event)=>{
        this._dragging = false;
        document.body.removeEventListener("mousemove", this._handleDragging);
        document.body.removeEventListener("mouseup", this._handelMouseUp);
    }

    componentDidMount(){
        this._handle = this.refs.handle;
        this._slider = this.refs.slider;
    }

    componentWillUnmount(){
        super.componentWillUnmount();
        delete this._handle;
        delete this._slider;
    }

    render(){

        var value = this.props.value || 0;
        if(value > 100) value = 100;
        else if(value < 0) value = 0;

        return (<div className="drop-slider drop-slider_vertical" onMouseDown={this._onMouseDown}>
            <div className="drop-slider__track" ref="slider">
                <div className="drop-slider__handle" style={{left:value+'%'}} ref="handle" onMouseDown={this._handelMouseDown} />
            </div>
        </div>);
    }
}
