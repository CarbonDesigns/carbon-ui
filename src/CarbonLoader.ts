import { CarbonGlobals } from "carbon-api";

var carbon = window['c'] as CarbonGlobals;

export function loadCore(cb: () => void): void{
    if (carbon.coreLoaded){
        return cb();
    }
    carbon.coreCallback = cb;

    var script = document.createElement("script");
    script.async = true;
    script.src = carbon.coreScript;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
}