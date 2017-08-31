import { dispatch, dispatchAction } from "./CarbonFlux";
import AppActions from "./RichAppActions";
import { app } from "carbon-core";

function registerTabAction(area, tab) {
    app.actionManager.registerAction(area + tab, area + tab, "Navigation", function () {
        dispatchAction({ type: "Library_Tab", area, tabId: "" + tab});
    });
}

export function init() {
    for (var i = 1; i <= 4; i++) {
        registerTabAction("library", i);
    }
}

export default {init:init}