import * as React from "react";
import { Component, dispatch } from "./CarbonFlux";
import LayoutContainer from "./layout/Layout";
// import Header from './header/Header';
import RichAppRoot from './RichAppRoot';
import AppLoaderComponent from './AppLoaderComponent';
import { app, backend, Services } from "carbon-core";
import AppActions from "./RichAppActions";

import Workspace from './workspace/DesignerWorkspace';
import MainMenu from './mainmenu/MainMenu';
import PreviewWorkspace from './preview/PreviewWorkspace';

import StoriesPanel from './stories/StoriesPanel';
import LibraryPanel from './library/LibraryPanel';
import LayersPanel from './layers/LayersPanel';
// import ToolsPanel from './tools/ToolsPanel';
import CommentsPanel from './comments/CommentsPanel';
import PropertiesPanel from './properties/PropertiesPanel';
import SwatchesPanel from './properties/SwatchesPanel';

// import Perf from "react-addons-perf";
import FullScreenApi from "./shared/FullScreenApi";
import { Splash } from "./Splash";
import { EditorPanel } from "./editor/EditorPanel";
import { PreviewPanel } from "./editor/PreviewPanel";

// window['Perf'] = Perf

export class RichAppContainer extends AppLoaderComponent {
    componentDidMount() {
        super.componentDidMount();
        document.body.classList.add("noscroll");
        if(Services.compiler) {
            Services.compiler.clear();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        document.body.classList.remove("noscroll");
    }

    render() {
        return <RichAppRoot>
            <Splash/>
            <div id="overlays">
                <div style={{ display: 'none' }} id="overlay-bg"></div>
            </div>
            <MainMenu />
            {/*Header/*/}
            {/*<LayoutContainer name="workspace" id="layout"*/}
            <LayoutContainer
                panels={{
                    layers: { contentFactory: React.createFactory(LayersPanel) },
                    //tools: { contentFactory: React.createFactory(ToolsPanel) },
                    library: { contentFactory: React.createFactory(LibraryPanel) },
                    comments: { contentFactory: React.createFactory(CommentsPanel) },
                    properties: { contentFactory: React.createFactory(PropertiesPanel) },
                    swatches: { contentFactory: React.createFactory(SwatchesPanel) },
                    designer: { contentFactory: React.createFactory(Workspace) },
                    preview: { contentFactory: React.createFactory(PreviewWorkspace) },
                    previewPanel: { contentFactory: React.createFactory(PreviewPanel) },
                    stories: { contentFactory: React.createFactory(StoriesPanel) },
                    editor: { contentFactory: React.createFactory(EditorPanel) }
                }} />
        </RichAppRoot>;
    }
}

export default RichAppContainer;
