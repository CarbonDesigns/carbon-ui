import * as React from "react";
import * as PropTypes from "prop-types";
import { handles, Component } from "./CarbonFlux";
import AppActions from './RichAppActions';
import { app } from "carbon-core";
import { backend } from "carbon-api";
import styled from "styled-components";

export class Splash extends Component<any, any> {
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    context: {
        router: any
    }

    constructor(props, context) {
        super(props, context);
        this.state = { progress: 100, message: '' }
    }

    @handles(AppActions.splashAction)
    onProgressChange({progress, message}) {
        this.setState({progress, message});
    }

    render() {
        let progress = this.state.progress;
        if(!app.isLoaded && progress>=100) {
            progress = 0;
        }

        if (progress >= 100) {
            return <div></div>;
        }

        return <SplashContainer>
            <div className="logo">
                <div className="progress" style={{ width: progress + '%' }}></div>
            </div>
        </SplashContainer>
    }
}

function cdnUrl(url:string) {
    return backend.cdnEndpoint + "/target/" + url;
}

const SplashContainer = styled.div`
    z-index: 1000000;
    background: #19191b;
    position: absolute;
    top:0;
    bottom: 0;
    right:0;
    left:0;
    display: flex;
    align-content: center;
    justify-content: center;
    flex-direction: row;

    .logo {
        display: block;
        position: relative;
        width:140px;
        height: 140px;
        align-self: center;
        background-repeat: no-repeat no-repeat;
        background-image:url('${cdnUrl('img/logo.svg')}');
        .progress {
            display: block;
            bottom: 0;
            left:0;
            height:2px;
            background-color: white;
            position: absolute;
        }
    }
`;