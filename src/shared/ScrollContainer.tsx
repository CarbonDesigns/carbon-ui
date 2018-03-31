import * as React from "react";
import * as ReactDom from "react-dom";
import { dispatch, Component } from '../CarbonFlux';
import * as cx from "classnames";
import Antiscroll, { AntiscrollOptions } from "../external/antiscroll";
import CarbonActions from "../CarbonActions";

interface ScrollContainerProps extends ISimpleReactElementProps {
    [name: string]: any;
    x?: boolean;
    y?: boolean;
    boxClassName?: string;
}

export default class ScrollContainer extends Component<ScrollContainerProps, any>{
    scroller: Antiscroll;
    private _endTimer: any;
    refs: {
        scrollContainer: HTMLElement,
        scrollPane: HTMLElement,
        scrollBox: HTMLElement
    }

    static defaultProps: Partial<ScrollContainerProps> = {
        x: false,
        y: true
    }

    static defaultOptions = {};

    static initScroller(element: HTMLElement, options?: Partial<AntiscrollOptions>) {
        return new Antiscroll(element, options || ScrollContainer.defaultOptions);
    }

    onScroll = (e) => {
        if (this._endTimer) {
            clearTimeout(this._endTimer);
        }
        else if (!this.props.insideFlyout) {
            dispatch(CarbonActions.scroll());
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
        this.scroller = ScrollContainer.initScroller(this.refs.scrollContainer, this.scrollOptions());

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
        this.scroller = ScrollContainer.initScroller(this.refs.scrollContainer, this.scrollOptions());
        if (this.props.scrollEnd) {
            this.refs.scrollPane.scrollTop = Number.MAX_VALUE;
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.scroller.destroy();
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
