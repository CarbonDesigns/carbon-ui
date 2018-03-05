import React from 'react';
import { Component, listenTo, dispatch, handles, dispatchAction, StoreComponent } from "../CarbonFlux";
import { richApp } from "../RichApp";
import Panel from '../layout/Panel'
import { Brush, app, ChangeMode, Shape, Selection, BrushType } from "carbon-core";
import bem from '../utils/commonUtils';
import ScrollContainer from "../shared/ScrollContainer";
import { Gammas } from "../properties/editors/BrushGammaSelector";
import ReactDom from "react-dom";
import propertyStore from "../properties/PropertyStore";
import { swatchesStore, Slot, SwatchesStoreState } from "../properties/SwatchesStore";
import FlyoutButton from '../shared/FlyoutButton';
import BrushSelector from "../properties/editors/BrushSelector";


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
        brush = Brush.createFromCssColor(color);
    }
    return brush;
}

interface SwatchesSlotProps {
    slot: Slot;
    colorSelected: (brush: Brush, norecent: boolean, preview: boolean) => void;
}
class SwatchesSlot extends Component<SwatchesSlotProps> {
    private _lastValue;
    private _initialValue;

    private onSlotClicked = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (this.props.slot.enabled) {
            dispatchAction({ type: "Swatches_ChangeSlot", active: this.props.slot.name });
        }
    }

    render() {
        return <FlyoutButton ref="flyout"
            renderContent={this.renderSlot}
            showAction={this.props.slot.enabled ? "dblclick" : "none"}
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
                hasGradient={this.props.slot.hasGradient}
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

    private renderSlot = () => {
        let slot = this.props.slot;
        let style = Brush.toCss(slot.brush);
        var body = (<div className={b("slot-body")} style={style}>
            <div className={b("slot-bg")}></div>
            <div className={b("slot-color")} style={style}></div>
            {slot.enabled ? null : <i className={b("slot-locked", null, "ico ico-prop ico-prop_lock")}></i>}
        </div>);

        return <div key={slot.name}
            title={`${slot.name} ${slot.brush.type === BrushType.color ? slot.brush.value : ""}`}
            className={b("slot", [slot.name, slot.active ? "active" : null])}
            onClick={this.onSlotClicked}
        >{body}</div>
    };
}

export default class SwatchesPanel extends StoreComponent<{}, SwatchesStoreState> {
    constructor(props) {
        super(props, swatchesStore);
    }

    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if (!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        (this.refs['panel'] as Panel).updateSizeClasses();
    }

    _colorSelected = (color, norecent, preview) => {
        var brush = colorToBrush(color);

        if (!preview && this.state.fillSlot.active) {
            app.defaultFill(brush);
        }
        else if (!preview && this.state.strokeSlot.active) {
            app.defaultStroke(brush);
        }

        // if (!norecent && color !== 'transparent') {
        //     app.useRecentColor(color);
        // }

        var changes = {};
        changes[swatchesStore.getActiveSlotName()] = brush;

        var selection = Selection.selectComposite();
        if (selection.elements.length) {
            if (preview) {
                dispatchAction({ type: "Properties_Preview", changes, async: true });
            }
            else {
                dispatchAction({ type: "Properties_Changed", changes, async: true });
            }
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
            return this._renderPaletteLine({name: 'recent', colors: this.state.recentColors}, 'recent', true, true);
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

    _renderFlyoutSlot = (slot) => {
        return <SwatchesSlot
            slot={slot}
            colorSelected={this._colorSelected}
        />
    }

    _renderCurrent() {
        return <div key='current' className={b("current")}>
            <div className={b("slot-group", "main")}>
                {this._renderFlyoutSlot(this.state.fillSlot)}
                {this._renderFlyoutSlot(this.state.strokeSlot)}
            </div>
        </div>
    }

    render() {
        let {children, ...rest} = this.props;
        return (
            <Panel ref="panel" {...rest} header="Swatches" id="swatches-panel">
                {this._renderCurrent()}
                {this._renderPalette()}
            </Panel>
        );
    }

}