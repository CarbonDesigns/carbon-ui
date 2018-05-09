import * as React from "react";
// import HotKeyListener from "./HotkeyListener";
import { Component } from "./CarbonFlux";
import { CoreIntl } from "carbon-core"

import { ThemeProvider } from 'styled-components';
import {colors} from './theme';

const App = props =>
    <ThemeProvider theme={colors}>
        {props.children}
    </ThemeProvider>

export default class RichAppRoot extends Component {
    render() {
        CoreIntl.instance = this.context.intl;
        return <App><div className="page">
            {this.props.children}
        </div></App>;
    }

    componentDidMount() {
        super.componentDidMount();
        // HotKeyListener.attach();
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        // HotKeyListener.detach();
    }
}


