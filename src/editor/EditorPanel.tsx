import { CarbonLabel, StoreComponent, listenTo, Component } from '../CarbonFlux';
import * as React from "react";
import * as ReactDom from "react-dom";
import * as PropTypes from "prop-types";
import Panel from '../layout/Panel'
import { richApp } from '../RichApp';
import * as cx from "classnames";
import VirtualList from "../shared/collections/VirtualList";
import LessVars from "../styles/LessVars";
import ScrollContainer from "../shared/ScrollContainer";
import { app, Invalidate, Selection, IArtboardPage, LayerType, IIsolationLayer } from "carbon-core";
import { say } from "../shared/Utils";
import { MonacoEditor } from "./MonacoEditor"
import EditorToolbar from './EditorToolbar';

let et = EditorToolbar.prototype;
let dd = MonacoEditor.prototype;
// TODO: inherited visibility and lock style

export class EditorPanel extends Component<any, any> {
    refs: {
        panel: Panel;
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
        // alert(monaco);
    }

    componentWillUnmout() {
        super.componentWillUnmount();
    }

    onChange(text: string) {

    }

    render() {
        let { children, ...rest } = this.props;
        return <Panel ref="panel" header="Editor" id="editor_panel" {...rest}>
            <EditorToolbar />
            <MonacoEditor value="test" language="ts" onChange={this.onChange} />
        </Panel>;
    }
}