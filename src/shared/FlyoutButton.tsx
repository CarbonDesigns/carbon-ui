import { default as React, ReactInstance, ReactHTMLElement } from "react";
import ReactDOM from "react-dom";
import cx from 'classnames';
import FlyoutActions from '../FlyoutActions';
import flyoutStore from '../FlyoutStore';
import { nodeOffset, ensureElementVisible } from "../utils/domUtil";
import { Component, listenTo, dispatch, } from "../CarbonFlux";

var idCounter = 0;

export type FlyoutPosition = {
    targetVertical?: "top" | "bottom",
    targetHorizontal?: "left" | "right",
    sourceVertical?: "top" | "bottom",
    sourceHorizontal?: "left" | "right",
    syncWidth?: boolean,
    disableAutoClose?: boolean,
    absolute?:boolean,
    x?:number,
    y?:number
};

interface IFlyoutButtonProps extends IReactElementProps {
    renderContent?: () => ReactHTMLElement<any> | Element | React.ReactElement<any> | undefined | any;
    content?: any;
    position?: FlyoutPosition;
    showAction?: any;
    onOpened?: any;
    onClosed?: any;
}

type FlyoutButtonState = {
    open: boolean;
}

interface IFlyoutContentProps {
    position:FlyoutPosition;
    target:HTMLElement;
}

class FlyoutContent extends Component<IFlyoutContentProps, any> {

    componentDidMount() {
    }
    render() {
        var host = document.body;
        if(!host) {
            return <div></div>;
        }

        var _offset: any = {};
        var style:any = {
            position: 'absolute', zIndex: 100000,
            background:'red',
            left: undefined, bottom: undefined, top: undefined, right: undefined,
            width: undefined, height: undefined
        };

        var targetWidth, targetHeight;
        var position = this.props.position;

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
                    style.bottom = documentHeight - _offset.top;
                }
                else {
                    style.top = _offset.top + targetHeight;
                }

                if (position.targetHorizontal === "right") {
                    style.right = documentWidth - _offset.left - targetWidth;
                    if(position.sourceHorizontal === "right") {
                        // style.right += targetWidth;
                    }
                }
                else {
                    style.left = _offset.left;
                    if(position.sourceHorizontal === "right") {
                        // style.left -= targetWidth;
                    }
                }

                if (position.syncWidth) {
                    style.width = targetWidth;
                }

                break;

            default:
        }

        return ReactDOM.createPortal(<div className="flyouthost" style={style}>{this.props.children}</div>, host);
    }
}

export default class FlyoutButton extends Component<IFlyoutButtonProps, FlyoutButtonState> {
    private position: any;
    private _mounted: boolean;

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
        this.position = this.props.position || { targetVertical: 'top' };
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
        this.setState({ open: !this.state.open });

        // if (!this.state.open) {
        //     dispatch(FlyoutActions.show(this.refs.host, this.drawContent(), this.position));
        // } else {
        //     dispatch(FlyoutActions.hide());
        // }

        if (event) {
            event.stopPropagation();
        }
    }

    @listenTo(flyoutStore)
    storeChanged() {
        var target = flyoutStore.state.target;
        if (!target && this.state.open) {
            if (this._mounted) {
                this.setState({ open: !this.state.open });
            }
        }
    }

    onMouseDown = (e) => {
        e.stopPropagation();
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
                this.props.onOpened && this.props.onOpened();
            }

            dispatch(FlyoutActions.update(this.refs.host, this.drawContent()));
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
        if(this.state.open) {
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
                onMouseDown={this.onMouseDown}
                tabIndex={0}
            >
                {this.renderContent()}
                {this.renderFlyout()}
            </div>
        );
    }
}
