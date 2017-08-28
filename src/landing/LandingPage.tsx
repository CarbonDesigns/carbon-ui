import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from 'react-intl';
import { Link } from "react-router";
import cx from "classnames";

import { backend } from "carbon-api";
import { handles, Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "../shared/FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import { AccountAction } from "../account/AccountActions";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import TopMenu from "../shared/TopMenu";
import SubscribeForm from "../shared/SubscribeForm";


function FeatureSection(props) {
    var cn = cx("feature-section", props.className);
    return <section className={cn}>
        <div className="feature-section__description">
            <div className="feature-section__index">{props.index}</div>
            <div className="feature-section__symbol">{props.symbol}</div>
            <h1 className="feature-section__header"><CarbonLabel id={props.headerLabel} /></h1>
            <article>
                <div className="feature-section__details">
                    <CarbonLabel id={props.detailsLabel} />
                </div>
                <ul className="feature-section__list">
                    <li className="feature-section__list-item"><CarbonLabel id={props.p1Label} /></li>
                    <li className="feature-section__list-item"><CarbonLabel id={props.p2Label} /></li>
                    <li className="feature-section__list-item"><CarbonLabel id={props.p3Label} /></li>
                </ul>
            </article>
        </div>
        <div className={cx("feature-section__image", props.imageClass)}></div>
    </section>;
}

export default class LandingPage extends RouteComponent<IRouteComponentProps>{
    lastTimestamp: number = 0;

    sections: any;
    backgrounds: any[];
    activeSection: any;
    currentSectionClass: any;

    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }


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

        if (!found) {
            if (this.activeSection) {
                for (let j = 1; j < this.backgrounds.length; ++j) {
                    this.backgrounds[j].style.opacity = 0;
                }
                this.backgrounds[0].style.opacity = 1;
            }
            this.activeSection = null;

            return;
        }

        var height = window.innerHeight;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            height = screen.height;
        }

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
                opacity = 1 - ds / height;
            }

            this.backgrounds[k].style.opacity = opacity;
        }

        //this.backgrounds[i].style.opacity = 1;
    }

    componentDidMount() {
        super.componentDidMount();
        window.addEventListener("scroll", this._onScroll)
        this.sections = document.querySelectorAll(".feature-section");
        this.backgrounds = [this.refs.background1, this.refs.background2, this.refs.background3];
        for (let j = 0; j < this.backgrounds.length; ++j) {
            this.backgrounds[j].style.opacity = 0;
            this.backgrounds[j].style.zIndex = 10 + j;
        }
        this.backgrounds[0].style.opacity = 1;
    }

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
            <div ref="background1" className="page-background green-section"></div>
            <div ref="background2" className="page-background blue-section"></div>
            <div ref="background3" className="page-background purple-section"></div>
            {/* <div ref="background4" className="page-background yellow-section"></div> */}
            {/* <div ref="background5" className="page-background red-section"></div> */}
            <section ref="heroContainer" className="hero-container">
                <TopMenu location={this.props.location} />

                {/* <canvas ref="backCanvas" className="hero-container__canvas"></canvas> */}
                <div className="hero-container__canvas"></div>
                <header className="hero-container__heading">
                    <h1 className="hero-container__hero-title"><CarbonLabel id="@hero.title" /></h1>
                    <strong className="hero-container__hero-subtitle"><CarbonLabel id="@hero.subtitle" /></strong>
                </header>
                <div className="hero-container__preview">
                    <div className="hero-container__preview-image">
                        <figure className="play-button">
                            <div className="play-button__icon"></div>
                        </figure>
                    </div>
                </div>

                <h3 className="hero-container__subheading"><CarbonLabel id="@hero.subheading" /></h3>
            </section>

            <section className="subheader-container">
                <h3 className="subheader-container__h"><CarbonLabel id="@logos.header" /></h3>
            </section>

            <section className="hero-container__logos">
                <div className="hero-container__logo microsoft"></div>
                <div className="hero-container__logo amazon"></div>
                <div className="hero-container__logo evernote"></div>
                <div className="hero-container__logo paypal"></div>
                <div className="hero-container__logo airbnb"></div>
            </section>

            <SubscribeForm mainTextLabelId="@subscribe.details" />

            <FeatureSection
                className="first-section"
                index="01"
                symbol="Li"
                headerLabel="@libsec.header"
                detailsLabel="@libsec.details"
                p1Label="@libsec.p1"
                p2Label="@libsec.p2"
                p3Label="@libsec.p3"
                imageClass="symbols-image"
            />
            <FeatureSection
                index="02"
                symbol="Do"
                headerLabel="@datasec.header"
                detailsLabel="@datasec.details"
                p1Label="@datasec.p1"
                p2Label="@datasec.p2"
                p3Label="@datasec.p3"
                imageClass="data-image"
            />

            <FeatureSection
                index="03"
                symbol="Pu"
                headerLabel="@pusec.header"
                detailsLabel="@pusec.details"
                p1Label="@pusec.p1"
                p2Label="@pusec.p2"
                p3Label="@pusec.p3"
                imageClass="plugins-image"
            />

            <section className="quote-container">
                <article><CarbonLabel id="@opensource.join" /><a target="_blank" href="https://github.com/CarbonDesigns/carbon-ui">GitHub</a></article>
            </section>

            <SubscribeForm mainTextLabelId="@subscribe.details2" />
        </div>;
    }
}