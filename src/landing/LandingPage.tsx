import React from "react";
import { FormattedMessage } from 'react-intl';
import { Link } from "react-router";

import { backend } from "carbon-api";
import { handles, Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "../shared/FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import { AccountAction } from "../account/AccountActions";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import { IContext } from "carbon-core";

var gradientCanvas = document.createElement('canvas');
gradientCanvas.width = 1;
gradientCanvas.height = 100;
var gradientCtx = gradientCanvas.getContext('2d');
var grad = gradientCtx.createLinearGradient(0, 0, 1, 100);
grad.addColorStop(0, '#8D407E');
grad.addColorStop(0.5, '#130B46');
grad.addColorStop(0.999, '#6A889C');
grad.addColorStop(1, '#EBF0F3');

gradientCtx.fillStyle = grad;
gradientCtx.fillRect(0, 0, 1, 100);

var tmpSize = 256;

var gradData = gradientCtx.getImageData(0, 0, 1, 100);


var tmpCanvas = document.createElement('canvas');
tmpCanvas.width = tmpSize;
tmpCanvas.height = tmpSize;
var context = tmpCanvas.getContext('2d');


function getValue(x1, x2, a, b, c, d) {
    x1 = ((x1 - tmpSize / 2) / tmpSize) * 6 + a;
    x2 = ((x2 - tmpSize / 2) / tmpSize) * 6 + b;

    return x1 * x1 * x1 - x2 * x2 * x2 - 2 * x1 * x2 + 100 * c
}



function renderWithParameter(destContext, a, b, c, d) {
    let field = [];
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE / 2;

    for (let i = 0; i < tmpSize; ++i) {
        for (let j = 0; j < tmpSize; ++j) {
            let v = field[i * tmpSize + j] = getValue(i, j, a, b, c, d);
            min = Math.min(v, min);
            max = Math.max(v, max);
        }
    }

    for (let i = 0; i < field.length; ++i) {
        field[i] = Math.round((field[i] - min) * 99 / (max - min));
    }


    let destData = context.createImageData(tmpSize, tmpSize);
    for (let i = 0; i < tmpSize; ++i) {
        for (var j = 0; j < tmpSize; ++j) {
            let v = field[i * tmpSize + j];
            let red = gradData.data[v * 4 + 0];
            let green = gradData.data[v * 4 + 1];
            let blue = gradData.data[v * 4 + 2];

            destData.data[(i * tmpSize + j) * 4 + 0] = red;
            destData.data[(i * tmpSize + j) * 4 + 1] = green;
            destData.data[(i * tmpSize + j) * 4 + 2] = blue;
            destData.data[(i * tmpSize + j) * 4 + 3] = 255;
        }
    }
    destContext.filter = "blur(15px)";
    context.putImageData(destData, 0, 0);
    destContext.drawImage(tmpCanvas, 0, 0, tmpSize, tmpSize, 0, 0, destContext.canvas.width, destContext.canvas.height)
}

var maxIteration = 500;
var iteration = maxIteration;
var destA, destB, destC, destD;
var a = 0, b = 0, c = 1, d = 1;
var stepA = 0, stepB = 0, stepС = 0, stepD = 0;

export default class LandingPage extends RouteComponent<IRouteComponentProps>{
    destContext: IContext;
    lastTimestamp: number = 0;
    _renderLoop = (timestamp) => {
        if (!this.destContext) {
            return;
        }

        if (timestamp - this.lastTimestamp > 30) {
            this.lastTimestamp = timestamp;
            this.destContext.canvas.width = (this.refs.heroContainer as any).clientWidth;
            this.destContext.canvas.height = (this.refs.heroContainer as any).clientHeight;

            renderWithParameter(this.destContext, a, b, c / 15, d / 15);
            iteration++;
            a += stepA;
            b += stepB;
            c += stepС;
            d += stepD;
            if (iteration > maxIteration) {
                iteration = 0;
                destA = Math.floor((Math.random() * 30) - 15);
                destB = Math.floor((Math.random() * 30) - 15);

                destC = Math.floor((Math.random() * 30) - 15);
                destD = Math.floor((Math.random() * 30) - 15);
                stepA = (destA - a) / maxIteration;
                stepB = (destB - b) / maxIteration;
                stepС = (destC - c) / maxIteration;
                stepD = (destD - d) / maxIteration;
            }
        }
        window.requestAnimationFrame(this._renderLoop);
    }

    componentDidMount() {
        super.componentDidMount();
        var canvas: any = this.refs.backCanvas;
        this.destContext = (canvas as any).getContext('2d');

        canvas.width = (this.refs.heroContainer as any).clientWidth;
        canvas.height = (this.refs.heroContainer as any).clientHeight;

        window.requestAnimationFrame(this._renderLoop);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.destContext = null;
    }

    _renderLoginButton() {
        return <CarbonLabel id="@nav.login" />;
    }
    _renderLoginFlyout() {
        return <FlyoutButton className="login-flyout" renderContent={this._renderLoginButton}
            position={{ targetVertical: "bottom", targetHorizontal: "right", disableAutoClose: true }}>
            <div id="login">
                <LoginPopup />
            </div>
        </FlyoutButton>
    }
    _renderLogoutButton() {
        return <div className="gui-button">
            <button href="#" onClick={this._logout}><span>Log out</span></button>
        </div>;
    }

    _logout = () => {
        backend.logout().then(() => this.goHome());
    };

    canHandleActions() {
        return true;
    }

    onAction(action: AccountAction) {
        if (action.type === "Account_LoginResponse" && action.response.ok === true) {
            this.goToDashboard(action.response.result.companyName, action.response.result.userId);
            return;
        }
    }

    // _renderSignup(){
    //     return  <FlyoutButton
    //             className="signup__button"
    //             content={<FormattedMessage id="Sign up" tagName="p"/>}
    //             position={{
    //                 targetVertical: "bottom",
    //                 disableAutoClose: true
    //             }}
    //         >
    //             <div id="register">
    //                 <RegistrationPopup/>
    //             </div>
    //     </FlyoutButton>
    // }

    render() {
        return <div className="landing-page">
            {/* <div><span style={{ color: "aqua", fontSize: 32 }}>Landing page</span></div>

            {backend.isLoggedIn() && !backend.isGuest() ? this._renderLogoutButton() : this._renderLoginFlyout()}

            <div className="gui-button">
                <Link to="/app"><FormattedMessage id="StartDesigning" defaultMessage="Start designing" /></Link>
            </div> */}
            <nav className="header-container">

                <a href="/" className="header-container__logo" title="carbonium.io"></a>

                <ul className="navigation-menu">
                    <li className="navigation-menu__item"><CarbonLabel id="@nav.communitylibrary" /></li>
                    <li className="navigation-menu__item"><a target="_blank" href="https://carboniumteam.slack.com/signup"><CarbonLabel id="@nav.teamslack" /></a></li>
                    <li className="navigation-menu__item"><a target="_blank" href="https://github.com/CarbonDesigns/carbon-ui"><CarbonLabel id="@nav.github" /></a></li>
                    <li className="navigation-menu__item navigation-menu__item_button">{backend.isLoggedIn() && !backend.isGuest() ? this._renderLogoutButton() : this._renderLoginFlyout()}</li>
                </ul>
            </nav>

            <section ref="heroContainer" className="hero-container">
                <canvas ref="backCanvas" className="hero-container__canvas"></canvas>
                <header className="hero-container__heading">
                    <h1 className="hero-container__hero-title"><CarbonLabel id="@hero.title" /></h1>
                    <strong className="hero-container__hero-subtitle"><CarbonLabel id="@hero.subtitle" /></strong>
                </header>
            </section>
            <section className="subscribe-container">
                <p className="subscribe-container__details"><CarbonLabel id="@subscribe.details" /></p>
                <form className="subscribe-form">
                    <input type="text" className="subscribe-form__email" placeholder="Your email address" />
                    <button className="subscribe-form__button"><CarbonLabel id="@subscribe" /></button>
                </form>
            </section>
        </div>;
    }
}