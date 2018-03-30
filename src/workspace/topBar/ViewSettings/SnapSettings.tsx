import * as React from "react";
// import Hue from 'react-color/lib/components/common/Hue';
// import Alpha from 'react-color/lib/components/common/Alpha';
// import SliderHandle from "../../../shared/SliderHandle";
import { Component } from "../../../CarbonFlux";
import { FormattedMessage } from "react-intl";


import { app, util, CustomGuides, PropertyTracker, Invalidate, PatchType, UserSettings } from "carbon-core";
import { FormHeading, FormLine, FormGroup } from "../../../shared/FormComponents"
import { GuiInlineLabel, GuiCheckbox, GuiDropDown, GuiButton } from "../../../shared/ui/GuiComponents";

import ViewSettingsPage from "./ViewSettingsPage";
// import {FormHeading, FormLine, FormGroup}                 from "../../../shared/FormComponents"
// import {GuiInlineLabel, GuiDropDown, GuiButton} from "../../../shared/ui/GuiComponents";
// import EditableList from "../../../shared/EditableList";
// import SimpleList from "../../../shared/SimpleList";

export default class SnapSettings extends Component<any, any>{
    constructor(props) {
        super(props);

        // var artboards = app.activePage.getAllArtboards();
        // var activeArtboard = app.activePage.getActiveArtboard();
        // var artboardIndex = artboards.indexOf(activeArtboard);
        // var artboard = artboardIndex === -1 ? artboards[0] : activeArtboard;
        //

        var userSettings = UserSettings;
        this.state = {
            // settings: Object.assign({}, app.props.customGuides)
            settings: userSettings.snapTo
        };
        // this.saveSettingsDebounced = util.debounce(this.saveSettings.bind(this), 200);
    }

    showChanged = () => {
        var settings = Object.assign({}, this.state.settings);
        settings.enabled = !settings.enabled;
        this.setState({ settings });
        //this.saveSettings(settings);
    };


    // componentDidMount(){
    //     super.componentDidMount();
    //     app.enablePropsTracking();
    //     PropertyTracker.propertyChanged.bind(this, this.onPropsChanged);
    // }
    // componentWillUnmount(){
    //     super.componentWillUnmount();
    //     app.disablePropsTracking();
    //     PropertyTracker.propertyChanged.unbind(this, this.onPropsChanged);
    // }

    _changeColumns = () => {
        var settings = Object.assign({}, this.state.settings);
        settings.columns = !settings.columns;
        this.setState({ settings });
    }

    _changeGuides = () => {
        var settings = Object.assign({}, this.state.settings);
        settings.guides = !settings.guides;
        this.setState({ settings });
    }

    _changeGrid = () => {
        var settings = Object.assign({}, this.state.settings);
        settings.grid = !settings.grid;
        this.setState({ settings });
    }

    _changeVisibleObjects = () => {
        var settings = Object.assign({}, this.state.settings);
        settings.onlyVisibleObjects = !settings.onlyVisibleObjects;
        this.setState({ settings });
    }

    _changeLockedObjects = () => {
        var settings = Object.assign({}, this.state.settings);
        settings.lockedObjects = !settings.lockedObjects;
        this.setState({ settings });
    }

    render() {
        return <ViewSettingsPage slug="snapping" heading="@snapping" switcher={true} checked={this.state.settings.enabled} onChange={this.showChanged} >
            <FormGroup heading="@snap to">
                <FormLine><GuiCheckbox label="@columns"
                    onChange={this._changeColumns}
                    checked={this.state.settings.snapToColumns} /></FormLine>
                <FormLine><GuiCheckbox label="@guides"
                    onChange={this._changeGuides}
                    checked={this.state.settings.snapToGuides} /></FormLine>
                <FormLine><GuiCheckbox label="@grid"
                    onChange={this._changeGrid}
                    checked={this.state.settings.snapToGrid} /></FormLine>
                <FormLine><GuiCheckbox label="@only visible objects"
                    onChange={this._changeVisibleObjects}
                    checked={this.state.settings.snapToOnlyVisibleObjects} /></FormLine>
            </FormGroup>

            <FormGroup>
                <FormLine><GuiCheckbox label="@snap to locked objects"
                    onChange={this._changeLockedObjects}
                    checked={this.state.lockedObjects} /></FormLine>
            </FormGroup>
        </ViewSettingsPage>
    }
}