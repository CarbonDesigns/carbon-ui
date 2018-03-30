import * as React from "react";
import { Component } from "../../../CarbonFlux";
import Dropzone, { DropzoneOptions } from "dropzone";
import { backend, ImagesResult, IDisposable } from "carbon-core";
import { ico, say } from "../../../shared/Utils";
import bem from "../../../utils/commonUtils";
import { FormattedMessage } from "react-intl";

function b(a, b?, c?) { return bem("edit-image", a, b, c) }

interface IImageDropzoneProps {
    onSuccess: (url: string) => void;
}
interface IImageDropzoneState {
    progress: number;
    errorText: string;
    loading: boolean;
}

export default class ImageDropzone extends Component<IImageDropzoneProps, IImageDropzoneState> {
    private backendToken: IDisposable;
    private dropzone: Dropzone;

    refs: {
        dropzone: HTMLElement;
        dropzoneOutput: HTMLElement;
    }

    constructor(props) {
        super(props);
        this.state = {
            progress: 0,
            errorText: null,
            loading: false
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.dropzone = null;
        this.setupDropzone();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.dropzone.destroy();

        if (this.backendToken){
            this.backendToken.dispose();
            this.backendToken = null;
        }
    }

    hideUploadError = () => {
        this.setState({
            errorText: null,
            progress: 0,
        });
    }

    private showUpload() {
        this.setState({ loading: true });
    }
    private hideUpload = () => {
        this.setState({ loading: false });
    }
    private showUploadError(text) {
        this.setState({ errorText: text, progress: 0 });
    }

    private onAddedFile = () => {
        this.showUpload();
        this.hideUploadError();
    }
    private onProgress = (file, progress) => {
        this.setState({ progress });
    };
    private onSuccess = (file, response: ImagesResult) => {
        this.setState({ progress: 100, loading: false });
        this.props.onSuccess(response.images[0].url);
    };
    private onError = (file, msg) => {
        this.showUploadError(msg);
        this.setState({ progress: 0, loading: false });
    };

    private setupDropzone() {
        let config: DropzoneOptions = {
            url: backend.servicesEndpoint + "/api/file/upload",
            headers: backend.getAuthorizationHeaders(),
            acceptedFiles: "image/*",
            params: { companyId: backend.getUserId() },
            createImageThumbnails: false,
            addRemoveLinks: false,
            previewTemplate: '<div></div>',
            previewsContainer: this.refs.dropzoneOutput,
            clickable: ".edit-image__dropzone-content",
            maxFiles: 1
        };

        Dropzone.autoDiscover = false;
        this.dropzone = new Dropzone(this.refs.dropzone, config);

        this.dropzone.on("uploadprogress", this.onProgress);
        this.dropzone.on("success", this.onSuccess);
        this.dropzone.on("error", this.onError);
        this.dropzone.on("complete", this.hideUpload);
        this.dropzone.on("addedfile", this.onAddedFile);
        this.dropzone.on("dragover", this.hideUploadError);
        this.dropzone.on("drop", this.hideUploadError);

        this.backendToken = backend.accessTokenChanged.bind(() =>
            this.dropzone['options'].headers = backend.getAuthorizationHeaders());
    }

    render() {
        var error = this.state.errorText;
        var hasError = !!error;
        var cn = b('dropzone', {
            loading: this.state.loading,
            error: hasError
        });
        return (<div ref="dropzone" className={cn}>
            <div className={b('dropzone-bg')}></div>
            <div className={b('dropzone-progress')}>
                <div className={b('dropzone-progress-bar')} style={{ width: this.state.progress + '%' }}></div>
            </div>
            <div className={b('dropzone-content')}>
                <div className={b('dropzone-info')}>
                    <div className={b('dropzone-info-icon')}>
                        {ico('upload-alt')}
                    </div>
                    <p className={b('dropzone-info-message')}>
                        <FormattedMessage id="@imageEdit.uploadImage" />
                    </p>
                </div>
            </div>
            <div style={{display: 'none'}} className="dz-message"></div>
            <div style={{ display: 'none' }} ref="dropzoneOutput"></div>
            {
                hasError &&
                <div className={b('dropzone-error')}>
                    <p className={b('dropzone-error-message')}>{error}</p>
                    {/*<div className={b('dropzone-error-closer')} onClick={()=>this._hideUploadError()}><i className="closer"/></div> */}
                </div>
            }
        </div>
        )
    }
}