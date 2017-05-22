import React from "react";
import {app, backend, ShareProxy} from "carbon-core";
import {Component} from "../../../CarbonFlux";
import {jquery as $} from "carbon-core";
import {GuiButton, GuiInput} from "../../../shared/ui/GuiComponents";
import {Markup, MarkupLine}  from "../../../shared/ui/Markup";
// import qrcode from "jquery.qrcode";
import cx from 'classnames';
import {FormattedMessage} from "react-intl"
import {BladeBody}  from "../BladePage";
import QRCode from "qrcode.react";

var qrcode_size = 256;

export default class MirroringBlade extends Component {

    constructor() {
        super();

        var code = app.mirroringCode();
        this.state = {code: this._getUrlFromCode(code)};
    }

    _getCode = (enable)=> {
        ShareProxy.mirrorCode(app.companyId(), app.id(), enable)
            .then(data => {
                this.setState({code:this._getUrlFromCode(data.code)});
                app.mirroringCode(data.code);
            }).catch(
            e=> {
                console.error(e)
            }
        );
    };

    _removeCode = ()=> {
        ShareProxy.disableMirroring(app.companyId(), app.id())
            .then(() => {
                this.setState({code: null});
                app.mirroringCode(null);
            }).catch(
            e=> {
                console.error(e)
            }
        );
    };

    _getUrlFromCode(code) {
        if(!code) {
            return null;
        }

        var hasPort = window.location.port && window.location.port !== 80;
        var url = window.location.protocol + "//" + window.location.hostname + (hasPort?(":" + window.location.port):'') + "/m/" + code;

        return url;
    }

    componentDidUpdate() {
        if (this.props.visible) {
            this._getCode(false);
        }
    }

    render() {
        // style={/*{minHeight: (qrcode_size+'px'), minWidth: (qrcode_size+'px')}*/}
         if (this.state.code) {
            return (<BladeBody>
                <MarkupLine>
                    <FormattedMessage tagName="p" id="mirroringblade.scancodehelp"/>
                </MarkupLine>

                <figure>
                    <MarkupLine>
                        <QRCode value={this.state.code} size={256} bgColor="rgba(0,0,0,0)" fgColor="#fff"/>
                    </MarkupLine>
                </figure>

                <MarkupLine>
                    <GuiInput  caption="mirroring.urllabel" defaultMessage="Mirror URL" value={this.state.code} disabled={true}/>
                </MarkupLine>

                <MarkupLine>
                    <GuiButton mods="submit"  onClick={this._removeCode} caption="btn.disableMirroring" defaultMessage="Disable" icon={true}/>
                </MarkupLine>

            </BladeBody>)
        }
        else {
            return (<div>
                <MarkupLine className="form_message">
                    <FormattedMessage id="mirroringblade.helptext"/>
                </MarkupLine>

                <MarkupLine>
                    <GuiButton mods="submit"  onClick={()=>this._getCode(true)} caption="btn.enableMirroring" defaultMessage="Enable" />
                </MarkupLine>
            </div>)
        }

    }
}
