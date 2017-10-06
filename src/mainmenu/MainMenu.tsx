import React from 'react';
import {app} from "carbon-core";
import {richApp}    from '../RichApp';
import AppActions   from '../RichAppActions';
import {handles, ComponentWithImmutableState} from '../CarbonFlux';
import {FormattedMessage} from "react-intl"
import {Record} from "immutable";
import appStore from "../AppStore";

import BladeContainer from "./blades/BladeContainer";

import MainMenuBlade        from './MainMenuBlade';

var State = Record({
    mainMenuVisible: false,
    recentProjects: []
});

export default class MainMenu extends ComponentWithImmutableState<any, any> {
    refs: {
        bladeContainer: BladeContainer
    }

    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                mainMenuVisible: appStore.state.mainMenuVisible,
                recentProjects: []
            })
        };
    }

    @handles(AppActions.showMainMenu)
    onShowMenu() {
        this.refs.bladeContainer.addChildBlade("blade_main-menu", MainMenuBlade, null, {recentProject: this.state.data.recentProjects}, true);
    }


    render() {
        return ( <BladeContainer ref="bladeContainer"/> );
    }

}
