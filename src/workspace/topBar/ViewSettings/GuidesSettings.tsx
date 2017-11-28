import React from "react";
import Hue from 'react-color/lib/components/common/Hue';
import Alpha from 'react-color/lib/components/common/Alpha';

import SliderHandle from "../../../shared/SliderHandle";
import {Component} from "../../../CarbonFlux";
import {FormattedMessage} from "react-intl";

import {app, util, CustomGuides, PropertyTracker, Invalidate, PatchType, IArtboardProps} from "carbon-core";

import ViewSettingsPage     from "./ViewSettingsPage";
import {FormHeading, FormLine, FormGroup}                 from "../../../shared/FormComponents"
import {GuiInlineLabel, GuiDropDown, GuiButton} from "../../../shared/ui/GuiComponents";
import EditableList from "../../../shared/EditableList";
import SimpleList from "../../../shared/SimpleList";
import bem from '../../../utils/commonUtils';

export default class GuidesSettings extends Component<any, any> {
    [name:string]:any;

    constructor(props){
        super(props);

        var artboards = app.activePage.getAllArtboards();
        var activeArtboard = app.activePage.getActiveArtboard();
        var artboardIndex = artboards.indexOf(activeArtboard);
        var artboard = artboardIndex === -1 ? artboards[0] : activeArtboard;

        this.state = {
            guides: this.createGuides(artboard),
            selectedArtboard: artboardIndex === -1 ? 0 : artboardIndex,
            settings: Object.assign({}, app.props.customGuides)
        };
        this.saveSettingsDebounced = util.debounce(this.saveSettings.bind(this), 200);
    }

    showChanged = () =>{
        var settings = Object.assign({}, this.state.settings);
        settings.show = !settings.show;

        this.saveSettings(settings);
        Invalidate.requestInteractionOnly();
    };
    hueChanged = hsl =>{
        var settings = Object.assign({}, this.state.settings);
        settings.hsl = hsl;
        this.setState({settings});

        CustomGuides.setDefaultStrokeHsl(hsl);
        Invalidate.requestInteractionOnly();
        this.saveSettingsDebounced();
    };
    opacityChanged = hsla =>{
        var opacity = hsla.a;
        var settings = Object.assign({}, this.state.settings);
        settings.opacity = opacity;
        this.setState({settings});

        CustomGuides.setDefaultOpacity(opacity);
        Invalidate.requestInteractionOnly();
        this.saveSettingsDebounced();
    };
    deleteAllGuides = () => {
        var artboards = app.activePage.getAllArtboards();
        var artboard = artboards[this.state.selectedArtboard] as any;
        artboard.setProps({guidesX: [], guidesY: []});
        this.setState({guides: this.createGuides(artboard)});
        Invalidate.requestInteractionOnly();
    };
    copyGuides = () => {
        var artboards = app.activePage.getAllArtboards();
        var source = artboards[this.state.selectedArtboard];
        var target = app.activePage.getActiveArtboard() as any;
        target.setProps({
            guidesX: source.props.guidesX.map(guide => Object.assign({}, guide)),
            guidesY: source.props.guidesY.map(guide => Object.assign({}, guide))
        });
        this.setState({guides: this.createGuides(target)});
        Invalidate.requestInteractionOnly();
    };
    saveSettings(settings){
        var newValue = settings || Object.assign({}, this.state.settings);
        app.setProps({customGuides: newValue});
    }
    onArtboardSelectionChanged = i => {
        var artboards = app.activePage.getAllArtboards();
        var artboard = artboards[i];
        this.setState({selectedArtboard: i, guides: this.createGuides(artboard)});
    };
    onGuideChanged = (value, item) =>{
        var parsed = parseInt(value);
        if (Number.isNaN(parsed)){
            parsed = item.name;
        }
        var artboards = app.activePage.getAllArtboards();
        var artboard = artboards[this.state.selectedArtboard];
        var guides = item.x ? artboard.props.guidesX : artboard.props.guidesY;
        var g = guides.find(x => x.id === item.id);
        var ng = Object.assign({}, g, {pos: parsed});
        artboard.patchProps(PatchType.Change, item.x ? "guidesX" : "guidesY", ng);

        this.setState({guides: this.createGuides(artboard)});
        Invalidate.requestInteractionOnly();
    };
    onGuideDeleted = (item) =>{
        var artboards = app.activePage.getAllArtboards();
        var artboard = artboards[this.state.selectedArtboard];
        var guides = item.x ? artboard.props.guidesX : artboard.props.guidesY;
        var g = guides.find(x => x.id === item.id);
        artboard.patchProps(PatchType.Remove, item.x ? "guidesX" : "guidesY", g);

        this.setState({guides: this.createGuides(artboard)});
        Invalidate.requestInteractionOnly();
    };
    onPropsChanged(e, props){
        if (e === app){
            if (props.customGuides){
                this.setState({settings: props.customGuides});
            }
        }
    }

    createGuides(artboard){
        var guides = [];
        if (!artboard){
            return guides;
        }
        // fixme - sort guides
        for (let i = 0; i < artboard.props.guidesX.length; i++){
            var gx = artboard.props.guidesX[i];
            guides.push({id: gx.id, name: gx.pos, x: true, direction: 'y'});
        }
        for (let i = 0; i < artboard.props.guidesY.length; i++){
            var gy = artboard.props.guidesY[i];
            guides.push({id: gy.id, name: gy.pos, y: true, direction: 'x'});
        }
        return guides;
    }

    componentDidMount(){
        super.componentDidMount();
        app.enablePropsTracking();
        PropertyTracker.propertyChanged.bind(this, this.onPropsChanged);
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        app.disablePropsTracking();
        PropertyTracker.propertyChanged.unbind(this, this.onPropsChanged);
    }

    _renderArtboardsList (){
        return app.activePage.getAllArtboards().map((artboard)=>{
            var guides_amount = artboard.props.guidesX.length + artboard.props.guidesX.length;
            return <div key={artboard.id} data-artboard-id={artboard.id}><span>{artboard.name}</span> <span>({guides_amount})</span></div>
        });
    };

    _prepareGuidesForRender(){
        let b = "guides-list";
        return this.state.guides.map(guide=>{
            return Object.assign({}, guide, {content:(
                <span className={bem(b, "guide-text")}>
                    <i className={bem(b, "guide-dir", guide.direction)} />
                    <span className={bem(b, "guide-pos")}>{guide.name}</span>
                </span>
            )})}
        );
    }


    render(){


        return <ViewSettingsPage slug="guides" heading="Guides" switcher={true} checked={this.state.settings.show} onChange={this.showChanged}>

            <FormGroup heading="Appearance">
                <FormLine>
                    <GuiInlineLabel text="Hue"/>
                    <div className="gui-inline-data">
                        <div className="gui-slider gui-slider_horizontal gui-slider_reactcolor">
                            <Hue hsl={this.state.settings.hsl} onChange={this.hueChanged} pointer={SliderHandle}/>
                        </div>
                    </div>
                </FormLine>
                <FormLine>
                    <GuiInlineLabel text="opacity"/>
                    <div className="gui-inline-data">
                        <div className="gui-slider gui-slider_horizontal gui-slider_reactcolor">
                            <Alpha rgb={{r: 0, g: 0, b: 0, a: this.state.settings.opacity}}
                                   hsl={this.state.settings.hsl}
                                   onChange={this.opacityChanged}
                                   pointer={SliderHandle}/>
                        </div>
                    </div>
                </FormLine>
            </FormGroup>

            <FormGroup heading="Guides" id="guide_list">
                <FormLine>
                    <GuiDropDown selectedItem={this.state.selectedArtboard} onSelect={this.onArtboardSelectionChanged}>
                        {this._renderArtboardsList()}
                    </GuiDropDown>

                    <SimpleList
                        emptyMessage={<FormattedMessage id="No guides on this artboard" />}
                        items={this._prepareGuidesForRender()}
                        onDelete={this.onGuideDeleted}
                        insideFlyout/>
                </FormLine>
                <FormLine className="gui-btn-block">
                    <GuiButton mods={['submit', 'small']} disabled={this.state.guides.length === 0} onClick={this.copyGuides}      caption="Copy to current artboard"/>
                    <GuiButton mods={['delete', 'small']} disabled={this.state.guides.length === 0} onClick={this.deleteAllGuides} caption="Delete all" icon="trash"/>
                </FormLine>
            </FormGroup>
        </ViewSettingsPage>;
    }

}