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

/**
 * Ensures that an absolutely positioned element is not clipped by the specified container.
 * @param element The element to position.
 * @param container The container to use as a constraint.
 */
export function ensureElementVisible(element: HTMLElement, container: HTMLElement) {
    var documentWidth = container.clientWidth;
    var offset = nodeOffset(element);

    if (offset.left + element.clientWidth > documentWidth) {
        element.style.right = '0px';
        element.style.left = 'inherit';
    }

    var documentHeight = container.clientHeight;
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
}

export function findTransformProp(){
    return 'transform' in document.body.style
        ? 'transform' : 'webkitTransform' in document.body.style
        ? 'webkitTransform' : 'mozTransform' in document.body.style
        ? 'mozTransform' : 'oTransform' in document.body.style
        ? 'oTransform' : 'msTransform';
}