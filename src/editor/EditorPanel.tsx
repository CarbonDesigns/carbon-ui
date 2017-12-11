import { CarbonLabel, StoreComponent, listenTo, Component } from '../CarbonFlux';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import Panel from '../layout/Panel'
import { richApp } from '../RichApp';
import cx from 'classnames';
import VirtualList from "../shared/collections/VirtualList";
import LessVars from "../styles/LessVars";
import ScrollContainer from "../shared/ScrollContainer";
import { app, Invalidate, Selection, Environment, IArtboardPage, LayerType, IIsolationLayer } from "carbon-core";
import { say } from "../shared/Utils";
import bem from "bem";
import { MonacoEditor } from "./MonacoEditor"
import EditorToolbar from './EditorToolbar';

let et = EditorToolbar.prototype;
let dd = MonacoEditor.prototype;
// TODO: inherited visibility and lock style
function b(a, b?, c?) { return bem('editor', a, b, c) }

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