import React from "react";
import BladePage from "../BladePage";
import {app, backend, ShareProxy} from "carbon-core";
import {Component} from "../../../CarbonFlux";
import cx from 'classnames';
import {FormattedMessage} from "react-intl"
import {GuiButton} from "../../../shared/ui/GuiComponents";
import StencilsActions from "../../../library/stencils/StencilsActions";
import {richApp} from "../../../RichApp";
import {MarkupSubmit, MarkupLine}  from "../../../shared/ui/Markup";
import {BladeBody}  from "../BladePage";

export default class ImportPageBlade extends Component {
    constructor() {
        super();
    }

    _importPage = ()=> {
        fetch(this.props.dataUrl).then(response=>response.json()).then(data=>{
            var page = app.importPage(data);
            richApp.dispatch(StencilsActions.changePage(page));
            this.context.bladeContainer.close(0);
        });
    }

    render() {
        return <BladeBody>
            <MarkupLine>
                <figure>
                    <div className="resource-import-details__gallery">
                        <div className="resource-import-details__slides">
                            {/* todo    If slide is active =>  .resource-import-details__slide_active  */}
                            <div className="resource-import-details__slide  resource-import-details__slide_active ">
                                <img ref="preview" src={this.props.imageUrl} className="resource-import-details__preview-img"/>
                            </div>
                            {/*<div className="resource-import-details__slide" style={{backgroundImage: `url('${this.props.imageUrl}')`, }}> */}
                            <div className="resource-import-details__slide" style={{backgroundImage: `url('${this.props.imageUrl}')`, }}>
                                <img ref="preview" src={this.props.imageUrl} className="resource-import-details__preview-img"/>
                            </div>
                        </div>

                        {/* todo    If thumbs.length >= 1*/}
                        <div className="resource-import-details__thumbs">
                            {/* todo    If thumb  is active =>  .resource-import-details__thumb_active  */}
                            <div className="resource-import-details__thumb  resource-import-details__thumb_active"  style={{backgroundImage: `url('${this.props.imageUrl}')`}} >
                            </div>
                            <div className="resource-import-details__thumb" style={{backgroundImage: `url('/target/1/image.png')`}} >
                            </div>
                            <div className="resource-import-details__thumb" style={{backgroundImage: `url('/target/2/image.png')`}} >
                            </div>
                        </div>
                    </div>
                </figure>
            </MarkupLine>

            <MarkupLine>
                <div className="markup-heading markup-heading_faded "><FormattedMessage id="sharepage.name" defaultMessage="Name"/></div>
                <div className="resource-import-details__name">{this.props.name}</div>
            </MarkupLine>

            <MarkupLine>
                <div className="markup-heading markup-heading_faded "><FormattedMessage id="=TRANSLATEME!!!" defaultMessage="Description"/></div>
                <p>{this.props.description || "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl."}</p>
            </MarkupLine>

            <MarkupLine>
                <div className="markup-heading markup-heading_faded "><FormattedMessage id="=TRANSLATEME!!!" defaultMessage="Author"/></div>
                <div className="resource-import-details__author">
                    <div className="resource-import-details__author-avatar" style={{backgroundImage: `url('${ this.props.authorAvatarUrl || "/target/1/image.png" }')`}}/>
                    <span className="resource-import-details__author-name">{this.props.authorName || "Boris"}</span>
                </div>
            </MarkupLine>

            <MarkupLine>
                <label className="gui-input">
                    <div className="markup-heading markup-heading_faded "><FormattedMessage id="sharepage.tags" defaultMessage="Tags"/></div>
                    <p className="resource-import-details__tags">
                        { this.props.tags  && <span className="resource-import-details__tag"><span className="resource-import-details__tag-title">{ this.props.tags }</span></span> }
                        <span className="resource-import-details__tag"><span className="resource-import-details__tag-title">Lorem ipsum 1</span></span>
                        <span className="resource-import-details__tag"><span className="resource-import-details__tag-title">Lorem ipsum 2</span></span>
                    </p>
                </label>
            </MarkupLine>

            <MarkupSubmit>
                <GuiButton mods="submit" onClick={this._importPage} caption="=TRANSLATEME!!!" defaultMessage="Import resource" icon={true} />
            </MarkupSubmit>
        </BladeBody>;
    }
}


ImportPageBlade.contextTypes = {
    currentBladeId: React.PropTypes.number,
    bladeContainer: React.PropTypes.any
};
