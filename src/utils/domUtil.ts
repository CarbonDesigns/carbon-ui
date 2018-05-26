export function nodeOffset(elem) {
    var docElem, win,
        box = { top: 0, left: 0 },
        doc = elem && elem.ownerDocument;

    if (!doc) {
        return;
    }

    docElem = doc.documentElement;

    // If we don't have gBCR, just use 0,0 rather than error
    // BlackBerry 5, iOS 3 (original iPhone)
    if (typeof elem.getBoundingClientRect !== "undefined") {
        box = elem.getBoundingClientRect();
    }
    win = window;
    return {
        top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
        left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
    };
}

/**
 * Ensures that an absolutely positioned element is not clipped by the specified container.
 * @param element The element to position.
 * @param container The container to use as a constraint.
 */
export function ensureElementVisible(element: HTMLElement, container: HTMLElement, paddingRight = 0, paddingBottom = 0) {
    var documentWidth = container.clientWidth - paddingRight;
    var offset = nodeOffset(element);

    if (offset.left + element.clientWidth > documentWidth) {
        element.style.right = paddingRight + 'px';
        element.style.left = 'inherit';
    }

    var documentHeight = container.clientHeight - paddingBottom;
    var actualHeight = element.offsetHeight;
    if (actualHeight === 0) {
        for (var i = 0; i < element.children.length; ++i) {
            var c = element.children[i] as any;
            actualHeight += c.offsetHeight;
        }
    }
    var heightDiff = documentHeight - offset.top - actualHeight;
    if (heightDiff < 0) {
        element.style.top = (element.offsetTop + heightDiff) + "px";
    }
    element.style.position = 'absolute';
}

export function findTransformProp() {
    return 'transform' in document.body.style
        ? 'transform' : 'webkitTransform' in document.body.style
            ? 'webkitTransform' : 'mozTransform' in document.body.style
                ? 'mozTransform' : 'oTransform' in document.body.style
                    ? 'oTransform' : 'msTransform';
}

function checkIsRetina() {
    if (window.matchMedia) {
        var mq = window.matchMedia("only screen and (-moz-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
        if (mq && mq.matches) {
            return true;
        }
    }
    return false;
}
export const isRetina = checkIsRetina();

const transitionEvents = ["transitionend", "webkitTransitionEnd", "oTransitionEnd", "otransitionend", "MSTransitionEnd"];
export function onCssTransitionEnd(element, func, maxDelay) {
    var timer = 0;
    var onEnd = function () {
        if (timer) {
            clearTimeout(timer);
        }
        for (var i = 0; i < transitionEvents.length; i++) {
            var event = transitionEvents[i];
            element.removeEventListener(event, onEnd);
        }
        func();
    };
    for (var i = 0; i < transitionEvents.length; i++) {
        var event = transitionEvents[i];
        element.addEventListener(event, onEnd);
    }
    if (maxDelay) {
        timer = setTimeout(onEnd, maxDelay);
    }
}