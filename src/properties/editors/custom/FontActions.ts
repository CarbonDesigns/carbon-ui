import { FontMetadata } from "carbon-core";

export type WebFonts = {
    collection: FontMetadata[];
    popular: string[];
    spriteFile: string;
    spriteSize: number[];
    spriteMap: {[key: string]: number[]};
}

export const enum FontCategory {
    Recent,
    Popular,
    Favorites,
    All
}

export type FontAction =
    { type: "Fonts_WebFontsLoaded", fonts: WebFonts } |
    { type: "Fonts_ToggleCategory", category: FontCategory } |
    { type: "Fonts_Search", term: string };