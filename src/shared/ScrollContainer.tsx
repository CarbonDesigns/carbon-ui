import React from "react";
import ReactDom from "react-dom";
import FlyoutActions from '../FlyoutActions';
import { dispatch } from '../CarbonFlux';
import cx from 'classnames';

require("../external/antiscroll");

interface ScrollContainerProps extends ISimpleReactElementProps {
    [name: string]: any;
    x?: boolean;
    y?: boolean;
}

export default class ScrollContainer extends React.Component<ScrollContainerProps, any>{
    private _endTimer: number;
    refs: {
        scrollContainer: HTMLElement,
        scrollPane: HTMLElement,
        scrollBox: HTMLElement
    }

    static initScroller(element: HTMLElement, options?) {
        //var inner = this.getScrollPaneNode();

        //this is needed to support convenient max-height option on parent element,
        //scrollbar will appear when content will be larger than max-height/max-width
        //inner.style.height = wrap.offsetHeight + "px";
        //inner.style.width = wrap.offsetWidth + "px";

        $(element).antiscroll(Object.assign({
            onlyOnWindows: false,
            initialDisplay: false
        }, options));
    }

    static destroyScroller(element: HTMLElement) {
        var antiscroll = $(element).data('antiscroll');
        if (antiscroll) {
            antiscroll.destroy();
        }
    }

    onScroll = (e) => {
        if (this._endTimer) {
            clearTimeout(this._endTimer);
        }
        else if (!this.props.insideFlyout) {
            dispatch(FlyoutActions.hide());
        }
        this._endTimer = setTimeout(this.onScrollEnded, 500);

        var cb = this.props.onScroll;
        if (cb) {
            cb(e);
        }
    };
    onScrollEnded = () => {
        delete this._endTimer;
    };

    getScrollPaneNode() {
        return this.refs.scrollPane;
    }

    getScrollBoxNode() {
        return this.refs.scrollBox;
    }

    componentDidMount() {
        ScrollContainer.initScroller(this.refs.scrollContainer, this.scrollOptions());

        if (this.props.scrollEnd) {
            this.refs.scrollPane.scrollTop = Number.MAX_VALUE;
        }

        if (this.props.insideFlyout) {
            var parentNode = this.refs.scrollPane.parentNode as HTMLElement;
            this.refs.scrollPane.style.height = parentNode.offsetHeight + 'px';
        }
    }

    componentDidUpdate() {
        //bug in antiscroll, it does not clear the width/height from the previous content
        ScrollContainer.initScroller(this.refs.scrollContainer, this.scrollOptions());
        if (this.props.scrollEnd) {
            this.refs.scrollPane.scrollTop = Number.MAX_VALUE;
        }
    }

    componentWillUnmount() {
        ScrollContainer.destroyScroller(this.refs.scrollContainer);
    }

    private scrollOptions() {
        return { x: this.props.x, y: this.props.y };
    }

    render() {
        var classes = cx(this.props.className, "antiscroll-wrap");
        var box_classes = cx("antiscroll-box", this.props.boxClassName);

        return <div className={classes} ref="scrollContainer">
            <div className="antiscroll-inner" ref="scrollPane" onScroll={this.onScroll}>
                <div className={box_classes} ref="scrollBox">
                    {this.props.children}
                </div>
            </div>
        </div>
    }
}
