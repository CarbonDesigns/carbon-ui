import { handles, CarbonStore, dispatch } from "../CarbonFlux";
import Immutable from "immutable";
import CarbonActions from "../CarbonActions";
import { PropertyTracker, Selection, Brush, app, PropertyMetadata, ChangeMode, ArtboardType, ActionManager, UIElementFlags } from "carbon-core";
import SwatchesActions from './SwatchesActions';

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
    stroke?: any,
    font?: any
}

export class SwatchesStore extends CarbonStore<ISwatchesState> {
    constructor() {
        super();
        this.state = { palettes: [], active: 'fill' };
        ActionManager.subscribe("transparentColor", () => {
            var changes = {};
            changes[this.state.active] = { color: Brush.Empty.value };

            var selection = Selection.selectComposite();
            if (selection.elements.length) {
                selection.updateDisplayProps(changes);
            }

            if (this.state.active === 'fill') {
                app.defaultFill(Brush.Empty);
                dispatch(SwatchesActions.changeActiveColors(Brush.Empty, this.state.stroke, this.state.font));
            }
            else if (this.state.active === 'stroke') {
                app.defaultStroke(Brush.Empty);
                dispatch(SwatchesActions.changeActiveColors(this.state.fill, Brush.Empty, this.state.font));
            }
        });
    }

    @handles(SwatchesActions.changeActiveColors)
    onActiveColorsChanged({ fill, stroke, font }) {
        this.setState({ fill, stroke, font })
    }

    @handles(CarbonActions.pageAdded)
    onPageAdded({ page }) {
        var paletteArtboards = page.getAllPalettes();
        var palettes = this.state.palettes.slice();
        for (var i = 0; i < paletteArtboards.length; ++i) {
            palettes.push(this._buildPaletteForElement(paletteArtboards[i]));
        }

        this.setState({ palettes: palettes });
    }

    @handles(CarbonActions.loaded)
    onAppLoaded({ app }) {
        var paletteArtboards = app.getAllPalettes();
        var palettes = [];
        for (var i = 0; i < paletteArtboards.length; ++i) {
            palettes.push(this._buildPaletteForElement(paletteArtboards[i]));
        }

        this.setState({ palettes: palettes });
    }

    @handles(CarbonActions.pageRemoved)
    onPageRemoved({ page }) {
        var palettes = this.state.palettes.slice();
        for (var i = palettes.length - 1; i >= 0; --i) {
            if (palettes[i].pageId === page.id()) {
                palettes.splice(i, 1);
            }
        }

        this.setState({ palettes: palettes });
    }

    @handles(SwatchesActions.changeActiveSlot)
    onActiveSlotChanged({ active }) {
        this.setState({ active: active });
    }

    @handles(CarbonActions.resourceChanged)
    onPaletteChanged({ resourceType, element }) {
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

    @handles(CarbonActions.resourceDeleted)
    onPaletteDeleted({ resourceType, element }) {
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