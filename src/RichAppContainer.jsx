import React from "react";
import {Component} from "./CarbonFlux";
import LayoutContainer from "./layout/Layout";
// import Header from './header/Header';
import RichAppRoot from './RichAppRoot';
import AppLoaderComponent from './AppLoaderComponent';
import {app, backend} from "carbon-core";

import Workspace        from './workspace/DesignerWorkspace';
import MainMenu         from './mainmenu/MainMenu';
import PreviewWorkspace from './preview/PreviewWorkspace';

import StoriesPanel     from './stories/StoriesPanel';
import LibraryPanel     from './library/LibraryPanel';
import LayersPanel      from './layers/LayersPanel';
import CommentsPanel    from './comments/CommentsPanel';
import PropertiesPanel  from './properties/PropertiesPanel';
import SwatchesPanel    from './properties/SwatchesPanel';

import Perf from "react-addons-perf";


    window['Perf'] = Perf

export class RichAppContainer extends AppLoaderComponent{
    render() {
        return <RichAppRoot>
                    <div id="overlays">
                        <div style={{display: 'none'}} id="overlay-bg"></div>
                    </div>
                    <MainMenu/>
                    {/*Header/*/}
                    {/*<LayoutContainer name="workspace" id="layout"*/}
                    <LayoutContainer
                                     panels={{
                                         layers:     { contentFactory: React.createFactory(LayersPanel)},
                                         library:    { contentFactory: React.createFactory(LibraryPanel)},
                                         comments:   { contentFactory: React.createFactory(CommentsPanel)},
                                         properties: { contentFactory: React.createFactory(PropertiesPanel)},
                                         swatches:   { contentFactory: React.createFactory(SwatchesPanel)},
                                         designer:   { contentFactory: React.createFactory(Workspace)},
                                         preview:    { contentFactory: React.createFactory(PreviewWorkspace)},
                                         stories:    { contentFactory: React.createFactory(StoriesPanel)},
                                     }}/>
                </RichAppRoot>;
    }
}

export default RichAppContainer;
