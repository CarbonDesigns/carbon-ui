import { handles, CarbonStore, dispatch } from "../CarbonFlux";
import Immutable from "immutable";
import CarbonActions, { CarbonAction } from "../CarbonActions";
import { PropertyTracker, Selection, Brush, app, PropertyMetadata, ChangeMode, ArtboardType, ActionManager, UIElementFlags } from "carbon-core";
import SwatchesActions from './SwatchesActions';
import PropertyActions from "./PropertyActions";

interface IPalette {
    id: string,
    name: string,
    colors: string[],
    pageId: string
}
interface ISwatchesState {
    palettes: IPalette[],
    active?: string,
    fill?: any,
    stroke?: any;
    recentColors?:any[];
}

export class SwatchesStore extends CarbonStore<ISwatchesState> {
    constructor() {
        super();
        this.state = { palettes: [], active: 'fill', recentColors:app.props.recentColors };
        ActionManager.subscribe("transparentColor", () => {
            var changes = {};
            changes[this.state.active] = { color: Brush.Empty.value };

            var selection = Selection.selectComposite();
            if (selection.elements.length) {
                selection.updateDisplayProps(changes);
            }

            if (this.state.active === 'fill') {
                app.defaultFill(Brush.Empty);
                dispatch(SwatchesActions.changeActiveColors(Brush.Empty, this.state.stroke));
            }
            else if (this.state.active === 'stroke') {
                app.defaultStroke(Brush.Empty);
                dispatch(SwatchesActions.changeActiveColors(this.state.fill, Brush.Empty));
            }
        });
    }

    @handles(SwatchesActions.changeActiveColors)
    onActiveColorsChanged({ fill, stroke }) {
        this.setState({ fill, stroke })
    }

    onAppUpdated() {
        var paletteArtboards = app.getAllResourceArtboards(ArtboardType.Palette);
        var palettes = [];
        for (var i = 0; i < paletteArtboards.length; ++i) {
            palettes.push(this._buildPaletteForElement(paletteArtboards[i]));
        }

        this.setState({ palettes: palettes, recentColors:app.props.recentColors });
    }

    @handles(SwatchesActions.changeActiveSlot)
    onActiveSlotChanged({ active }) {
        this.setState({ active: active });
    }

    @handles(PropertyActions.changed)
    onPropertyChanged({ changes }) {
        if (changes.fill || changes.stroke) {
            let brush:any;
            for (brush of [changes.fill, changes.stroke]) {
                if (brush && brush.value !== 'transparent') {
                    app.useRecentColor(brush.value);
                }
            }
        }
    }

    @handles(CarbonActions.recentColorsChanged)
    onRecentColorsChanged({colors}) {
        this.setState({recentColors:colors});
    }

    onAction(action: CarbonAction) {
        super.onAction(action);

        switch (action.type) {
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

    _buildPaletteForElement(element): IPalette {
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
        return { id: element.id(), name: element.name(), colors: colors, pageId: element.primitiveRoot().id() };
    }
}

export default new SwatchesStore();