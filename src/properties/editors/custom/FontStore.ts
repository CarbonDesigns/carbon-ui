import { backend, FontMetadata, app } from "carbon-core";
import { fetchJson } from "../../../utils/fetchUtil";
import { WebFonts } from "./FontActions";
import { dispatchAction, CarbonStore } from "../../../CarbonFlux";
import { FontAction, FontCategory } from "./FontActions";

export type FontStoreState = {
    webFonts: WebFonts;
    webSpriteUrl: string;
    currentList: FontMetadata[];
    popularFonts: FontMetadata[];
    category: FontCategory;
    searchTerm: string;
}

class FontStore extends CarbonStore<FontStoreState> {
    constructor() {
        super();

        this.state = {
            currentList: [],
            webFonts: { collection: [], popular: [], spriteFile: "", spriteSize: [0, 0], spriteMap: {} },
            popularFonts: [],
            webSpriteUrl: "url('" + backend.cdnEndpoint + "/fonts/webFonts.png')",
            category: FontCategory.Popular,
            searchTerm: ""
        }
    }

    onAction(action: FontAction) {
        switch (action.type) {
            case "Fonts_WebFontsLoaded":
                let popularFonts = this.filterPopularFonts(action.fonts);
                this.setState({ webFonts: action.fonts, currentList: popularFonts, popularFonts });
                return;
            case "Fonts_ToggleCategory":
                let newCategory;
                if (action.category === this.state.category) {
                    newCategory = FontCategory.All;
                }
                else {
                    newCategory = action.category;
                }

                let list = this.getFullList(newCategory);
                this.setState({ category: newCategory, currentList: list, searchTerm: "" });
                return;
            case "Fonts_Search":
                this.onSearch(action.term);
                return;
        }
    }

    loadFonts() {
        if (this.state.webFonts.collection.length) {
            return;
        }

        fetchJson<WebFonts>(backend.cdnEndpoint + "/fonts/webFonts.json")
            .then(fonts => dispatchAction({ type: "Fonts_WebFontsLoaded", fonts }));
    }

    private filterPopularFonts(webFonts: WebFonts): FontMetadata[] {
        return webFonts.popular.map(x => webFonts.collection.find(f => f.name === x));
    }

    private onSearch(term: string) {
        let lower = term.trim().toLowerCase();
        let list = this.getFilteredList(term, FontCategory.All)
        this.setState({ currentList: list, searchTerm: term, category: FontCategory.All });
    }

    private getFilteredList(term: string, category: FontCategory) {
        let lower = term.trim().toLowerCase();
        let fullList = this.getFullList(category);
        if (lower === "") {
            return fullList;
        }
        return fullList.filter(x => {
            return x && x.name.toLowerCase().indexOf(lower) >= 0;
        });
    }

    private getFullList(category: FontCategory) {
        switch (category) {
            case FontCategory.All:
                return this.state.webFonts.collection;
            case FontCategory.Popular:
                return this.state.popularFonts;
            case FontCategory.Recent:
                return app.props.fontMetadata.reverse();
            case FontCategory.Favorites:
                return [];
        }
        assertNever(category);
    }
}

export default new FontStore();