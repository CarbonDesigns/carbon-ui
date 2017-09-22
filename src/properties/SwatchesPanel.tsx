import React from 'react';
import { Component, listenTo, dispatch, handles } from "../CarbonFlux";
import { richApp } from "../RichApp";
import Panel from '../layout/Panel'
import { Brush, app, ChangeMode, Shape, Selection } from "carbon-core";
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

function colorToBrush(color) {
    let brush;

    if (color === 'transparent') {
        brush = Brush.Empty;
    } else if (color.stops) {
        brush = Brush.createFromLinearGradientObject(color);
    } else {
        brush = Brush.createFromColor(color);
    }
    return brush;
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
                    this.props.colorSelected(this._lastValue, false, false);
                    delete this._lastValue;
                }
            }}>

            <BrushSelector className="flyout__content" ref="selector"
                brush={this.props.slot.brush}
                hasGradient={this.props.hasGradient}
                onSelected={(brush) => {
                    this.props.colorSelected(brush.value, true, false);
                    this._lastValue = brush.value;
                }}
                onPreview={
                    (brush) => {
                        this.props.colorSelected(brush.value, true, true);
                    }
                }
                onCancelled={() => {
                    this.props.colorSelected(this._initialValue.value, true, false);
                    delete this._lastValue;
                }} />
        </FlyoutButton>
    }
}

interface ISwatchesPanelState {
    active?: string;
    recentColors?: { name: string; colors: string[] };
    palettes?: any[];
    fill?: any;
    stroke?: any;
    hasGradient?: boolean;
}

export default class SwatchesPanel extends Component<any, ISwatchesPanelState> {
    constructor(props) {
        super(props);
        var state: ISwatchesPanelState = {
            active: swatchesStore.state.active,
            recentColors: { name: '', colors: swatchesStore.state.recentColors },
            palettes: []
        };
        this.state = state;
    }

    @listenTo(swatchesStore)
    onSwatchesChanged() {
        var newState:any = {
            palettes: swatchesStore.state.palettes,
            active: swatchesStore.state.active,
            fill: swatchesStore.state.fill,
            stroke: swatchesStore.state.stroke
        };

        if (!this.state.recentColors || this.state.recentColors.colors !== swatchesStore.state.recentColors) {
            newState.recentColors = {
                name: '',
                colors: swatchesStore.state.recentColors
            };
        }

        this.setState(newState);
    }

    @listenTo(propertyStore)
    onPropertiesUpdated() {
        //check the real selection since property store shows artboard properties when nothing is selected
        var selection = Selection.selectComposite();
        var fillBrush, strokeBrush;
        let hasGradient = false;
        if (selection.elements.length) {
            var isShape = selection.elements.every(x => x instanceof Shape);

            hasGradient = propertyStore.getPropertyOptions('fill').gradient || false;

            if (propertyStore.hasProperty('fill', true)) {
                fillBrush = propertyStore.getPropertyValue('fill');

                if (isShape) {
                    app.defaultFill(fillBrush, ChangeMode.Root);
                }
            }
            if (propertyStore.hasProperty('stroke', true)) {
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

        var newState: ISwatchesPanelState = {
            hasGradient: hasGradient
        };

        this.setState(newState);
        richApp.dispatch(SwatchesActions.changeActiveColors(fillBrush, strokeBrush));
    };


    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if (!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        (this.refs['panel'] as Panel).updateSizeClasses();
    }

    _colorSelected(color, norecent, preview) {
        var brush = colorToBrush(color);


        if (!preview && this.state.active === 'fill') {
            app.defaultFill(brush);
        }
        else if (!preview && this.state.active === 'stroke' ) {
            app.defaultStroke(brush);
        }

        // if (!norecent && color !== 'transparent') {
        //     app.useRecentColor(color);
        // }

        var changes = {};
        changes[this.state.active] = brush;

        var selection = Selection.selectComposite();
        if (selection.elements.length) {
            if (preview) {
                richApp.Dispatcher.dispatchAsync(PropertyActions.preview(changes));
            } else {
                richApp.Dispatcher.dispatchAsync(PropertyActions.changed(changes));
            }
        }
        else {
            //since properties are not updated, trigger manual update
            this.onPropertiesUpdated();
        }
    }

    _renderPaletteItem(color, ind, mods, norecent?) {
        var style = Brush.toCss(colorToBrush(color));
        return <div key={`${ind}_${color}`} title={color} className={b("swatch", mods)} onClick={() => this._colorSelected(color, norecent, false)}>
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
        var caption = !slot.caption
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
            hasGradient={slot.name === 'fill' && this.state.hasGradient}
            renderContent={this._renderSlot.bind(this, slot)}
            slot={slot}
            colorSelected={this._colorSelected.bind(this)}
        />
    }

    _renderCurrent() {
        var slots = ['fill', 'stroke'].map((slot_name) => {
            let slot = {
                name: slot_name,
                caption: null,
                title: null,
                brush: null,
                style: null,
                active: null
            };

            if ((this.state[slot_name])) {
                slot.brush = this.state[slot_name];
                slot.style = Brush.toCss(slot.brush);
                slot.title = slot.brush.value;
                slot.active = this.state.active === slot_name;
                return this._renderFlyoutSlot(slot);
            }

            return null;
        });

        return <div key='current' className={b("current")}>
            <div className={b("slot-group", "main")}>
                {slots}
            </div>
        </div>
    }

    onKeyPress = (event) => {
        if (event.keyCode === 120) {
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

    componentWillUnmount() {
        super.componentWillUnmount();
        window.removeEventListener('keypress', this.onKeyPress);
    }

    render() {
        return (
            <Panel ref="panel" {...this.props} header="Swatches" id="swatches-panel">
                {this._renderCurrent()}
                {this._renderPalette()}
            </Panel>
        );
    }

}