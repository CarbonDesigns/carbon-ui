import * as React from "react";
import * as PropTypes from "prop-types";
import { handles, Component } from "./CarbonFlux";
import AppActions from './RichAppActions';
import { app } from "carbon-core";

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

        return <div id="splash">
            <div className="logo">
                <div className="progress" style={{ width: progress + '%' }}></div>
            </div>
        </div>
    }
}