
var isMultiTouch = false;
var multiTouchStartPos;
var eventTarget;
var touchElements = {};

declare var document: any;

// polyfills
if (!document.createTouch) {
    document.createTouch = function (view, target, identifier, pageX, pageY, screenX, screenY, clientX, clientY) {
        // auto set
        if (clientX === undefined || clientY === undefined) {
            clientX = pageX - window.pageXOffset;
            clientY = pageY - window.pageYOffset;
        }

        return new Touch(target, identifier, {
            pageX: pageX,
            pageY: pageY,
            screenX: screenX,
            screenY: screenY,
            clientX: clientX,
            clientY: clientY
        });
    };
}

if (!document.createTouchList) {
    document.createTouchList = function () {
        var touchList = new TouchList();
        for (var i = 0; i < arguments.length; i++) {
            touchList[i] = arguments[i];
        }
        touchList.length = arguments.length;
        return touchList;
    };
}

/**
 * create an touch point
 * @constructor
 * @param target
 * @param identifier
 * @param pos
 * @param deltaX
 * @param deltaY
 * @returns {Object} touchPoint
 */
function Touch(target, identifier, pos?, deltaX?, deltaY?):void {
    deltaX = deltaX || 0;
    deltaY = deltaY || 0;

    this.identifier = identifier;
    this.target = target;
    this.clientX = pos.clientX + deltaX;
    this.clientY = pos.clientY + deltaY;
    this.screenX = pos.screenX + deltaX;
    this.screenY = pos.screenY + deltaY;
    this.pageX = pos.pageX + deltaX;
    this.pageY = pos.pageY + deltaY;
}

/**
 * create empty touchlist with the methods
 * @constructor
 * @returns touchList
 */

class TouchList extends Array {
    item (index) {
        return this[index] || null;
    };

    // specified by Mozilla
    identifiedTouch (id) {
        return this[id + 1] || null;
    };

}

/**
 * Simple trick to fake touch event support
 * this is enough for most libraries like Modernizr and Hammer
 */
function fakeTouchSupport() {
    var objs = [window, document.documentElement];
    var props = ['ontouchstart', 'ontouchmove', 'ontouchcancel', 'ontouchend'];

    for (var o = 0; o < objs.length; o++) {
        for (var p = 0; p < props.length; p++) {
            if (objs[o] && objs[o][props[p]] === undefined) {
                objs[o][props[p]] = null;
            }
        }
    }
}

/**
 * we don't have to emulate on a touch device
 * @returns {boolean}
 */
function hasTouchSupport() {
    return ("ontouchstart" in window) || // touch events
        ((window as any).Modernizr && (window as any).Modernizr.touch) || // modernizr
        (navigator.msMaxTouchPoints || navigator.maxTouchPoints) > 2; // pointer events
}

/**
 * disable mouseevents on the page
 * @param ev
 */
function preventMouseEvents(ev) {
    ev.preventDefault();
    ev.stopPropagation();
}

/**
 * only trigger touches when the left mousebutton has been pressed
 * @param touchType
 * @returns {Function}
 */
var pressed = false;
function onMouse(touchType) {
    return function (ev) {
        // prevent mouse events
        preventMouseEvents(ev);

        // The EventTarget on which the touch point started when it was first placed on the surface,
        // even if the touch point has since moved outside the interactive area of that element.
        // also, when the target doesnt exist anymore, we update it
        if (ev.type === 'mousedown'|| ev.type === 'pointerdown'|| !eventTarget || (eventTarget && !eventTarget.dispatchEvent)) {
            eventTarget = ev.target;
        }

        if (ev.witch === 1 && ev.type === 'mousedown'|| ev.type === 'pointerdown') {
            pressed = true;
        }

        if(!pressed) {
            return;
        }

        // shiftKey has been lost, so trigger a touchend
        if (isMultiTouch && !ev.shiftKey) {
            triggerTouch('touchend', ev);
            isMultiTouch = false;
        }

        triggerTouch(touchType, ev);

        // we're entering the multi-touch mode!
        if (!isMultiTouch && ev.shiftKey) {
            isMultiTouch = true;
            multiTouchStartPos = {
                pageX: ev.pageX,
                pageY: ev.pageY,
                clientX: ev.clientX,
                clientY: ev.clientY,
                screenX: ev.screenX,
                screenY: ev.screenY
            };
            triggerTouch('touchstart', ev);
        }

        // reset
        if (ev.type === 'mouseup' || ev.type === 'pointerup') {
            multiTouchStartPos = null;
            isMultiTouch = false;
            eventTarget = null;
            pressed = false;
        }
    }
}

/**
 * trigger a touch event
 * @param eventName
 * @param mouseEv
 */
function triggerTouch(eventName, mouseEv) {
    var touchEvent: any = document.createEvent('Event');
    touchEvent.initEvent(eventName, true, true);

    touchEvent.altKey = mouseEv.altKey;
    touchEvent.ctrlKey = mouseEv.ctrlKey;
    touchEvent.metaKey = mouseEv.metaKey;
    touchEvent.shiftKey = mouseEv.shiftKey;
    touchEvent.emulated = true;

    touchEvent.touches = getActiveTouches(mouseEv, eventName);
    touchEvent.targetTouches = getActiveTouches(mouseEv, eventName);
    touchEvent.changedTouches = getChangedTouches(mouseEv, eventName);

    eventTarget.dispatchEvent(touchEvent);
}

/**
 * create a touchList based on the mouse event
 * @param mouseEv
 * @returns {TouchList}
 */
function createTouchList(mouseEv) {
    var touchList = new TouchList();

    if (isMultiTouch) {
        var f = TouchEmulator.multiTouchOffset;
        var deltaX = multiTouchStartPos.pageX - mouseEv.pageX;
        var deltaY = multiTouchStartPos.pageY - mouseEv.pageY;

        touchList.push(new Touch(eventTarget, 1, multiTouchStartPos, (deltaX * -1) - f, (deltaY * -1) + f));
        touchList.push(new Touch(eventTarget, 2, multiTouchStartPos, deltaX + f, deltaY - f));
    } else {
        touchList.push(new Touch(eventTarget, 1, mouseEv, 0, 0));
    }

    return touchList;
}

/**
 * receive all active touches
 * @param mouseEv
 * @returns {TouchList}
 */
function getActiveTouches(mouseEv, eventName) {
    // empty list
    if (mouseEv.type === 'mouseup' || mouseEv.type === 'pointerup') {
        return new TouchList();
    }

    var touchList = createTouchList(mouseEv);
    if (isMultiTouch && mouseEv.type !== 'mouseup'&& mouseEv.type !== 'pointerup' && eventName === 'touchend') {
        touchList.splice(1, 1);
    }
    return touchList;
}

/**
 * receive a filtered set of touches with only the changed pointers
 * @param mouseEv
 * @param eventName
 * @returns {TouchList}
 */
function getChangedTouches(mouseEv, eventName) {
    var touchList = createTouchList(mouseEv);

    // we only want to return the added/removed item on multitouch
    // which is the second pointer, so remove the first pointer from the touchList
    //
    // but when the mouseEv.type is mouseup, we want to send all touches because then
    // no new input will be possible
    if (isMultiTouch && mouseEv.type !== 'mouseup'&& mouseEv.type !== 'pointerup' &&
        (eventName === 'touchstart' || eventName === 'touchend')) {
        touchList.splice(0, 1);
    }

    return touchList;
}

/**
 * show the touchpoints on the screen
 */
function showTouches(ev) {
    var touch, i, el, styles;

    // first all visible touches
    for (i = 0; i < ev.touches.length; i++) {
        touch = ev.touches[i];
        el = touchElements[touch.identifier];
        if (!el) {
            el = touchElements[touch.identifier] = document.createElement("div");
            document.body.appendChild(el);
        }

        styles = TouchEmulator.template(touch);
        for (var prop in styles) {
            el.style[prop] = styles[prop];
        }
    }

    // remove all ended touches
    if (ev.type === 'touchend' || ev.type === 'touchcancel') {
        for (i = 0; i < ev.changedTouches.length; i++) {
            touch = ev.changedTouches[i];
            el = touchElements[touch.identifier];
            if (el) {
                el.parentNode.removeChild(el);
                delete touchElements[touch.identifier];
            }
        }
    }
}

/**
 * TouchEmulator initializer
 */
export class TouchEmulator {
    private _touchStart: any;
    private _touchMove: any;
    private _touchEnd: any;
    private _host:any;

    enable(host:any, force:boolean) {
        if (!force && hasTouchSupport()) {
            return;
        }

        if (!hasTouchSupport()) {
            fakeTouchSupport();
        }

        this._host = host;
        host = host || window;

        this._touchStart = onMouse('touchstart');
        this._touchMove = onMouse('touchmove');
        this._touchEnd = onMouse('touchend');

        host.addEventListener("pointerdown", this._touchStart, true);
        host.addEventListener("pointermove", this._touchMove, true);
        host.addEventListener("pointerup", this._touchEnd, true);
        host.addEventListener("mousedown", this._touchStart, true);
        host.addEventListener("mousemove", this._touchMove, true);
        host.addEventListener("mouseup", this._touchEnd, true);

        host.addEventListener("mouseenter", preventMouseEvents, true);
        host.addEventListener("mouseleave", preventMouseEvents, true);
        host.addEventListener("mouseout", preventMouseEvents, true);
        host.addEventListener("mouseover", preventMouseEvents, true);
        host.addEventListener("pointerenter", preventMouseEvents, true);
        host.addEventListener("pointerleave", preventMouseEvents, true);
        host.addEventListener("pointerout", preventMouseEvents, true);
        host.addEventListener("pointerover", preventMouseEvents, true);

        // it uses itself!
        host.addEventListener("touchstart", showTouches, true);
        host.addEventListener("touchmove", showTouches, true);
        host.addEventListener("touchend", showTouches, true);
        host.addEventListener("touchcancel", showTouches, true);
    }

    disable() {
        let  host = this._host || window;
        host.removeEventListener("mousedown", this._touchStart);
        host.removeEventListener("mousemove", this._touchMove);
        host.removeEventListener("mouseup", this._touchEnd);
        host.removeEventListener("mouseenter", preventMouseEvents);
        host.removeEventListener("mouseleave", preventMouseEvents);
        host.removeEventListener("mouseout", preventMouseEvents);
        host.removeEventListener("mouseover", preventMouseEvents);
        host.removeEventListener("pointerdown", this._touchStart);
        host.removeEventListener("pointermove", this._touchMove);
        host.removeEventListener("pointerup", this._touchEnd);
        host.removeEventListener("pointerenter", preventMouseEvents);
        host.removeEventListener("pointerleave", preventMouseEvents);
        host.removeEventListener("pointerout", preventMouseEvents);
        host.removeEventListener("pointerover", preventMouseEvents);

        // it uses itself!
        host.removeEventListener("touchstart", showTouches);
        host.removeEventListener("touchmove", showTouches);
        host.removeEventListener("touchend", showTouches);
        host.removeEventListener("touchcancel", showTouches);
    }

    // start distance when entering the multitouch mode
    static multiTouchOffset = 75;

    /**
     * css template for the touch rendering
     * @param touch
     * @returns object
     */
    static template = function (touch) {
        var size = 64;
        var transform = 'translate(' + (touch.clientX - (size / 2)) + 'px, ' + (touch.clientY - (size / 2)) + 'px)';
        return {
            position: 'fixed',
            left: 0,
            top: 0,
            background: '#fff',
            border: 'solid 1px #999',
            opacity: .6,
            borderRadius: '100%',
            height: size + 'px',
            width: size + 'px',
            padding: 0,
            margin: 0,
            display: 'block',
            overflow: 'hidden',
            pointerEvents: 'none',
            webkitUserSelect: 'none',
            mozUserSelect: 'none',
            userSelect: 'none',
            webkitTransform: transform,
            mozTransform: transform,
            transform: transform,
            zIndex: 100
        }
    }
}


