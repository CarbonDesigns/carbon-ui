import { CarbonGlobals } from "carbon-api";

var carbon = window['c'] as CarbonGlobals;

export function loadCore(): Promise<void> {
    if (carbon.coreLoaded) {
        return Promise.resolve();
    }

    return new Promise(resolve => {
        carbon.coreCallback = resolve;

        var script = document.createElement("script");
        script.async = true;
        script.src = carbon.coreScript;
        script.crossOrigin = "anonymous";
        document.body.appendChild(script);
    });
}