import React, { PropTypes } from "react";
import ReactDom from "react-dom";
import { util } from "carbon-core";
import cx from "classnames";
import { Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "./FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import bem from "../utils/commonUtils";
import { backend } from "carbon-api";
import { ValidationTrigger, IFieldState, GuiValidatedInput } from "./ui/GuiComponents";

interface TopMenuProps extends IReactElementProps {
    mainTextLabelId: string;
}

export default class SubscribeForm extends Component<TopMenuProps, any>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props: TopMenuProps) {
        super(props);
    }

    _onSubmit=()=>{
        var input = (this.refs.input as any);
        var email = input.getValue();
        if(input.state.fieldState.status === "error" || !email) {
            return;
        }

        backend.activityProxy.subscribeForBeta(email).then(()=>{
            this.context.router.push({
                pathname:"/thankyou",
                state:{
                    header:"@message.thankyou",
                    message:"@message.wewillnotify"
                }
            })
        })
    }

    protected validateEmail = (email: string, state: ImmutableRecord<IFieldState>, force?: boolean) => {
        if (email && email.indexOf('@') < 0) {
            return state.set("status", "error").set("error", this.formatLabel("@account.badEmail"));
        }

        if (force && !email) {
            return state.set("status", "error").set("error", this.formatLabel("@account.noEmail"));
        }

        return state.set("status", "notReady");
    }

    render() {

        return <section className="subscribe-container">
                <p className="subscribe-container__details"><CarbonLabel id={this.props.mainTextLabelId} /></p>
                <div className="subscribe-form">
                    <GuiValidatedInput ref="input" id="email" autoFocus
                    component="fs-input"
                    placeholder={this.context.intl.formatMessage({id:"@email.placeholder"})}
                    onValidate={this.validateEmail}
                    className="subscribe-form__email"
                    type="email"
                    trigger={ValidationTrigger.blur} />

                    <button onClick={this._onSubmit} className="subscribe-form__button fs-main-button"><CarbonLabel id="@subscribe" /></button>
                </div>
            </section>
    }
}
