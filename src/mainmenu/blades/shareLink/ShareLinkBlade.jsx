import React from "react";
import cx from 'classnames';
import {GuiButton, GuiCheckbox, GuiInput} from "../../../shared/ui/GuiComponents";
import {Markup, MarkupLine}  from "../../../shared/ui/Markup";
import {BladePage, BladeBody}  from "../BladePage";
import {app, backend, ShareProxy} from "carbon-core";

export default class ShareLinkBlade extends React.Component {
    constructor(props) {
        super(props);
        this.state = {code: null};
    }

    _share = () => {
        backend.shareProxy.code(app.companyId(), app.id(), 2)
                  .then(data => this.setState({code: data.code}))
    };

    render() {
        return (
            <BladeBody>
                <MarkupLine>
                    <GuiButton mods="submit" onClick={this._share} caption="Generate code" defaultMessage="Generate code" icon={false}/>
                </MarkupLine>

                <MarkupLine>
                    {/*<input id="main-menu__project-url" type="text" value={location.origin + "/q/" + this.state.code} disabled/>*/}
                    <GuiInput value={location.origin + "/q/" + this.state.code} disabled={true}/>
                </MarkupLine>

                <MarkupLine>
                    <GuiCheckbox label="Allow solve comments" />
                </MarkupLine>

                {/* <MarkupLine>
                    <div className="cap">Post the link in socials</div>
                </MarkupLine>

                <MarkupLine>
                    <button>facebook</button>
                    <button>twitter</button>
                    <button>linkedin</button>
                </MarkupLine>*/}
            </BladeBody>
        )
    }
}
