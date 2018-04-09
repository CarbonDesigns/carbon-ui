import * as React from "react";
import * as ReactDom from "react-dom";
import * as cx from "classnames";
import { nodeOffset, ensureElementVisible } from "../utils/domUtil";
import { Component, listenTo, dispatch, } from "../CarbonFlux";
import { default as CarbonActionsFactory, CarbonAction } from "../CarbonActions";

var idCounter = 0;

export type FlyoutPosition = {
    targetVertical?: "top" | "bottom" | "center",
    targetHorizontal?: "left" | "right" | "center",
    sourceVertical?: "top" | "bottom",
    sourceHorizontal?: "left" | "right",
    syncWidth?: boolean,
    disableAutoClose?: boolean,
    absolute?: boolean,
    x?: number,
    y?: number
};

interface IFlyoutButtonProps extends IReactElementProps {
    renderContent?: () => React.ReactHTMLElement<any> | Element | React.ReactElement<any> | undefined | any;
    content?: any;
    position?: FlyoutPosition;
    disabled?: boolean;
    showAction?: "none"|"click"|"dblclick"|"longpress";
    onOpened?: (ref:FlyoutButton)=>void;
    onClosed?: any;
}

type FlyoutButtonState = {
    open: boolean;
}

interface IFlyoutContentProps {
    position: FlyoutPosition;
    target: HTMLElement;
}

class FlyoutContent extends Component<IFlyoutContentProps, any> {
    refs: {
        host: any;
    }
    inside: boolean;

    onMouseDown = () => {
        if (!this.inside) {
            dispatch(CarbonActionsFactory.cancel());
        }
    }

    componentDidMount() {
        document.body.addEventListener("mousedown", this.onMouseDown, { capture: true });
        this.refs.host.clientWidth;
        setTimeout(()=>{this.ensurePosition();}, 0)
    }

    componentWillUnmount() {
        document.body.removeEventListener("mousedown", this.onMouseDown, { capture: true });
    }

    preventDefault(e) {
        e.stopPropagation();
        return false;
    }

    ensurePosition() {
        var _offset: any = {};
        var style: any = {
            left: undefined, bottom: undefined, top: undefined, right: undefined,
            width: undefined, height: undefined,
            opacity:1
        };

        var targetWidth, targetHeight;
        var position = this.props.position || { targetVertical: "bottom", targetHorizontal: "left" };

        var source = this.refs.host;
        if(!source) {
            return;
        }

        var sourceHeight = source.offsetHeight;
        var sourceWidth = source.offsetWidth;

        switch (false) {
            case !(position.absolute):
                style.left = position.x + 'px';
                style.top = position.y + 'px';
                _offset = {
                    x: position.x,
                    y: position.y,
                    left: undefined, bottom: undefined, top: undefined, right: undefined
                };
                targetHeight = 0;
                targetWidth = 0;
                break;

            case !(this.props.target):
                var documentHeight = document.documentElement.clientHeight;
                var documentWidth = document.documentElement.clientWidth;

                _offset = nodeOffset(this.props.target);
                targetHeight = this.props.target.offsetHeight;
                targetWidth = this.props.target.offsetWidth;

                if (position.targetVertical === 'top') {
                    style.bottom = Math.min(documentHeight - sourceHeight,documentHeight - _offset.top) + 'px';
                }
                else if (position.targetVertical === 'bottom') {
                    style.top = Math.min(documentHeight - sourceHeight, _offset.top + targetHeight) + 'px';
                } else {
                    style.top = Math.max(0, _offset.top - sourceHeight/2 + targetHeight / 2) + 'px';
                }

                if (position.targetHorizontal === "right") {
                    var dx = 0;
                    if(position.sourceHorizontal === "left") {
                        dx = sourceWidth;
                    }
                    style.right = Math.min(documentWidth - sourceWidth, documentWidth - _offset.left - targetWidth - dx) + 'px';
                }
                else if (position.targetHorizontal === "left") {
                    style.left = Math.max(0, _offset.left) + 'px';
                } else {
                    style.left = Math.max(0, _offset.left - sourceWidth / 2 + targetWidth / 2) + 'px';
                }

                if (position.syncWidth) {
                    style.width = targetWidth + 'px';
                }

                break;

            default:
        }
        for(var propName in style) {
            source.style[propName] = style[propName];
        }
    }

    render() {
        var host = document.body;
        if (!host) {
            return <div></div>;
        }

        return ReactDom.createPortal(<div ref="host" style={{opacity:0, position: 'absolute', zIndex: 100000}} className="flyouthost" onMouseEnter={e => this.inside = true} onMouseLeave={e => this.inside = false}>{this.props.children}</div>, host);
    }
}

export default class FlyoutButton extends Component<IFlyoutButtonProps, FlyoutButtonState> {
    private position: any;
    private _mounted: boolean;
    private _openTimer:any;

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
        this.position = this.props.position || { targetVertical: 'top' };
    }

    canHandleActions() {
        return true;
    }

    onAction(action: CarbonAction) {
        switch (action.type) {
            case "Carbon_Cancel":
                this.close();
                return;
            case "Carbon_Scroll": {
                this.close();
                return;
            }
        }
    }

    drawContent() {
        return this.props.children;
    }

    onDblClick = (e) => {
        if (this.props.showAction === "dblclick") {
            this.open();
            e.stopPropagation();
        }
    }

    onClick = (e) => {
        if (!this.props.showAction || this.props.showAction === "click") {
            this.toggle();
            e.stopPropagation();
        }
    }

    onMouseDown = (e) => {
        if (this.props.showAction === "longpress") {
            this._openTimer = setTimeout(()=>{
                this.open();
                this._openTimer = null;
            }, 300);
           // e.stopPropagation();
        }
    }

    onMouseUp = (e) => {
        if(this._openTimer) {
            clearTimeout(this._openTimer);
        }
    }

    open = () => {
        if (!this.state.open) {
            this.toggle();
        }
    }

    close = () => {
        if (this.state.open) {
            this.toggle();
        }
    }

    toggle = (event?) => {
        this.setState({ open: !this.state.open && !this.props.disabled });

        if (event) {
            event.stopPropagation();
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this._mounted = true;
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._mounted = false;
        if (this.state.open) {
            this.setState({ open: false });
        }
    }

    componentDidUpdate(prevProps, prevState: Readonly<FlyoutButtonState>) {
        if (this.state.open) {
            if (!prevState.open) {
                this.props.onOpened && this.props.onOpened(this);
            }
        }
        else if (prevState.open) {
            this.props.onClosed && this.props.onClosed();
        }
    }

    renderContent() {
        if (this.props.content) {
            return this.props.content;
        }
        else if (this.props.renderContent) {
            var content = this.props.renderContent() as any[];

            if (content) {
                if (Array.isArray(content)) {
                    return content.map<React.ReactElement<any>>(x => {
                        if (x) {
                            return React.cloneElement(x as any, { key: ++idCounter });
                        }
                        return null;
                    });
                }
                return React.cloneElement(content as any, { key: ++idCounter });
            }
        }
        return <i />
    }

    renderFlyout() {
        if (this.state.open) {
            return <FlyoutContent position={this.props.position} target={this.refs.host as any}>
                {this.props.children}
            </FlyoutContent>
        }

        return;
    }

    render() {
        return (
            <div ref="host"
                id={this.props.id}
                className={cx(this.props.className, { opened: this.state.open })}
                onClick={this.onClick}
                onDoubleClick={this.onDblClick}
                onMouseDownCapture={this.onMouseDown}
                onMouseUpCapture={this.onMouseUp}
                tabIndex={0}
            >
                {this.renderContent()}
                {this.renderFlyout()}
            </div>
        );
    }
}
