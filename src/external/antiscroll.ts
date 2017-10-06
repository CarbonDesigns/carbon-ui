import { util } from "carbon-api";

export type AntiscrollOptions = {
    notOnMac: boolean;
    initialDisplay: boolean;
    autoHide: boolean;
    autoHideTimeout: number;
    x: boolean;
    y: boolean;
    innerSelector: string | HTMLElement;
    debug: boolean;
}

const DefaultOptions: AntiscrollOptions = {
    notOnMac: false,
    autoHideTimeout: 1500,
    autoHide: true,
    initialDisplay: false,
    x: true,
    y: true,
    innerSelector: ".antiscroll-inner",
    debug: false
};

const MarginTop = 2;
const Padding = 2;

let index = 0;
const registry: {[key: string]: Antiscroll} = {};

export default class Antiscroll {
    private index: number;
    private horizontal: HorizontalScrollbar;
    private vertical: VerticalScrollbar;

    public inner: HTMLElement;
    public options: AntiscrollOptions;
    public windowScroll: boolean;
    public cache: {
        scrollPosition: number;
        diff: number;
    };

    constructor(public wrapperElement: HTMLElement, options: Partial<AntiscrollOptions>) {
        this.options = Object.assign({}, DefaultOptions, options);

        if (this.options.notOnMac && (navigator.platform.substr(0, 3) === 'Mac')) {
            return;
        }

        if (wrapperElement.dataset["antiscroll"]) {
            let existing = registry[wrapperElement.dataset["antiscroll"]];
            existing.destroy();
        }

        this.cache = {
            scrollPosition: 0,
            diff: 0
        };

        this.windowScroll = wrapperElement === document.documentElement;

        // Reads "0" as an argument
        this.inner = this.windowScroll
            ? document.documentElement
            : typeof this.options.innerSelector === "string"
            ? this.wrapperElement.querySelectorAll(this.options.innerSelector)[0] as HTMLElement
            : this.options.innerSelector;

        if (options.debug) {
            console.group('Antiscroll');
            console.log('Inner element:', this.inner);
            console.log('Content width:', this.inner.clientWidth);
            console.log('Content height:', this.inner.clientHeight);
        }

        this.refresh();

        let newIndex = index++;
        registry[newIndex] = this;
        this.index = newIndex;
        this.wrapperElement.dataset["antiscroll"] = newIndex + "";
    }

    refresh() {
        if (this.options.debug) {
            console.group('Antiscroll.refresh');
        }

        let rect = this.wrapperElement.getBoundingClientRect();
        var needHScroll = this.inner.scrollWidth > rect.width + (this.options.y ? scrollbarSize() : 0);
        var needVScroll = this.inner.scrollHeight > rect.height + (this.options.x ? scrollbarSize() : 0);

        if (this.options.debug) {
            console.log('Needs horizontal scroll:', needHScroll);
            console.log('Needs vertical scroll:', needVScroll);
        }

        if (this.options.x) {
            if (!this.horizontal && needHScroll) {
                this.horizontal = new HorizontalScrollbar(this);
            } else if (this.horizontal && !needHScroll) {
                this.horizontal.destroy();
                this.horizontal = null;
            } else if (this.horizontal) {
                this.horizontal.update();
            }
        }

        if (this.options.y) {
            if (!this.vertical && needVScroll) {
                this.vertical = new VerticalScrollbar(this);
            } else if (this.vertical && !needVScroll) {
                this.vertical.destroy();
                this.vertical = null;
            } else if (this.vertical) {
                this.vertical.update();
            }
        }

        if (this.options.debug) {
            console.groupEnd();
        }

        return 'Scrollbars have been refreshed.';
    }

    destroy() {
        if (this.options.debug) {
            console.group('Antiscroll.destroy');
        }

        if (this.horizontal) {
            this.horizontal.destroy();
            this.horizontal = null;
        }

        if (this.vertical) {
            this.vertical.destroy();
            this.vertical = null;
        }

        if (this.options.debug) {
            console.groupEnd();
        }

        //if scroll container is re-rendered with other items and is smaller, it should resize
        if (this.inner && !this.windowScroll) {
            delete this.inner.style.height;
            delete this.inner.style.width;
        }

        delete registry[this.index];
        delete this.wrapperElement.dataset["antiscroll"];
    }
}

abstract class Scrollbar {
    hiding: any;
    startClientX: number;
    startClientY: number;
    startScrollTop: number;
    startScrollLeft: number;
    hideDebounced: () => any;
    //innerPaneMouseWheelListener: any;
    innerPaneScrollListener: any;
    mousedownListener: any;
    elementMousemoveListener: any;
    documentMousemoveListener: any;
    mouseleaveListener: any;
    mouseenterListener: any;
    shown: boolean;
    dragging: boolean;
    innerEl: Element;

    constructor(protected pane: Antiscroll, protected el: HTMLElement) {
        this.pane.wrapperElement.appendChild(this.el);
        this.innerEl = this.pane.inner;

        this.dragging = false;
        this.shown = false;

        this.documentMousemoveListener = this.documentMousemove.bind(this);
        this.elementMousemoveListener = this.elementMousemove.bind(this);

        // hovering
        this.mouseenterListener = this.mouseenter.bind(this);
        this.mouseleaveListener = this.mouseleave.bind(this);
        this.pane.wrapperElement.addEventListener("mouseenter", this.mouseenterListener);
        this.pane.wrapperElement.addEventListener("mouseleave", this.mouseleaveListener);

        // dragging
        this.mousedownListener = this.mousedown.bind(this);
        this.el.addEventListener("mousedown", this.mousedownListener);

        // scrolling
        this.innerPaneScrollListener = this.scroll.bind(this);
        if (this.pane.windowScroll) {
            window.addEventListener("scroll", this.innerPaneScrollListener);
            window.addEventListener("mousemove", this.elementMousemoveListener);
        }
        else {
            this.pane.inner.addEventListener("scroll", this.innerPaneScrollListener);
            this.el.addEventListener("mousemove", this.elementMousemoveListener);
        }

        // show
        this.hideDebounced = util.debounce(this.hide.bind(this), this.pane.options.autoHideTimeout);
    }

    destroy() {
        this.el.remove();
        if (this.pane.windowScroll) {
            window.removeEventListener("scroll", this.innerPaneScrollListener);
            window.removeEventListener("mousemove", this.elementMousemoveListener);
        }
        else {
            this.pane.inner.removeEventListener('scroll', this.innerPaneScrollListener);
            this.el.removeEventListener("mousemove", this.elementMousemoveListener);
        }

        //this.pane.inner.removeEventListener('mousewheel', this.innerPaneMouseWheelListener);

        this.pane.wrapperElement.removeEventListener("mouseenter", this.mouseenterListener);
        this.pane.wrapperElement.removeEventListener("mouseleave", this.mouseleaveListener);
        this.el.removeEventListener("mousedown", this.mousedownListener);
    }

    mouseenter() {
        this.show();
        this.hideDebounced();
    }

    mouseleave() {
        if (!this.dragging) {
            if (this.pane.options.autoHide) {
                this.hide();
            }
        }
    }

    scroll() {
        if (!this.shown) {
            this.show();
        }

        if (!this.dragging) {
            this.hideDebounced();
        }

        this.update();
    }

    abstract update();
    abstract elementMousemove(event: MouseEvent);
    abstract documentMousemove(event: MouseEvent);

    mousedown(event: MouseEvent) {
        event.preventDefault();

        this.dragging = true;

        this.startClientY = event.clientY;
        this.startClientX = event.clientX;

        this.startScrollTop = this.innerEl.scrollTop;
        this.startScrollLeft = this.innerEl.scrollLeft;

        // prevent crazy selections on IE
        this.el.ownerDocument.onselectstart = function () {
            return false;
        };

        // make scrollbar draggable
        var onMouseUp = () => {
            this.dragging = false;
            this.el.ownerDocument.onselectstart = null;

            this.el.ownerDocument.removeEventListener("mousemove", this.documentMousemoveListener);
            this.el.ownerDocument.removeEventListener("mouseup", onMouseUp);
            this.hideDebounced();
        };

        this.el.ownerDocument.addEventListener("mousemove", this.documentMousemoveListener);
        this.el.ownerDocument.addEventListener("mouseup", onMouseUp);
    }

    show() {
        if (!this.shown && this.update()) {
            this.el.classList.add('antiscroll-scrollbar-shown');
            if (this.hiding) {
                clearTimeout(this.hiding);
                this.hiding = 0;
            }
            this.shown = true;
        }
    }

    hide() {
        if (this.shown) {
            // check for dragging
            this.el.classList.remove('antiscroll-scrollbar-shown');
            this.shown = false;
            if (this.hiding) {
                clearTimeout(this.hiding);
                this.hiding = 0;
            }
        }
    }
}

class HorizontalScrollbar extends Scrollbar {
    constructor(pane: Antiscroll) {
        let div = document.createElement("div");
        div.classList.add("antiscroll-scrollbar");
        div.classList.add("antiscroll-scrollbar-horizontal");
        pane.wrapperElement.appendChild(div);

        super(pane, div);
    }

    update() {
        var paneWidth = this.pane.wrapperElement.getBoundingClientRect().width;
        var trackWidth = paneWidth - Padding * 2;
        var innerEl = this.pane.inner;

        this.el.style.width = trackWidth * paneWidth / innerEl.scrollWidth + "px";
        this.el.style.left = trackWidth * innerEl.scrollLeft / innerEl.scrollWidth + "px";

        return paneWidth < innerEl.scrollWidth;
    }
    documentMousemove(event: MouseEvent) {
        var paneWidth = this.pane.wrapperElement.getBoundingClientRect().width;
        let scrollDelta = event.clientX - this.startClientX;
        let realDelta = this.innerEl.scrollWidth/paneWidth * scrollDelta;

        this.innerEl.scrollLeft = Math.round(this.startScrollLeft + realDelta);
    }
    elementMousemove(event: MouseEvent) {
        let rect = this.pane.wrapperElement.getBoundingClientRect();
        if (event.clientY > rect.bottom - size) {
            this.show();
        }
        else if (this.shown) {
            this.hideDebounced();
        }
    }
}

class VerticalScrollbar extends Scrollbar {
    constructor(pane: Antiscroll) {
        let div = document.createElement("div");
        div.classList.add("antiscroll-scrollbar");
        div.classList.add("antiscroll-scrollbar-vertical");
        div.style.marginTop = MarginTop + "px";
        pane.wrapperElement.appendChild(div);

        super(pane, div);
    }

    update() {
        if (this.pane.options.debug) {
            console.group('Scrollbar.Vertical.update');
        }

        var paneHeight = this.pane.wrapperElement.getBoundingClientRect().height;
        var trackHeight = paneHeight - Padding * 2;
        var innerEl = this.innerEl;

        var barHeight = trackHeight * paneHeight / innerEl.scrollHeight;
        barHeight = barHeight < 20 ? 20 : barHeight;

        if (this.pane.options.debug) {
            console.groupCollapsed('Measurements');
            console.log('Content height: ', innerEl.scrollHeight);
            console.log('Container height:', paneHeight);
            console.log('Track height:', trackHeight);
            console.log('Scrollbar height:', barHeight);
            console.log('Scrollable track:', trackHeight - barHeight);
            console.groupEnd();
        }

        var topPos = trackHeight * innerEl.scrollTop / innerEl.scrollHeight;
        // If scrollbar would go beyond boundaries
        if ((topPos + barHeight) > trackHeight) {
            if (this.pane.options.debug) {
                console.warn('Scrollbar goes beyond boundaries. Offset will be adjusted.');
            }
            var overlap = (topPos + barHeight) - trackHeight;
            topPos = topPos - overlap;
        }

        if (this.pane.windowScroll) {
            topPos += innerEl.scrollTop;
        }

        topPos = Math.round(topPos);

        if (this.pane.options.debug) {
            console.log('Scrolled track: ' + topPos + ' / ' + trackHeight);
            console.log('Scrolled content: ' + innerEl.scrollTop + ' / ' + innerEl.scrollHeight);
            this.pane.cache.diff = topPos - this.pane.cache.scrollPosition;
            console.groupEnd();
        }

        this.el.style.height = barHeight + "px";
        this.el.style.top = topPos + "px";

        this.pane.cache.scrollPosition = topPos;

        return paneHeight < innerEl.scrollHeight;
    }
    documentMousemove(event: MouseEvent) {
        if (this.pane.options.debug) {
            console.group('Scrollbar.Vertical.mousemove');
        }

        var paneHeight = this.pane.wrapperElement.getBoundingClientRect().height;
        let scrollDelta = event.clientY - this.startClientY;
        let realDelta = this.innerEl.scrollHeight/paneHeight * scrollDelta;

        this.innerEl.scrollTop = Math.round(this.startScrollTop + realDelta);

        if (this.pane.options.debug) {
            console.groupEnd();
        }
    }
    elementMousemove(event: MouseEvent) {
        let rect = this.pane.wrapperElement.getBoundingClientRect();
        if (event.clientX > rect.right - size) {
            this.show();
        }
        else if (this.shown) {
            this.hideDebounced();
        }
    }
}

var size: number = undefined;

function scrollbarSize() {
    if (size === undefined) {
        var div = document.createElement("div");
        div.classList.add("antiscroll-inner");
        div.style.width = "50px";
        div.style.height = "50px";
        div.style.overflowY = "scroll";
        div.style.position = "absolute";
        div.style.top = "-200px";
        div.style.left = "-200px";

        let inner = document.createElement("div");
        inner.style.height = "100px";
        inner.style.width = "100%";
        div.appendChild(inner);

        document.body.appendChild(div);
        var w1 = div.offsetWidth;
        var w2 = inner.offsetWidth;
        div.remove();

        size = w1 - w2;
    }

    return size;
}
