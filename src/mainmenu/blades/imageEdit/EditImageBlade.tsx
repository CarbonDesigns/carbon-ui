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
import { IUIElement, IPage, IArtboard, app, IRect, Workspace } from "carbon-core";
import { FormattedMessage } from "react-intl";
import { ArtboardSelect } from "../../../shared/ui/GuiSelect";
import { BladeBody } from "../BladePage";

export type EditImageResult =
    {type: "url", url: string} |
    {type: "dataUrl", dataUrl: string} |
    {type: "element", element: IUIElement} |
    {type: "none"};

interface IEditImageBladeProps {
    image?: string;
    dpr: number;
    previewSize: IRect;
    allowCropping?: boolean;
    defaultTab?: "crop" | "choose";
    page?: IPage;
    onComplete: (result: EditImageResult) => void;
}

interface IEditImageBladeState {
    tabId: string;
    image?: string;
    error?: string;
    loading? : boolean;
}

function b(a,b?,c?) {return bem("edit-image", a,b,c)}

export default class EditImageBlade extends Component<IEditImageBladeProps, IEditImageBladeState> {
    refs: {
        dropzone: ImageDropzone;
        container: TabContainer;
        cropEditor: CropEditor;
    }

    constructor(props: IEditImageBladeProps) {
        super(props);

        let tabId = "2";
        if (props.defaultTab !== "choose" && props.allowCropping && props.image) {
            tabId = "1";
        }

        this.state = {
            tabId,
            image: props.image
        };
    }

    _changeTab(tab) {
        this.setState({tabId: "1"});
    }

    private getArtboards() {
        if (this.props.page) {
            return this.props.page.getAllArtboards();
        }
        return app.getAllArtboards()
    }

    private artboardChosen = (artboard: IArtboard) => {
        this.saveImageOption({type: "element", element: artboard});
    }

    private saveImageOption(result: EditImageResult) {
        //todo - also cancel current dropzone upload
        if (this.props.allowCropping) {
            let image = this.getImageUrl(result);
            this.setState({tabId: "1", image: image || this.state.image});
        }
        else {
            this.props.onComplete(result);
        }
    }

    private getImageUrl(result: EditImageResult) {
        switch (result.type) {
            case "element":
                return Workspace.view.renderElementToDataUrl(result.element, this.props.previewSize, this.props.dpr);
            case "dataUrl":
                return result.dataUrl;
            case "url":
                return result.url;
            case "none":
                return null;
        }
        assertNever(result);
    }

    //——————————————————————————————————————————————————————————————————————
    // Tab 1 (Edit)
    //——————————————————————————————————————————————————————————————————————

    private saveCropped = () => {
        this.props.onComplete({type: "dataUrl", dataUrl: this.refs.cropEditor.toDataUrl()})
    };
    private changeImage = (ev) => {
        this.setState({"tabId": "2"});
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

    _renderEditTab() {
        return  <TabPage tabId="1" className="gui-page">
            <MarkupLine>
                <CropEditor ref="cropEditor" image={this.state.image} dpr={this.props.dpr}/>
            </MarkupLine>

            <MarkupSubmit>
                <GuiButtonBlock mods="equal">
                    <GuiButton
                        onClick={this.saveCropped}
                        mods="submit"
                        caption="@saveImage"
                    />
                    <GuiButton
                        onClick={this.changeImage}
                        mods="hover-white"
                        caption="@changeImage"
                    />
                </GuiButtonBlock>
            </MarkupSubmit>
        </TabPage>
    }

    _renderUploadTab() {
        var loading = this.state.loading;

        var use_url_error = (this.state.error == null) ? null :
            <div className='gui-input__error-tooltip' onClick={(ev)=>this._hideUseUrlError()}>
                <p>{this.state.error}</p>
            </div>
        ;

        return <TabPage tabId="2" className={b('upload-page', {loading}, 'gui-page')}>
            <MarkupLine className="edit-image__make-snapshot" onClick={this._hideAllErrors}>
                <p className="edit-image__message">
                    <FormattedMessage id="@imageEdit.artboardSnapshot"/>
                </p>

                <div className="gui-input">
                    <ArtboardSelect
                        className="drop_down"
                        caption="@chooseArtboard"
                        items={this.getArtboards()}
                        renderItem={artboard => <p>{artboard.name()}</p>}
                        onSelect={this.artboardChosen}>
                    </ArtboardSelect>
                </div>
            </MarkupLine>

            <MarkupLine>{ separatorOr("or") }</MarkupLine>
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
                    <FormattedMessage id="@imageEdit.pasteUrl"/>
                </p>

                <GuiButtonedInput className="edit-image__paste-url-input">
                    <GuiInput
                        placeholder="http://example.com/image.png"
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

            { (this.state.image || !this.props.allowCropping) &&
                <MarkupSubmit>
                    <GuiButton
                        mods="hover-cancel"
                        onClick={() => this.saveImageOption({type: "none"})}
                        caption="@cancel"
                    />
                </MarkupSubmit>
            }
        </TabPage>
    }

    render(){
        return <BladeBody>
            <div className="edit-image">
                <TabContainer currentTabId={this.state.tabId} type="normal" ref="container">
                    <TabArea className="gui-pages">
                        {this._renderEditTab()}
                        {this._renderUploadTab()}
                    </TabArea>
                </TabContainer>
            </div>
        </BladeBody>
    }

    static contextTypes = {
        intl: React.PropTypes.object,
        bladeContainer: React.PropTypes.any
    }
}




