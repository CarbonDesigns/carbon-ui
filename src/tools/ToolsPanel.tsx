import * as React from "react";
import { Component, listenTo, dispatch, handles, dispatchAction } from "../CarbonFlux";
import { richApp } from "../RichApp";
import Panel from '../layout/Panel'
import * as ReactDom from "react-dom";
import Tools from './tools';

export default class ToolsPanel extends Component<{}, {}> {
    constructor(props) {
        super(props);
    }


    render() {
        let {children, ...rest} = this.props;
        return (
            <Panel ref="panel" {...rest} header="tools" noheader id="tools-panel">
                <Tools key="tools"/>
            </Panel>
        );
    }

}