import React from "react";
import {FormattedMessage} from "react-intl"
import {backend, app} from "carbon-core";
import {GuiButton} from "../shared/ui/GuiComponents";

import {Markup, MarkupLine}  from "../shared/ui/Markup";
import { Component } from "../CarbonFlux";

export default class NotReady extends Component<any, any> {
    constructor(props){
        super(props);
        this.state = {notified:false}
    }

    _subscribe=()=>{
        backend.activityProxy.subscribeForFeature(app.companyId(), app.id, this.props.feature).then(()=>{
            this.setState({notified:true})
        });
    };

    render() {
        var cn = "markup not-ready-feature";
        return (
            <div className={cn}>
                <MarkupLine>
                    <FormattedMessage tagName="p" id="featurenotready"/>
                </MarkupLine>
                <MarkupLine>
                    {(this.state.notified)
                        ? <FormattedMessage tagName="p" id="notify.thankyou"/>
                        : <GuiButton mods="submit" onClick={this._subscribe} caption="btn.notifyfeature" defaultMessage="Notify me" icon={true}/>
                    }
                </MarkupLine>
            </div>
        )
    }
}
