import { handles, CarbonStore, dispatch, dispatchAction } from "../CarbonFlux";
import Immutable from "immutable";
import CarbonActions, { CarbonAction } from "../CarbonActions";
import { PropertyTracker, Selection, Brush, app, PropertyMetadata, ChangeMode, ArtboardType, ActionManager, UIElementFlags, Shape } from "carbon-core";
import { SwatchesAction, SwatchSlotName } from './SwatchesActions';
import { PropertyAction } from "./PropertyActions";
import { WorkspaceAction } from "../workspace/WorkspaceAction";

export type Slot = {
    name: SwatchSlotName;
    active: boolean;
    enabled: boolean;
    hasGradient: boolean;
    brush: Brush;
}
export type Palette = {
    id: string;
    name: string;
    colors: Brush[];
    pageId: string;
}
export type SwatchesStoreState = {
    fillSlot: Slot;
    strokeSlot: Slot;
    palettes: Palette[];
    recentColors: string[];
}

export class SwatchesStore extends CarbonStore<SwatchesStoreState> {
    constructor() {
        super();
        this.state = {
            palettes: [],
            recentColors: app.props.recentColors,
            fillSlot: {
                name: "fill",
                active: true,
                brush: Brush.Empty,
                enabled: true,
                hasGradient: true
            },
            strokeSlot: {
                name: "stroke",
                active: false,
                brush: Brush.Empty,
                enabled: true,
                hasGradient: false
            }
        };
    }

    getActiveSlotName(): SwatchSlotName {
        return this.state.fillSlot.active ? "fill" : "stroke";
    }

    update() {
        var fillBrush, strokeBrush;
        let hasGradient = false;
        let canFill = true;
        let canStroke = true;
        if (Selection.elements.length) {
            let composite = Selection.selectComposite();
            let isShape = Selection.elements.every(x => x instanceof Shape);
            canFill = composite.canFill();
            canStroke = composite.canStroke();

            let propertyOptions = composite.findPropertyDescriptor('fill').options;
            hasGradient = propertyOptions && propertyOptions.gradient || false;

            fillBrush = composite.getDisplayPropValue('fill') as Brush;
            if (isShape) {
                app.defaultFill(fillBrush, ChangeMode.Root);
            }
            strokeBrush = composite.getDisplayPropValue('stroke') as Brush;
            if (isShape) {
                app.defaultStroke(strokeBrush, ChangeMode.Root);
            }
        }
        else {
            fillBrush = app.defaultFill();
            strokeBrush = app.defaultStroke();
        }

        this.onSlotsUpdated(fillBrush || Brush.Empty, strokeBrush || Brush.Empty, canFill, canStroke, hasGradient);
    }

    onSlotsUpdated(fill: Brush, stroke: Brush, canFill = true, canStroke = true, hasFillGradient = true) {
        let fillSlot = Object.assign({}, this.state.fillSlot);
        fillSlot.brush = fill;

        let strokeSlot = Object.assign({}, this.state.strokeSlot);
        strokeSlot.brush = stroke;

        if (!canFill && !canStroke) {
            fillSlot.active = false;
            strokeSlot.active = false;
        }
        else if (!canFill) {
            fillSlot.active = false;
            fillSlot.enabled = false;
            strokeSlot.enabled = true;
            strokeSlot.active = true;
        }
        else if (!canStroke) {
            strokeSlot.active = false;
            strokeSlot.enabled = false;
            fillSlot.enabled = true;
            fillSlot.active = true;
        }
        else {
            fillSlot.enabled = true;
            strokeSlot.enabled = true;
        }

        fillSlot.hasGradient = hasFillGradient;

        this.setState({ fillSlot, strokeSlot })
    }

    onAppUpdated() {
        var paletteArtboards = app.getAllResourceArtboards(ArtboardType.Palette);
        var palettes = [];
        for (var i = 0; i < paletteArtboards.length; ++i) {
            palettes.push(this._buildPaletteForElement(paletteArtboards[i]));
        }

        this.setState({ palettes: palettes, recentColors: app.props.recentColors });
    }

    onActiveSlotChanged(active: SwatchSlotName) {
        if (active === "fill" && this.state.fillSlot.active || active === "stroke" && this.state.strokeSlot.active) {
            return;
        }

        let fillSlot = Object.assign({}, this.state.fillSlot);
        fillSlot.active = active === "fill";

        let strokeSlot = Object.assign({}, this.state.strokeSlot);
        strokeSlot.active = active === "stroke";

        this.setState({ fillSlot, strokeSlot });
    }

    onPropertyChanged(changes) {
        if (changes.fill || changes.stroke) {
            let brush: any;
            for (brush of [changes.fill, changes.stroke]) {
                if (brush && brush.value !== 'transparent') {
                    app.useRecentColor(brush.value);
                }
            }
        }
    }

    @handles(CarbonActions.recentColorsChanged)
    onRecentColorsChanged({ colors }) {
        this.setState({ recentColors: colors });
    }

    onAction(action: CarbonAction | SwatchesAction | PropertyAction | WorkspaceAction) {
        super.onAction(action);

        switch (action.type) {
            case "Swatches_Update":
                this.onSlotsUpdated(action.fill, action.stroke);
                return;
            case "Swatches_ChangeSlot":
                this.onActiveSlotChanged(action.active);
                return;

            case "Carbon_Selection":
                this.update();
                return;

            case "Properties_Changed":
                this.onPropertyChanged(action.changes);
                this.update();
                return;
            case "Properties_ChangedExternally":
                this.update();
                return;

            case "Carbon_AppUpdated":
                this.onAppUpdated();
                return;
            case "Carbon_ResourceAdded":
            case "Carbon_ResourceChanged":
                this.onPaletteChanged(action.resourceType, action.resource);
                return;
            case "Carbon_ResourceDeleted":
                this.onPaletteDeleted(action.resourceType, action.resource);
                return;

            case "Workspace_Command":
                if (action.command === "ui.transparentColor") {
                    this.onTransparentColor();
                }
                else if (action.command === "ui.swapSlots") {
                    this.onSwapSlots();
                }
                return;
        }
    }

    onPaletteChanged(resourceType, element) {
        if (resourceType !== ArtboardType.Palette) {
            return;
        }

        var palettes = this.state.palettes.slice();
        let palette = this._buildPaletteForElement(element);

        let inserted = false;
        for (var i = 0; i < palettes.length; ++i) {
            if (palettes[i].id === element.id()) {
                palettes.splice(i, 1, palette);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            palettes.push(palette);
        }

        this.setState({ palettes: palettes });
    }

    onPaletteDeleted(resourceType, element) {
        if (resourceType !== ArtboardType.Palette) {
            return;
        }

        var index = this.state.palettes.findIndex(p => p.id === element.id());
        if (index !== -1) {
            let palettes = this.state.palettes.slice();
            palettes.splice(index, 1);
            this.setState({ palettes: palettes });
        }
    }

    _buildPaletteForElement(element): Palette {
        var colors = [];
        var palette;
        element.applyVisitor(e => {
            if (e.hasFlags(UIElementFlags.PaletteItem)) {
                var fill = e.fill();
                if (fill && fill.value) {
                    colors.push(fill.value);
                }
            }
        });
        return { id: element.id(), name: element.name, colors: colors, pageId: element.primitiveRoot().id() };
    }

    private onTransparentColor() {
        var changes = {};
        changes[this.getActiveSlotName()] = { color: Brush.Empty.value };

        var selection = Selection.selectComposite();
        if (selection.elements.length) {
            selection.updateDisplayProps(changes);
        }

        if (this.state.fillSlot.active) {
            app.defaultFill(Brush.Empty);
            this.onSlotsUpdated(Brush.Empty, this.state.strokeSlot.brush);
        }
        else {
            app.defaultStroke(Brush.Empty);
            this.onSlotsUpdated(this.state.fillSlot.brush, Brush.Empty);
        }
    }
    private onSwapSlots() {
        if (!this.state.fillSlot.enabled || !this.state.strokeSlot.enabled) {
            return;
        }

        if (this.state.fillSlot.active) {
            this.onActiveSlotChanged("stroke");
        }
        else {
            this.onActiveSlotChanged("fill");
        }
    }
}

export const swatchesStore = new SwatchesStore();