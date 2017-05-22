import React from "react";
import {FormattedMessage} from "react-intl"
import {ActivityProxy, app} from "carbon-core";
import {GuiButton} from "../shared/ui/GuiComponents";

import {Markup, MarkupLine}  from "../shared/ui/Markup";

export default class NotReady extends React.Component {
    constructor(){
        super();
        this.state = {notified:false}
    }

    _subscribe=()=>{
        ActivityProxy.subscribeForFeature(app.companyId(), app.id(), this.props.feature).then(()=>{
            this.setState({notified:true})
        });
    };

    render() {
        var cn = "not-ready-feature";
        if (this.props.addMarkupClassName)
            cn += " markup";
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
