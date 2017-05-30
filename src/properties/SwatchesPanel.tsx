import React from 'react';
import { Component, listenTo } from "../CarbonFlux";
import { richApp } from "../RichApp";
import Panel from '../layout/Panel'
import { Brush, Font, app, ChangeMode, Shape, Selection } from "carbon-core";
import bem from '../utils/commonUtils';
import ScrollContainer from "../shared/ScrollContainer";
import { Gammas } from "../properties/editors/BrushGammaSelector";
import ReactDom from "react-dom";
import propertyStore from "../properties/PropertyStore";
import swatchesStore from "../properties/SwatchesStore";
import PropertyActions from "./PropertyActions";
import FlyoutButton from '../shared/FlyoutButton';
import BrushSelector from "../properties/editors/BrushSelector";
import SwatchesActions from "./SwatchesActions"


// TODO: change default color
function b(elem, mods?, mix?) {
    return bem("swatches-panel", elem, mods, mix)
}

class SwatchesSlot extends Component<any, any> {
    [name: string]: any;

    render() {
        return <FlyoutButton ref="flyout"
            renderContent={this.props.renderContent}
            showAction="dblclick"
            position={{ targetVertical: "bottom", disableAutoClose: true }}
            onOpened={() => {
                this._initialValue = this.props.slot.brush;
            }}
            onClosed={() => {
                delete this._initialValue;
                if (this._lastValue) {
                    this.props.colorSelected(this._lastValue);
                    delete this._lastValue;
                }
            }}>
            <BrushSelector className="flyout__content" ref="selector"
                brush={this.props.slot.brush}
                onSelected={(brush) => {
                    this.props.colorSelected(brush.value, true);
                    this._lastValue = brush.value;
                }}
                onCancelled={() => {
                    this.props.colorSelected(this._initialValue.value, true);
                    delete this._lastValue;
                }} />
        </FlyoutButton>
    }
}

interface ISwatchesPanelState {
    swatch_width?: any;
    active?: string;
    recentColors?: { name: string; colors: string[] };
    palettes?: any[];
    fill?: any;
    stroke?: any;
    font?: any;
}

export default class SwatchesPanel extends Component<any, ISwatchesPanelState> {

    constructor(props) {
        super(props);
        var state: ISwatchesPanelState = {
            active: swatchesStore.state.active,
            recentColors: { name: '', colors: [] },
            palettes: []
        };
        if (this.refs.panel != null) {
            var node = ReactDom.findDOMNode(this.refs.panel);
            state.swatch_width = this._getSwatchWidth(node);
        }
        this.state = state;
    }

    _updateSwatchWidth() {
        var node = ReactDom.findDOMNode(this.refs.panel);
        if (node) {
            this.setState({
                swatch_width: this._getSwatchWidth(node)
            });
        }
    }

    _getSwatchWidth(panelNode) {
        var panelWidth = parseInt(panelNode.offsetWidth);
        var target_width = 24;
        var width = 10;
        if (!Number.isNaN(panelWidth)) {
            var n_in_row = Math.round(panelWidth / target_width);
            //protect division by zero
            width = (n_in_row !== 0) ? (100 / n_in_row) : 100;
        }
        return width + '%';
    }

    @listenTo(swatchesStore)
    onSwatchesChanged() {
        this.setState({
            palettes: swatchesStore.state.palettes,
            active: swatchesStore.state.active,
            fill: swatchesStore.state.fill,
            stroke:  swatchesStore.state.stroke,
            font:  swatchesStore.state.font
        });
    }

    @listenTo(propertyStore)
    onPropertiesUpdated() {
        //check the real selection since property store shows artboard properties when nothing is selected
        var selection = Selection.selectComposite();
        var fillBrush, strokeBrush, font;

        if (selection.elements.length) {
            var isShape = selection.elements.every(x => x instanceof Shape);

            if (propertyStore.hasProperty('fill')) {
                fillBrush = propertyStore.getPropertyValue('fill');
                if (isShape) {
                    app.defaultFill(fillBrush, ChangeMode.Root);
                }
            }
            if (propertyStore.hasProperty('stroke')) {
                strokeBrush = propertyStore.getPropertyValue('stroke');
                if (isShape) {
                    app.defaultStroke(strokeBrush, ChangeMode.Root);
                }
            }
        }
        else {
            fillBrush = app.defaultFill();
            strokeBrush = app.defaultStroke();
        }

        var active = this.state.active;
        if (propertyStore.hasProperty('font')) {
            font = propertyStore.getPropertyValue('font');
            if (fillBrush === Brush.Empty && strokeBrush === Brush.Empty) {
                active = 'font';
            }
        }
        else if (active === 'font') {
            active = 'fill';
        }

        var newState: ISwatchesPanelState = {
        };

        if (!this.state.recentColors || this.state.recentColors.colors !== app.recentColors()) {
            newState.recentColors = {
                name: '',
                colors: app.recentColors()
            };
        }

        this.setState(newState);
        richApp.dispatch(SwatchesActions.changeActiveColors(fillBrush, strokeBrush, font));
    };


    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if (!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        (this.refs['panel'] as Panel).updateSizeClasses();
        this._updateSwatchWidth();
    }

    _colorSelected(color, norecent) {
        var brush = color === 'transparent' ? Brush.Empty : Brush.createFromColor(color);

        if (this.state.active === 'fill') {
            app.defaultFill(brush);
        }
        else if (this.state.active === 'stroke') {
            app.defaultStroke(brush);
        }

        if (!norecent && color !== 'transparent') {
            app.useRecentColor(color);
        }

        var changes = {};
        var newValue: any = brush;
        if (this.state.active === 'font') {
            newValue = { color: brush.value };
        }
        changes[this.state.active] = newValue;

        var selection = Selection.selectComposite();
        if (selection.elements.length) {
            selection.updateDisplayProps(changes);
        }
        else {
            //since properties are not updated, trigger manual update
            this.onPropertiesUpdated();
        }
    }

    _renderPaletteItem(color, ind, mods, norecent?) {
        var style = { backgroundColor: color };
        return <div key={`${ind}_${color}`} title={color} className={b("swatch", mods)} onClick={() => this._colorSelected(color, norecent)}>
            <div className={b("swatch-color")} style={style}></div>
        </div>
    }

    _renderPaletteLine(gamma: { name: string; colors: string[] }, gamma_ind, renderNull, norecent) {
        var swatches = gamma.colors.map((color, ind) => {
            return this._renderPaletteItem(color, ind, null, norecent);
        });

        var first_slot = renderNull === true ? this._renderPaletteItem('transparent', gamma_ind, 'transparent') : null;

        return <div key={"gamma_line_" + gamma_ind} className={b("palette-line")}>
            {first_slot}
            {swatches}
        </div>
    }

    _renderRecentColors() {
        if (this.state.recentColors) {
            return this._renderPaletteLine(this.state.recentColors, 'recent', true, true);
        }

        return;
    }

    _renderPalette() {
        var rendered_colors = Gammas.map(this._renderPaletteLine.bind(this));
        var rendered_palettes = this.state.palettes.map(this._renderPaletteLine.bind(this));

        return <div key='palette' className={b("palette-wrap")}>
            <ScrollContainer className={b('palette-scroll-container', '', 'thin wrap')}
                boxClassName={b("palette")}>
                {this._renderRecentColors()}
                {rendered_palettes}
                {rendered_colors}
            </ScrollContainer></div>
    }

    _resolveSetActiveSlot(slot_name) {
        return (ev) => {
            ev.preventDefault();
            richApp.dispatch(SwatchesActions.changeActiveSlot(slot_name))
        }
    };

    _renderSlot = (slot) => {
        var caption = slot.caption == null
            ? null
            : (<div className={b("slot-caption")}>{slot.caption}</div>);

        var body = (<div className={b("slot-body")} style={slot.style}>
            <div className={b("slot-bg")}></div>
            <div className={b("slot-color")} style={slot.style}></div>
        </div>);

        return <div key={slot.name}
            title={`${slot.title}`}
            className={b("slot", [slot.name, slot.active ? "active" : null])}
            onClick={this._resolveSetActiveSlot(slot.name)}
        >{body}{caption}</div>
    };

    _renderFlyoutSlot = (slot) => {
        return <SwatchesSlot
            key={slot.name}
            renderContent={this._renderSlot.bind(this, slot)}
            slot={slot}
            colorSelected={this._colorSelected.bind(this)}
        />
    }

    _renderCurrent() {
        var slot_groups = {
            main: [],
            font: [],
        };

        ['fill', 'stroke', 'font'].map((slot_name) => {
            var group = slot_name === 'font' ? 'font' : 'main';

            let slot = {
                name: slot_name,
                caption: null,
                title: null,
                brush: null,
                style: null,
                active: null
            };

            if (slot_name === 'font') {
                if (!this.state.font) {
                    return null;
                }
                slot.caption = (<i className={b("slot-icon", slot_name)} />);
                var fontBrush = Brush.createFromColor(this.state.font.color);
                slot.title = fontBrush.value;
                slot.brush = fontBrush;
                slot.style = Brush.toCss(slot.brush);
            }
            else {
                if ((this.state[slot_name])) {
                    slot.brush = this.state[slot_name];
                    slot.style = Brush.toCss(slot.brush);
                    slot.title = slot.brush.value;
                }
                else {
                    slot.style = { backgroundColor: 'transparent' };
                    slot.title = '';
                    slot.brush = Brush.Empty;
                }
            }

            slot.active = this.state.active === slot_name;
            slot_groups[group].push(slot);
        });


        var main_rendered = slot_groups.main.map(this._renderFlyoutSlot);
        var text_rendered = slot_groups.font.map(this._renderFlyoutSlot);

        return <div key='current' className={b("current")}>
            <div key="main" className={b("slot-group", "main")}>
                {main_rendered}
            </div>
            <div key="text" className={b("slot-group", "text")}>{text_rendered}</div>
        </div>
    }

    onKeyPress = (event) => {
        if (event.keyCode == 120) {
            if (this.state.active === 'fill') {
                richApp.dispatch(SwatchesActions.changeActiveSlot('stroke'));
            } else {
                richApp.dispatch(SwatchesActions.changeActiveSlot('fill'));
            }
        }
    }

    componentDidMount() {
        super.componentDidMount();
        window.addEventListener('keypress', this.onKeyPress);
    }

    componentWillUnmound() {
        super.componentWillUnmount();
        window.removeEventListener('keypress', this.onKeyPress);
    }

    render() {
        return (
            <Panel ref="panel" {...this.props} header="Swatches" id="swatches-panel">
                {(this.state != null) ?
                    <style key='style'>{`.swatches-panel__swatch {width: ${this.state.swatch_width};}`}</style> : null}
                {this._renderCurrent()}
                {this._renderPalette()}
            </Panel>
        );
    }

}