import * as React from "react";
import * as ReactDom from "react-dom";
import * as PropTypes from "prop-types";
// import { FormattedMessage } from 'react-intl';
// import { Link } from "react-router";
import * as cx from "classnames";

import { backend, util } from "carbon-api";
import { CarbonLabel } from "../CarbonFlux";
// import FlyoutButton from "../shared/FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import { AccountAction } from "../account/AccountActions";
import RouteComponent, { RouteComponentProps } from "../RouteComponent";
import TopMenu from "../shared/TopMenu";
// import SubscribeForm from "../shared/SubscribeForm";
import ScrollContainer from "../shared/ScrollContainer";
import Antiscroll from "../external/antiscroll";
import styled, { css } from "styled-components";
import theme from "../theme"

const GifActivationThreshold = .5;
const PreloadedResources = ["features_data.gif", "features_data.png"];

type LandingPageState = {
    activeGifs: number;
}


export class LandingPage extends RouteComponent<RouteComponentProps, LandingPageState>{
    sections: any;
    activeSection: any;
    currentSectionClass: any;
    gifs: HTMLElement[] = [];
    scroller: Antiscroll;

    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);

        this.state = {
            activeGifs: 0
        };

        this.onScrollComplete = util.debounce(this.onScrollComplete, 50);
    }

    componentWillMount() {
        this.gifs.length = 0;

        for (var i = 0; i < PreloadedResources.length; i++) {
            let link = document.createElement("link");
            link.rel = "preload";
            link.href = backend.cdnEndpoint + "/target/res/landing/" + PreloadedResources[i];
            link["as"] = "image";
            document.head.appendChild(link);
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.sections = document.querySelectorAll(".feature-section");

        this.setActiveGifs();
        this.scroller = ScrollContainer.initScroller(document.documentElement);
        // css from webpack is for some reason applied after the html is mounted...
        setTimeout(() => this.scroller.refresh(), 2000);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.scroller.destroy();
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

    private registerGif = (gif: React.ReactInstance) => {
        this.gifs.push(ReactDom.findDOMNode(gif) as HTMLElement);
    }

    private onScrollComplete() {
        this.setActiveGifs();
    }

    /**
     * Activates gifs which are visible enough. If the gif has been activated already,
     * there is no need to reset it since it's already cached by the browser and will not "stop".
     */
    private setActiveGifs() {
        let windowHeight = window.innerHeight;
        let activeGifs = 0;

        for (let i = 0; i < this.gifs.length; i++) {
            if (this.isGifActive(i)) {
                activeGifs = activeGifs | (1 << i);
                continue;
            }
            let gif = this.gifs[i];
            let rect = gif.getBoundingClientRect();
            let visibleHeight = Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
            if (visibleHeight / (rect.bottom - rect.top) > GifActivationThreshold) {
                activeGifs = activeGifs | (1 << i);
            }
        }

        this.setState({ activeGifs });
    }

    private isGifActive(i: number) {
        let mask = 1 << i;
        return (this.state.activeGifs & mask) === mask;
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

    private renderFeaturesSection(props) {
        let cn = cx("feature-section", props.className);
        let gifActive = this.isGifActive(props.index);
        return <section className={cn}>
            <div className="feature-section__description">
                <div className="feature-section__index">{"0" + (props.index + 1)}</div>
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
            <div ref={this.registerGif} className={cx("feature-section__image", props.imageClass, { "active": gifActive })}></div>
        </section>;
    }

    render() {
        return <LandingPageBody>
            <div className="background"></div>

            <TopMenu />
            <HeroSection ref="heroContainer">


                <h1 className="title"><CarbonLabel id="@hero.title" /></h1>
                <h2 className="subtitle"><CarbonLabel id="@hero.subtitle" /></h2>
                {/* <div className="hero-container__preview">
                    <div className="hero-container__preview-image">
                        <figure className="play-button">
                            <div className="play-button__icon"></div>
                        </figure>
                    </div>
                </div> */}

                {/* <h3 className="hero-container__subheading"><CarbonLabel id="@hero.subheading" /></h3> */}
            </HeroSection>

            {/* <section className="subheader-container">
                <h3 className="subheader-container__h"><CarbonLabel id="@logos.header" /></h3>
            </section> */}

            {/* <section className="hero-container__logos">
                <div className="hero-container__logo microsoft"></div>
                <div className="hero-container__logo amazon"></div>
                <div className="hero-container__logo evernote"></div>
                <div className="hero-container__logo paypal"></div>
                <div className="hero-container__logo airbnb"></div>
            </section> */}

            {/* <SubscribeForm mainTextLabelId="@subscribe.details" /> */}

            {/* <section className="quote-container">
                <article><CarbonLabel id="@opensource.join" /><a target="_blank" href="https://github.com/CarbonDesigns/carbon-ui">GitHub</a></article>
            </section> */}

            {/* <SubscribeForm mainTextLabelId="@subscribe.details2" /> */}
        </LandingPageBody>;
    }
}

function cdnUrl(url:string) {
    return backend.cdnEndpoint + "/target/" + url;
}

const LandingPageBody = styled.div`
    min-height: 100%;
    width:100%;
    user-select:auto;

    & .background {
        position: absolute;
        width:100%;
        height: 100%;
        left:0;
        top:0;
        z-index: -1;
        background-image:  url('${cdnUrl('img/back.jpg')}');
        background-repeat: no-repeat;
    }
`;

const HeroSection = styled.section`
    width:100%;
    height: 480px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0;
    position: relative;
    z-index: 50;

    color: #fff;
    & .title {
        font: 400 55px 'Roboto', sans-serif;
        line-height: 61px;
        text-align: center;
        letter-spacing: -0.602381px;
        width: 500px;
        margin:0 auto;
    }

    .subtitle {
        letter-spacing: -0.44px;
        font: 500 22px 'Roboto', sans-serif;
        margin-top: 22px;
    }
`;