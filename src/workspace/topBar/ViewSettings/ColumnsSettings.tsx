import * as React from "react";
import Hue   from 'react-color/lib/components/common/Hue';
import Alpha from 'react-color/lib/components/common/Alpha';

import {Component, handles}   from "../../../CarbonFlux";
import EnterInput             from "../../../shared/EnterInput";
import SliderHandle           from "../../../shared/SliderHandle";
import {FormattedMessage} from "react-intl";

import ViewSettingsPage     from "./ViewSettingsPage";
import {FormHeading, FormLine, FormGroup}                 from "../../../shared/FormComponents"
import {GuiInlineLabel, GuiButton, GuiCheckbox, GuiRadio, GuiSwitch} from "../../../shared/ui/GuiComponents";

import {
    app,
    util,
    LayoutGridLines,
    LayoutGridColumns,
    PropertyTracker,
    Invalidate
} from "carbon-core";

export default class ColumnsSettings extends Component<any, any> {
    [name:string]:any;
    refs: {
        columnsCount:any;
        columnWidth: any;
        autoColumnWidth : any;
        gutterWidth     : any;
    }
    constructor(props) {
        super(props);

        var setup;
        var active_artboard = app.activePage.getActiveArtboard();

        if (active_artboard != null && active_artboard.props.layoutGridSettings) {
            setup = active_artboard.props.layoutGridSettings;
        }
        else {
            setup = app.props.defaultLayoutGridSettings;
        }

        setup = Object.assign({}, setup);

        this.state = {
            setup: setup,
            useForNewArtboards: false,
            style: Object.assign({}, app.props.layoutGridStyle),
            applyOptions: {
                activeArtboard: true,
                activePage: false,
                allPages: false
            }
        };

        this.updateStyleByCommandDebounced = util.debounce(this.updateStyleByCommand.bind(this), 200);
    }

    showChanged = () => {
        var style = this.state.style;
        style = Object.assign({}, style);
        style.show = !style.show;
        this.setState({style: style});

        if (style.show && this.state.setup.columnsCount === 0) {
            this.refs.columnsCount.focus();
        }

        app.setProps({layoutGridStyle: style});
        Invalidate.request();
    };

    setupChanged = (e, updateView = true) => {
        var settings = this.getSettings();
        this.setState({setup: settings});

        if (updateView) {
            var artboards = this.getArtboardsToUpdate();
            for (var i = 0; i < artboards.length; i++) {
                var artboard = artboards[i];
                artboard.setProps({layoutGridSettings: settings});
            }
            Invalidate.request();
        }
    };
    autoColumnWidthChanged = (e) => {
        this.setupChanged(e, this.refs.columnWidth.getValue() !== 0);
        setTimeout(() => this.refs.columnWidth.focus());
    };

    setStyleType = e => {
        var type = e.currentTarget.dataset.type;
        var style = this.state.style;
        style = Object.assign({}, style);
        style.type = type;
        this.setState({style: style});

        app.setProps({layoutGridStyle: style});
        Invalidate.request();
    };
    hueChanged = hsl => {
        var style = this.state.style;
        style.hsl = hsl;
        this.setState({style: style});

        LayoutGridLines.setDefaultStrokeHsl(hsl);
        LayoutGridColumns.setDefaultFillHsl(hsl);
        Invalidate.request();

        this.updateStyleByCommandDebounced();
    };
    opacityChanged = hsla => {
        var opacity = hsla.a;
        var style = this.state.style;
        style.opacity = opacity;
        this.setState({style: style});

        LayoutGridLines.setDefaultOpacity(opacity);
        LayoutGridColumns.setDefaultOpacity(opacity);
        Invalidate.request();

        this.updateStyleByCommandDebounced();
    };

    makeDefault = () => {
        this.setState({message: "These settings will be used for new artboards", useForNewArtboards: true});
        alert("//TODO: initialize new artboard from app.props.defaultLayoutGridSettings");

        var settings = this.getSettings();
        var defaultGridProps = {defaultLayoutGridSettings: Object.assign({}, settings)};

        app.setProps(defaultGridProps);
    };
    resetDefault = () => {
        this.setState({message: "New artboards will not have layout grid", useForNewArtboards: false});
        var defaultGridProps = {defaultLayoutGridSettings: null};

        app.setProps(defaultGridProps);
    };
    setApplyOption = e => {
        var optionName = e.currentTarget.dataset.option;
        var options = this.state.applyOptions;
        for (var option in options) {
            options[option] = option === optionName;
        }
        var newState = {applyOptions: options};
        this.setState(newState);

        let artboards = this.getArtboardsToUpdate(newState);
        let settings = this.getSettings();
        for (let i = 0; i < artboards.length; i++) {
            let artboard = artboards[i];
            artboard.setProps({layoutGridSettings: settings});
        }
        Invalidate.request();
    };

    updateStyleByCommand() {
        app.setProps({layoutGridStyle: Object.assign({}, this.state.style)});
    }

    getArtboardsToUpdate(state = this.state) {
        var artboards = [];
        if (state.applyOptions.activeArtboard) {
            artboards.push(app.activePage.getActiveArtboard());
        }
        else if (state.applyOptions.activePage) {
            Array.prototype.push.apply(artboards, app.activePage.getAllArtboards());
        }
        else {
            artboards = this.getAllArtboards();
        }
        return artboards;
    }

    getAllArtboards() {
        var artboards = [];
        for (let i = 0; i < app.pages.length; i++) {
            var page = app.pages[i];
            Array.prototype.push.apply(artboards, page.getAllArtboards());
        }
        return artboards;
    }

    getSettings() {
        var settings = {
            columnsCount    : this.refs.columnsCount.getValue(),
            columnWidth     : this.refs.columnWidth.getValue(),
            autoColumnWidth : this.refs.autoColumnWidth.checked,
            gutterWidth     : this.refs.gutterWidth.getValue()
        };
        return settings;
    }

    componentDidUpdate() {
        (this.state as any).message = ""; //reset for next update
    }

    render() {

        return <ViewSettingsPage heading="Columns" slug="columns" switcher={true} checked={this.state.style.show} onChange={this.showChanged} >
            <FormGroup>
                <FormLine>
                    <GuiInlineLabel text="Columns amount"/>
                    <div className="gui-inline-data">
                        <label className="gui-spinner gui-inliner">
                            <EnterInput ref="columnsCount" data-type="int" value={this.state.setup.columnsCount}
                                        onValueEntered={this.setupChanged} size={5} type="text"/>
                        </label>
                    </div>
                </FormLine>
                <FormLine>
                    <GuiInlineLabel text="Column width"/>
                    <div className="gui-inline-data">
                        <label className="gui-spinner gui-inliner">
                            <EnterInput ref="columnWidth" data-type="int" value={this.state.setup.columnWidth}
                                        onValueEntered={this.setupChanged} size={5} type="text"
                                        disabled={this.state.setup.autoColumnWidth}/>
                        </label>
                        <label className="gui-check gui-inliner">
                            <input ref="autoColumnWidth" type="checkbox" checked={this.state.setup.autoColumnWidth}
                                   onChange={this.autoColumnWidthChanged}/>
                            <i />
                            <FormattedMessage id="Auto"/>
                        </label>
                    </div>
                </FormLine>
                {/*<section className="form__line">
                 <label className="gui-inline-label">
                 <span>Page margins</span>
                 </label>
                 <div className="gui-inline-data">
                 <label className="gui-spinner gui-inliner">
                 <input defaultValue={90} size={5} type="text"/>
                 </label>
                 <label className="gui-switch gui-inliner">
                 <input name="radio0" type="checkbox"/>
                 <span>%</span>
                 <i />
                 <span>px</span>
                 </label>
                 </div>
                 </section>
                 */}
                <FormLine>
                    <GuiInlineLabel text="Gutter width"/>
                    <div className="gui-inline-data">
                        <label className="gui-spinner gui-inliner">
                            <EnterInput ref="gutterWidth" data-type="int" value={this.state.setup.gutterWidth}
                                        onValueEntered={this.setupChanged} size={5} type="text"/>
                        </label>
                        {/*<label className="gui-switch gui-inliner">
                         <input name="radio0" type="checkbox"/>
                         <span>%</span>
                         <i />
                         <span>px</span>
                         </label>*/}
                    </div>
                </FormLine>
            </FormGroup>
            <FormGroup heading="Artboard selection">
                <FormLine>
                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={this.state.applyOptions.activeArtboard}
                               onChange={this.setApplyOption} data-option="activeArtboard"/>
                        <i />
                        <span><FormattedMessage id="Apply to current artboard"/></span>
                    </label>
                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={this.state.applyOptions.activePage}
                               onChange={this.setApplyOption} data-option="activePage"/>
                        <i />
                        <FormattedMessage id="Apply to all artboards on current page"/>
                    </label>
                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={this.state.applyOptions.allPages}
                               onChange={this.setApplyOption} data-option="allPages"/>
                        <i />
                        <FormattedMessage id="Apply to all artboards on all pages"/>
                    </label>
                </FormLine>
            </FormGroup>

            <FormGroup heading="Appearance">
                <FormLine>
                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={this.state.style.type === "stroke"}
                               onChange={this.setStyleType} data-type="stroke"/>
                        <i />
                        <FormattedMessage id="Stroke lines"/>
                    </label>
                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={this.state.style.type === "fill"}
                               onChange={this.setStyleType} data-type="fill"/>
                        <i />
                        <FormattedMessage id="Fill columns"/>
                    </label>
                </FormLine>
                <FormLine>
                    <GuiInlineLabel text="Hue"/>
                    <div className="gui-inline-data">
                        <div className="gui-slider gui-slider_horizontal gui-slider_reactcolor">
                            <Hue hsl={this.state.style.hsl} onChange={this.hueChanged} pointer={SliderHandle}/>
                        </div>
                    </div>
                </FormLine>
                <FormLine>
                    <GuiInlineLabel text="Opacity"/>
                    <div className="gui-inline-data">
                        <div className="gui-slider gui-slider_horizontal gui-slider_reactcolor">
                            <Alpha rgb={{r: 0, g: 0, b: 0, a: this.state.style.opacity}}
                                   hsl={this.state.style.hsl} onChange={this.opacityChanged}
                                   pointer={SliderHandle}/>
                        </div>
                    </div>
                </FormLine>
            </FormGroup>

            <FormGroup heading="Defaults">
                <FormLine className="gui-btn-block">
                    <GuiButton mods={['simple', 'small']} onClick={this.makeDefault}  caption="Set as default"/>
                    <GuiButton mods={['simple', 'small']} onClick={this.resetDefault} caption="Reset defaults"/>
                </FormLine>
            </FormGroup>
            {/*
             <div className="form__group">
             <div className="form__heading">
             <h6>Position</h6>
             </div>
             <div className="form__line">
             <label className="gui-check">
             <input type="checkbox"/>
             <i />
             <span>show grid above page</span>
             </label>
             </div>
             </div>
             */}
    </ViewSettingsPage>;
    }
}