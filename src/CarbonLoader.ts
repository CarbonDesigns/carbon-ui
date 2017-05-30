interface Carbon{
    coreScript: string;
    coreLoaded: boolean;
    coreCallback: () => void;
}

var carbon = window['c'] as Carbon;

export function loadCore(cb: () => void): void{
    if (carbon.coreLoaded){
        return cb();
    }
    carbon.coreCallback = cb;

    var script = document.createElement("script");
    script.async = true;
    script.src = carbon.coreScript;
    document.body.appendChild(script);
}