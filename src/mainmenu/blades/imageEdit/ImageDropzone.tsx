import React from "react";
import { Component } from "../../../CarbonFlux";
import Dropzone from "Dropzone";
import { backend } from "carbon-core";
import { ico, say } from "../../../shared/Utils";
import bem from "../../../utils/commonUtils";

function b(a,b?,c?) {return bem("edit-image", a,b,c)}

export default class ImageDropzone extends Component<any, any> {
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