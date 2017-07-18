import React from "react";
import { FormattedMessage } from 'react-intl';
import { Link } from "react-router";

import { backend } from "carbon-api";
import { handles, Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "../shared/FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import { AccountAction } from "../account/AccountActions";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";

export default class LandingPage extends RouteComponent<IRouteComponentProps>{
    lastTimestamp: number = 0;

    sections: any[];
    backgrounds: any[];
    activeSection: any;
    currentSectionClass: any;


    _onScroll = (event) => {
        var scrollTop = document.body.scrollTop

        var found = false;
        for (var i = this.sections.length - 1; i >= 0; --i) {
            var section = this.sections[i];
            if (section.offsetTop <= scrollTop) {
                this.activeSection = section;
                found = true;
                break;
            }
        }

        if (this.activeSection) {
            for (let j = 1; j < this.backgrounds.length; ++j) {
                this.backgrounds[j].style.opacity = 0;
            }
        }


        if (!found) {
            if (this.activeSection) {
                this.backgrounds[0].style.opacity = 1;
            }
            this.activeSection = null;

            return;
        }

        var height = window.innerHeight;


        for (var k = 0; k < this.sections.length; ++k) {
            let section: any = this.sections[k];
            var ds = scrollTop - section.offsetTop;
            if (ds < -height || ds > height) {
                this.backgrounds[k].style.opacity = 0;
                continue;
            }

            var opacity = 0;
            if (ds < 0) {
                opacity = (height + ds) / height;
            } else {
                opacity = ds / height;
            }

            this.backgrounds[k].style.opacity = opacity;
        }

        this.backgrounds[i].style.opacity = 1;
        (this.refs.section1 as any).classList.remove("first-section");

    }

    componentDidMount() {
        super.componentDidMount();
        window.addEventListener("scroll", this._onScroll)
        this.sections = [this.refs.section1, this.refs.section2, this.refs.section3];
        this.backgrounds = [this.refs.background1, this.refs.background2, this.refs.background3];
        for (let j = 0; j < this.backgrounds.length; ++j) {
            this.backgrounds[j].style.opacity = 0;
            this.backgrounds[j].style.zIndex = 10 + j;
        }
        this.backgrounds[0].style.opacity = 1;
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

            <div ref="background1" className="page-background green-section"></div>
            <div ref="background2" className="page-background blue-section"></div>
            <div ref="background3" className="page-background purple-section"></div>
            {/* <div ref="background4" className="page-background yellow-section"></div> */}
            {/* <div ref="background5" className="page-background red-section"></div> */}
            <section ref="heroContainer" className="hero-container">
                <nav className="header-container">

                    <a href="/" className="header-container__logo" title="carbonium.io"></a>

                    <ul className="navigation-menu">
                        <li className="navigation-menu__item"><CarbonLabel id="@nav.communitylibrary" /></li>
                        <li className="navigation-menu__item"><a target="_blank" href="https://carboniumteam.slack.com/signup"><CarbonLabel id="@nav.teamslack" /></a></li>
                        <li className="navigation-menu__item"><a target="_blank" href="https://github.com/CarbonDesigns/carbon-ui"><CarbonLabel id="@nav.github" /></a></li>
                        <li className="navigation-menu__item navigation-menu__item_button">{backend.isLoggedIn() && !backend.isGuest() ? this._renderLogoutButton() : this._renderLoginFlyout()}</li>
                    </ul>
                </nav>

                {/* <canvas ref="backCanvas" className="hero-container__canvas"></canvas> */}
                <div className="hero-container__canvas"></div>
                <header className="hero-container__heading">
                    <h1 className="hero-container__hero-title"><CarbonLabel id="@hero.title" /></h1>
                    <strong className="hero-container__hero-subtitle"><CarbonLabel id="@hero.subtitle" /></strong>
                </header>
                <figure className="hero-container__preview"></figure>
            </section>
            <section className="subscribe-container">
                <p className="subscribe-container__details"><CarbonLabel id="@subscribe.details" /></p>
                <form className="subscribe-form">
                    <input type="text" className="subscribe-form__email" placeholder="Your email address" />
                    <button className="subscribe-form__button"><CarbonLabel id="@subscribe" /></button>
                </form>
            </section>
            <section ref="section1" className="feature-section first-section">
                <div className="feature-section__description">
                    <div className="feature-section__index">01</div>
                    <div className="feature-section__symbol">Li</div>
                    <h1 className="feature-section__header">Symbols library</h1>
                    <article>
                        <div className="feature-section__details">
                            Go from blank page to a brilliant with help of the worlds top designers.
                        </div>
                        <ul className="feature-section__list">
                            <li className="feature-section__list-item">Use stencils, icons and much more  from the reach community gallery</li>
                            <li className="feature-section__list-item">Make and share symbols from any selection</li>
                            <li className="feature-section__list-item">Define your design language, use it in the team or share it globally.</li>
                        </ul>
                    </article>
                </div>
                <div className="feature-section__image symbols-image"></div>
            </section>

            <section ref="section2" className="feature-section" >
                <div className="feature-section__description">
                    <div className="feature-section__index">02</div>
                    <div className="feature-section__symbol">Da</div>
                    <h1 className="feature-section__header">Data generation</h1>
                    <article>
                        <div className="feature-section__details">
                            Design with data in mind. Fill your design with meaningful content.
                        </div>
                        <ul className="feature-section__list">
                            <li className="feature-section__list-item">Quickly populate designs with realistic data</li>
                            <li className="feature-section__list-item">Draw once, repeat as needed</li>
                            <li className="feature-section__list-item">Create your own datasets or connect with real-time data with JSON and Web API</li>
                        </ul>
                    </article>
                </div>
                <div className="feature-section__image">image</div>
            </section>

            <section ref="section3" className="feature-section" >
                <div className="feature-section__description">
                    <div className="feature-section__index">03</div>
                    <div className="feature-section__symbol">Pu</div>
                    <h1 className="feature-section__header">Plugins</h1>
                    <article>
                        <div className="feature-section__details">
                            With unique extensibility technology do amazing things while staying in the absolutely safe environment.
                        </div>
                        <ul className="feature-section__list">
                            <li className="feature-section__list-item">Automate repetitive tasks</li>
                            <li className="feature-section__list-item">Integrate with other services</li>
                            <li className="feature-section__list-item">Use any extension published by community.</li>
                        </ul>
                    </article>
                </div>
                <div className="feature-section__image">image</div>
            </section>
            <section className="quote-container">
                <article> Carbonium is open source. Help us make it better! Join us on <a target="_blank" href="https://github.com/CarbonDesigns/carbon-ui">GitHub</a></article>
            </section>
            <section className="subscribe-container">
                <p className="subscribe-container__details"><CarbonLabel id="@subscribe.details2" /></p>
                <form className="subscribe-form">
                    <input type="text" className="subscribe-form__email" placeholder="Your email address" />
                    <button className="subscribe-form__button"><CarbonLabel id="@subscribe" /></button>
                </form>
            </section>
        </div>;
    }
}