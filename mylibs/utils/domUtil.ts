export function nodeOffset(elem) {
    var docElem, win,
        box = {top: 0, left: 0},
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
        top: box.top + ( win.pageYOffset || docElem.scrollTop ) - ( docElem.clientTop || 0 ),
        left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
    };
}

export function findTransformProp(){
    return 'transform' in document.body.style
        ? 'transform' : 'webkitTransform' in document.body.style
        ? 'webkitTransform' : 'mozTransform' in document.body.style
        ? 'mozTransform' : 'oTransform' in document.body.style
        ? 'oTransform' : 'msTransform';
}