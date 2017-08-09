var fullScreenApi = {
    supportsFullScreen: false,
    isFullScreen() {
        return false;
    },
    requestFullScreen(el: HTMLElement) {
    },
    cancelFullScreen() {
    },
    fullScreenEventName: "",
    prefix: ""
};

var browserPrefixes = "webkit moz o ms khtml".split(" ");

if (typeof document["cancelFullScreen"] !== "undefined") {
    fullScreenApi.supportsFullScreen = true;
}
else {
    for (var i = 0, il = browserPrefixes.length; i < il; i++) {
        fullScreenApi.prefix = browserPrefixes[i];

        if (typeof document[fullScreenApi.prefix + "CancelFullScreen"] !== "undefined") {
            fullScreenApi.supportsFullScreen = true;
            break;
        }
    }
}

if (fullScreenApi.supportsFullScreen) {
    fullScreenApi.fullScreenEventName = fullScreenApi.prefix + "fullscreenchange";

    fullScreenApi.isFullScreen = function () {
        //not perfect, but quite reliable
        return window.innerWidth === screen.width;
    }
    fullScreenApi.requestFullScreen = function (el) {
        return (this.prefix === "") ? el.requestFullscreen() : el[this.prefix + "RequestFullScreen"]();
    }
    fullScreenApi.cancelFullScreen = function () {
        return (this.prefix === "") ? document["cancelFullScreen"]() : document[this.prefix + "CancelFullScreen"]();
    }
}

export default fullScreenApi;