import { dispatch } from "./CarbonFlux";
import AppActions from "./RichAppActions";
import LibraryActions from "./library/LibraryActions";
import { app } from "carbon-core";

function registerTabAction(area, tab) {
    app.actionManager.registerAction(area + tab, area + tab, "Navigation", function () {
        dispatch(LibraryActions.changeTab(area, "" + tab));
    });
}

export function init() {
    for (var i = 1; i <= 4; i++) {
        registerTabAction("library", i);
    }
}

export default {init:init}