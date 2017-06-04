import React from "react";
import { Component } from "../../../CarbonFlux";
import ImageDropzone from "./ImageDropzone";
import TabContainer, { TabPage, TabArea } from "../../../shared/TabContainer";
import { GuiButtonBlock, GuiButtonedInput, GuiInput, GuiButton } from "../../../shared/ui/GuiComponents";
import { MarkupSubmit, MarkupLine } from "../../../shared/ui/Markup";
import { say } from "../../../shared/Utils";
import separatorOr from "../../../shared/SeparatorOr";
import CropEditor from "./CropEditor";
import bem from "../../../utils/commonUtils";

function b(a,b?,c?) {return bem("edit-image", a,b,c)}

interface IImageEditorProps {
    image: string;
    onComplete: (image: string) => void;
}

interface IEditImageBladeState {
    error : string;
    loading : boolean;
}

export default class ImageEditor extends Component<IImageEditorProps, IEditImageBladeState> {
    refs: {
        dropzone: ImageDropzone;
        container: TabContainer;
    }

    constructor(props) {
        super(props);
        this.state = {
            error : null,
            loading : null
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
        //this.props.onComplete(this.state.)
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

    _showUrlLoading() {
        this.setState({loading : true});
    }
    _hideUrlLoading()      { this.setState({loading : false}); }

    _showUseUrlError(text) { this.setState({error : text}); }

    _hideUseUrlError()     { this.setState({error : null}); }

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
        if (this.state.loading) {
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
        var loading = this.state.loading;

        var use_url_error = (this.state.error == null) ? null :
            <div className='gui-input__error-tooltip' onClick={(ev)=>this._hideUseUrlError()}>
                <p>{this.state.error}</p>
            </div>
        ;

        return <TabPage tabId="2" className={b('upload-page', {loading}, 'gui-page')}>
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
                            loading ? "spinning" : "hover-success",
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




