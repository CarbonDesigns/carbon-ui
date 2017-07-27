import React, { PropTypes } from "react";
import ReactDom from "react-dom";
import { util } from "carbon-core";
import cx from "classnames";
import { Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "./FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import bem from "../utils/commonUtils";
import { backend } from "carbon-api";

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
        var email = this.refs.input.value;
        backend.activityProxy.subscribeForBeta(email).then(()=>{
            this.setState({subscribed:true});
        })
    }

    render() {

        return <section className="subscribe-container">
                <p className="subscribe-container__details"><CarbonLabel id={this.props.mainTextLabelId} /></p>
                <div className="subscribe-form">
                    <input ref="input" type="text" className="subscribe-form__email" placeholder={this.context.intl.formatMessage({id:"@email.placeholder"})} />
                    <button onClick={this._onSubmit} className="subscribe-form__button form-main-button"><CarbonLabel id="@subscribe" /></button>
                </div>
            </section>
    }
}
