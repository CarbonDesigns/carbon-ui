import { CarbonLabel, StoreComponent, listenTo, Component } from '../CarbonFlux';
import * as React from "react";
import * as ReactDom from "react-dom";
import * as PropTypes from "prop-types";
import Panel from '../layout/Panel'
import { richApp } from '../RichApp';
import VirtualList from "../shared/collections/VirtualList";
import ScrollContainer from "../shared/ScrollContainer";
import { app, Invalidate, Selection, IArtboardPage, LayerType, IIsolationLayer } from "carbon-core";
import PreviewWorkspace from "../preview/PreviewWorkspace";
import EditorToolbar from "../editor/EditorToolbar";
import styled from 'styled-components';
import icons from "../theme-icons";

export class PreviewPanel extends Component<any, any> {
    refs: {
        panel: Panel;
    }

    constructor(props) {
        super(props);
    }

    onChange(text: string) {

    }

    render() {
        let { children, ...rest } = this.props;
        return <Panel ref="panel" icon={icons.p_preview} header="Preview" id="preview_panel" {...rest}>
            <PanelContent>
                <EditorToolbar/>
                <div style={{position:"relative", width:"100%", height:"100%"}}>
                <PreviewWorkspace />
                </div>
            </PanelContent>
        </Panel>;
    }
}

const PanelContent = styled.div`
    position:relative;
    flex:1;
    display:grid;
    grid-template-rows: 32px 1fr;
    align-items: stretch;
    justify-items: stretch;
    height:100%;
`;