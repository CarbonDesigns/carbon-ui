import React from 'react';
import {app} from "carbon-core";
import {richApp}    from '../RichApp';
import AppActions   from '../RichAppActions';
import {handles, ComponentWithImmutableState} from '../CarbonFlux';
import {FormattedHTMLMessage, FormattedMessage} from "react-intl"
import {Record} from "immutable";

import BladeContainer from "./blades/BladeContainer";

import MainMenuBlade        from './MainMenuBlade';

import ResourcesBlade       from './blades/resources/ResourcesBlade';

var State = Record({
    mainMenuVisible: false,
    recentProjects: []
});

export default class MainMenu extends ComponentWithImmutableState {
    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                mainMenuVisible: richApp.appStore.state.mainMenuVisible,
                recentProjects: [
                    {name: 'Project 1', url: 'http://#1'},
                    {name: 'Project 2', url: 'http://#2'}
                ]
            })
        };
    }

    @handles(AppActions.showResourcesBlade)
    onShowResourcesBlade({props}) {
        this.refs.bladeContainer.close(0);
        this.refs.bladeContainer.addChildBlade("blade_resources", ResourcesBlade, "caption.resourceblade", props);
    }

    @handles(AppActions.showMainMenu)
    onShowMenu() {
        this.refs.bladeContainer.addChildBlade("blade_main-menu", MainMenuBlade, null, {recentProject: this.state.data.recentProjects}, true);
    }


    render() {
        return ( <BladeContainer ref="bladeContainer"/> );
    }

}
