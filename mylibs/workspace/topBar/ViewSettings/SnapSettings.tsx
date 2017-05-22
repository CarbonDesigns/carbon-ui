import React from "react";
// import Hue from 'react-color/lib/components/common/Hue';
// import Alpha from 'react-color/lib/components/common/Alpha';
// import SliderHandle from "../../../shared/SliderHandle";
import {Component} from "../../../CarbonFlux";
import {FormattedMessage} from "react-intl";

import {app, util, CustomGuides, PropertyTracker, Invalidate, PatchType} from "carbon-core";
import {FormHeading, FormLine, FormGroup}                 from "../../../shared/FormComponents"
import {GuiInlineLabel, GuiCheckbox, GuiDropDown, GuiButton} from "../../../shared/ui/GuiComponents";

import ViewSettingsPage     from "./ViewSettingsPage";
// import {FormHeading, FormLine, FormGroup}                 from "../../../shared/FormComponents"
// import {GuiInlineLabel, GuiDropDown, GuiButton} from "../../../shared/ui/GuiComponents";
// import EditableList from "../../../shared/EditableList";
// import SimpleList from "../../../shared/SimpleList";

export default class SnapSettings extends Component <any, any>{
    constructor(props){
        super(props);

        // var artboards = app.activePage.getAllArtboards();
        // var activeArtboard = app.activePage.getActiveArtboard();
        // var artboardIndex = artboards.indexOf(activeArtboard);
        // var artboard = artboardIndex === -1 ? artboards[0] : activeArtboard;
        //
        this.state = {
            // settings: Object.assign({}, app.props.customGuides)
            settings: Object.assign({show: true}, {})
        };
        // this.saveSettingsDebounced = util.debounce(this.saveSettings.bind(this), 200);
    }

    showChanged = () =>{
        var settings = Object.assign({}, this.state.settings);
        settings.show = !settings.show;

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

    render(){
        return <ViewSettingsPage slug="snapping" heading="Snapping" switcher={true} checked={this.state.settings.show} onChange={this.showChanged} >
            <FormGroup heading="Snap to">
                <FormLine><GuiCheckbox label="columns"/></FormLine>
                <FormLine><GuiCheckbox label="guides"/></FormLine>
                <FormLine><GuiCheckbox label="grid"/></FormLine>
                <FormLine><GuiCheckbox label="object corners"/></FormLine>
                <FormLine><GuiCheckbox label="object centers"/></FormLine>
                <FormLine><GuiCheckbox label="edge centers"/></FormLine>
            </FormGroup>

            <FormGroup>
                <FormLine><GuiCheckbox label="snap to locked objects"/></FormLine>
            </FormGroup>
        </ViewSettingsPage>
    }
}