import React from "react";
import ReactDom from "react-dom";
import {FormattedMessage} from "react-intl"

import {Component} from "../../CarbonFlux";
import {app, backend} from "carbon-core";
import {GuiButton, GuiSlider, GuiInput, GuiButtonedInput, GuiButtonBlock} from "../../shared/ui/GuiComponents";
import {MarkupSubmit, MarkupLine}  from "../../shared/ui/Markup";
import {BladeBody}  from "./BladePage";
import {default as TabContainer, TabArea, TabPage} from "../../shared/TabContainer";
import bem from 'bem';
import separatorOr from "../../shared/SeparatorOr";
import {say, ico} from "../../shared/Utils";
import Dropzone from "dropzone";

function b(a,b?,c?) {return bem("edit-image", a,b,c)}

var AVATAR_URL = '/target/res/avas/project-ava.jpg';


class ImageDropzone extends Component<any, any> {
    private dropzone: Dropzone;
    refs: {
        dropzone: HTMLElement;
        dropzone_output: HTMLElement;
    }

    constructor(props) {
        super(props);
        this.state = {
            progress   : null,
            error_text : null,
            is_loading : false
        }
    }
    _showUpload()      {
        this.setState({is_loading : true});
    }
    _hideUpload()          {
        this.setState({is_loading : false});
    }
    _showUploadError(text) {
        this.setState({error_text : text, progress   : null});
    }
    _hideUploadError = () =>{
        this.setState({
            error_text : null,
            progress   : null,
        });
    }
    _cancel_current_upload()  {
        //todo something_else
        this.setState({
            is_loading : false,
            progress   : null
        });
    }

    _startUploadingUrl() {
        //fixme make promise
        this._showUpload();

        var progress = this._setProgress;
        setTimeout(function(){progress(10)}, 150    );
        setTimeout(function(){progress(20)}, 150 * 2);
        setTimeout(function(){progress(30)}, 150 * 3);
        setTimeout(function(){progress(40)}, 150 * 4);
        setTimeout(function(){progress(50)}, 150 * 5);
        setTimeout(function(){progress(60)}, 150 * 6);
        setTimeout(function(){progress(70)}, 150 * 7);
        setTimeout(function(){progress(80)}, 150 * 8);
        setTimeout(function(){progress(90)}, 150 * 9);
        setTimeout(function(){progress(100)}, 150 * 10);

        setTimeout(()=>{
            this._hideUpload();
            var ok = false;
            if (ok) { this._whenUploadSuccess();                     }
            else    { this._whenUploadError("Fuckup on url upload"); }
        }, 1650);
    }

    _clickOnDropzone = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        if (this.state.error_text) {
            this._hideUploadError();
            return false;
        }
        else {
            this._startUploadingUrl(); // todo replace with proper function
        }
    };

    _setProgress = (progress) => {
        this.setState({progress});
    };

    _whenUploadSuccess = () => {
        this.setState({progress : 100, is_loading : false});
        this.props.onSuccess();
    };
    _whenUploadError = (error_text) => {
        this._showUploadError(error_text);
        this.setState({progress : null, is_loading : false});
    };



    componentDidMount(){
        super.componentDidMount();
        this.dropzone = null;
        this._setupDropzone();
    }


    componentWillUnmount() {
        super.componentWillUnmount();
        this.dropzone.destroy();
    }



    _setupDropzone(){
        var handlers = {
            addedfile: function(file){
            },
            uploadprogress: function(file, progress){
            },
            removedfile: function(file){
            },
            success: function(file, response){
            },
            error: function(file){
            },
            dragover: this._hideUploadError,
            drop: this._hideUploadError,
        };

        var config = {
            init : function(){
                for (var eventName in handlers) if (handlers.hasOwnProperty(eventName)) {
                    this.on(eventName, handlers[eventName]);
                }
            },
            url                   : backend.servicesEndpoint + "/api/file/upload",
            headers               : backend.getAuthorizationHeaders(),
            acceptedFiles         : "image/*",
            params                : { companyId: backend.getUserId()},
            createImageThumbnails : false,
            addRemoveLinks        : false,
            // clickable             : ".library-page__upload .zone",
            previewTemplate       : '<div></div>',
            previewsContainer     : this.refs.dropzone_output,
            // previewsContainer     : ".user-images .dropzone .zone",
        };

        Dropzone.autoDiscover = false;
        this.dropzone = new Dropzone(this.refs.dropzone, config);
    }

    render(){
        var dropzone_error = this.state.error_text;
        var dropzone_progress = this.state.progress;
        var cn = b('dropzone', {
            loading : this.state.is_loading,
            error   : dropzone_error != null
        });
        return (<div ref="dropzone" className={cn} onClick={this._clickOnDropzone} >
                <div className={b('dropzone-bg')}></div>
                <div className={b('dropzone-progress')}>
                    <div className={b('dropzone-progress-bar')} style={{width: dropzone_progress||0 + '%'}}></div>
                </div>
                <div className={b('dropzone-content')}>
                    <div className={b('dropzone-info')}>
                        <div className={b('dropzone-info-icon')}>
                            {ico('upload-alt')}
                        </div>
                        <p className={b('dropzone-info-message')}>
                            {say("Upload from computer")}
                        </p>
                    </div>
                </div>
                <div style={{display:'none'}} ref="dropzone_output"></div>
                {
                    dropzone_error != null &&
                    <div className={b('dropzone-error')}>
                        <p className={b('dropzone-error-message')}>{dropzone_error}</p>
                        {/*<div className={b('dropzone-error-closer')} onClick={()=>this._hideUploadError()}><i className="closer"/></div> */}
                    </div>
                }
            </div>
        )
    }
}


class CropEditor extends Component<any, any> {
    [x: string]: any;

    constructor(props) {
        super(props);

        //todo find max zoom from size of image and cropped area

        this.min_zoom = .2;
        this.max_zoom = 1.8;

        this.state = {
            slider_pos : .5,
            shift_x : 0,
            shift_y : 0
        };
    }

    _easing(pos) {
        return  pos * (this.max_zoom - this.min_zoom) + this.min_zoom
    }

    componentDidMount(){
        this._box = this.refs.box;
    }


    _onMouseDown=(ev)=>{

        ev.preventDefault();
        ev.stopPropagation();

        this._size_w = this._box.clientWidth;
        this._size_h = this._box.clientHeight;
        this._box_x = this._box.getBoundingClientRect().left;
        this._box_y = this._box.getBoundingClientRect().top;

        this.__x = this.state.shift_x - ev.clientX;
        this.__y = this.state.shift_y - ev.clientY;

        this._updatePositionFromEvent(ev);

        this._dragging = true;
        document.body.addEventListener("mousemove", this._onDrag);
        document.body.addEventListener("mouseup", this._onMouseUp);
    };

    _onMouseUp=()=>{
        this._dragging = false;
        document.body.removeEventListener("mousemove", this._onDrag);
        document.body.removeEventListener("mouseup", this._onMouseUp);
    };

    _onDrag=(ev)=>{
        if (this._dragging){
            var vx = ev.clientX - this._box_x;
            var vy = ev.clientY - this._box_y;

            if (!(vx<=this._size_w && vx>=0 &&
                  vy<=this._size_h && vy>=0)
            ) {
                this._onMouseUp();
            }
            else {
                this._updatePositionFromEvent(ev);
            }
        }
    };

    _onWheel=(ev)=>{
        ev.preventDefault();
        ev.stopPropagation();
        //from http://stackoverflow.com/questions/34790949/react-js-onwheel-bubbling-stoppropagation-not-working
        // const el = ReactDom.findDOMNode(this);
        // if (ev.nativeEvent.deltaY <= 0)
        //     {if (el.scrollTop <= 0) {ev.preventDefault();ev.stopPropagation();}}
        // else if (el.scrollTop + el.clientHeight >= el.scrollHeight)
        //     {ev.preventDefault(); ev.stopPropagation();}

        if (this._dragging){
            return false;
        }

        var new_pos;
        var delta = ev.nativeEvent.deltaY;

        new_pos = this.state.slider_pos  - (delta/100) * .1;
        new_pos = Math.max(new_pos, 0);
        new_pos = Math.min(new_pos, 1);
        console.log(ev.nativeEvent, new_pos, this.state.slider_pos);
        if (this.state.slider_pos != new_pos)
            this.setState({slider_pos : new_pos})

    };

    _updatePositionFromEvent=(ev)=>{
        this.setState({
            shift_x : ev.clientX  + this.__x,
            shift_y : ev.clientY  + this.__y
        });
    };

    render() {
        var image = this.props.image;

        var zoom = this._easing(this.state.slider_pos);

        var transform = [
            `translateY(${this.state.shift_y }px)`,
            `translateX(${this.state.shift_x }px)`,
            `translateY(-50%)`,
            `translateX(-50%)`,
            `scale(${zoom.toFixed(3)})`,
        ].join(' ');
        var pane_style = {
            padding : 80 + '%',
            transform
        };

        return <div className={b('crop-editor')} ref="box"
            onWheel={this._onWheel}
            onMouseDown={this._onMouseDown}
        >
        <div className={b('crop-area')}>
                <div className={b('crop-area-pane')} style={pane_style}>
                    <img className={b('crop-area-image')} src={image} />
                </div>
            </div>
            <div className={b('crop-area-zoom')}>
                <GuiSlider
                    value={this.state.slider_pos}
                    max={1}
                    min={0}
                    onValueUpdate={(value)=>this.setState({slider_pos: value})}
                />
            </div>
        </div>
    }
}


class EditImage extends Component<any, any> {
    refs: {
        dropzone: ImageDropzone;
        container: TabContainer;
    }

    constructor(props) {
        super(props);
        this.state = {
            error_use_url_text : null,
            paste_url_is_loading : null
        };
    }

    _changeTab(tab) {
        this.refs.container.changeTabById(tab+"");
    }


    //——————————————————————————————————————————————————————————————————————
    // Tab 1 (Edit)
    //——————————————————————————————————————————————————————————————————————

    _save = () => {
        this.context.bladeContainer.close(2);
    };
    _uploadAnotherImage = (ev) => {
        this._changeTab("2");
    };


    //——————————————————————————————————————————————————————————————————————
    // Tab 2 (upload)
    //——————————————————————————————————————————————————————————————————————

    _changeTab1 = () => {
        //hiding error messages
        this._hideAllErrors()

        this.refs.dropzone._cancel_current_upload();
        this._cancel_current_paste_url_upload();

        //and closing tab
        this._changeTab("1");
    };

    _hideAllErrors = () => {
        //hiding error messages
        this.refs.dropzone._hideUploadError();
        this._hideUseUrlError();
    };

    // Upload --------------------------
    _whenUploadSuccess = () => {
        this._changeTab1();
    };
    _whenUploadError = () => {
        //TODO: show error
    };

    // Use URI --------------------------

    _showUrlLoading()      {
        this.setState({paste_url_is_loading : true});
    }
    _hideUrlLoading()      { this.setState({paste_url_is_loading : false}); }

    _showUseUrlError(text) { this.setState({error_use_url_text : text}); }

    _hideUseUrlError()     { this.setState({error_use_url_text : null}); }

    _cancel_current_paste_url_upload()  {
        //something_else
        this._hideUrlLoading();
    }

    _startUploadingUrl() {
        //fixme add promise
        this._showUrlLoading();
        setTimeout(()=>{
            this._hideUrlLoading();
            var ok = false;
            if (ok) { this._whenUseUrlSuccess();                     }
            else    { this._whenUseUrlError("Fuckup on url upload"); }
        }, 1500);
    }

    _whenUseUrlSuccess = () => {
        this._changeTab1();
    };

    _whenUseUrlError = (error_message) => {
        this._showUseUrlError(error_message)
    };


    _onUseUrlClick = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (this.state.paste_url_is_loading) {
            return false;
        }
        this._startUploadingUrl();
        return false;
    };



    // Cancel Upload
    _cancelUpload = () => {
        //todo - also cancel current dropzone upload

        this._changeTab1();
    };


    _renderEditTab(image) {
        return  <TabPage tabId="1" className="gui-page">
            <MarkupLine>
                <CropEditor image={image}/>
            </MarkupLine>

            <MarkupSubmit>
                <GuiButtonBlock mods="equal">
                    <GuiButton
                        onClick={this._save}
                        mods="submit"
                        caption="@saveImage"
                    />
                    <GuiButton
                        onClick={this._uploadAnotherImage}
                        mods="hover-white"
                        caption="@uploadAnother"
                    />
                </GuiButtonBlock>
            </MarkupSubmit>
        </TabPage>
    }



    _renderUploadTab(image) {
        var is_loading_url = this.state.paste_url_is_loading;

        var use_url_error = (this.state.error_use_url_text == null) ? null :
            <div className='gui-input__error-tooltip' onClick={(ev)=>this._hideUseUrlError()}>
                <p>{this.state.error_use_url_text}</p>
            </div>
        ;

        return <TabPage tabId="2" className={b('upload-page', {loading : is_loading_url}, 'gui-page')}>
            <MarkupLine>
                <ImageDropzone
                    ref="dropzone"
                    onSuccess={this._whenUploadSuccess}
                    onError={this._whenUploadError}
                />
            </MarkupLine>

            <MarkupLine>{ separatorOr("or") }</MarkupLine>

            <MarkupLine className="edit-image__paste-url" onClick={this._hideAllErrors}>
                <p className="edit-image__message">
                    {say("paste url with image")}
                </p>

                <GuiButtonedInput className="edit-image__paste-url-input">
                    <GuiInput
                        placeholder="i.e. http://example.com/image.png"
                        suffix={use_url_error}
                    />
                    <GuiButton
                        icon="ok-white"
                        mods={[
                            is_loading_url ? "spinning" : "hover-success",
                            "square"
                        ]}
                        onClick={this._onUseUrlClick}
                    />
                </GuiButtonedInput>
            </MarkupLine>

            <MarkupLine>{ separatorOr("or") }</MarkupLine>

            <MarkupLine className="edit-image__make-snapshot" onClick={this._hideAllErrors}>
                <p className="edit-image__message">
                    {say("use page snapshot")}
                </p>

                <GuiButton
                    defaultMessage="Make snapshot"
                    mods={["hover-white", "full"]}
                    onClick={console.log}
                    caption="translateme!"
                />
            </MarkupLine>


            { !!image &&
                <MarkupSubmit>
                    <GuiButton
                        mods="hover-cancel"
                        onClick={this._cancelUpload}
                        caption="@cancel"
                    />
                </MarkupSubmit>
            }
        </TabPage>
    }



    render(){
        var image = this.props.image;

        return <div className="edit-image">
            <TabContainer defaultTabId={(!!image ? "1" : "2")} type="normal" ref="container">
                <TabArea className="gui-pages">
                    {this._renderEditTab(image)}
                    {this._renderUploadTab(image)}
                </TabArea>
            </TabContainer>
        </div>
    }

    static contextTypes = {
        intl: React.PropTypes.object,
        bladeContainer: React.PropTypes.any
    }
}




export default class EditImageBlade extends Component {
    render() {
        var image = AVATAR_URL;
        return <BladeBody>
            <EditImage image={image}/>
        </BladeBody>
    }

    static contextTypes = {
        intl: React.PropTypes.object,
        currentBladeId: React.PropTypes.number,
        bladeContainer: React.PropTypes.any
    }
}

