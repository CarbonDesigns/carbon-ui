import React from "react";
import { Component, listenTo, dispatch } from "./CarbonFlux";
import { nodeOffset, ensureElementVisible } from "./utils/domUtil";
import FlyoutActions from './FlyoutActions';
import flyoutStore from "./FlyoutStore";

var flyoutNumber = 0;

// TODO: define propert interfaces
class FlyoutHost extends Component<any, any> {
    render() {
        return <div className="flyout"
            ref="flyout"
            style={this.props.style}
            onMouseDown={this.props.onMouseDown}
            onClick={this.props.onClick}
        >
            {this.props.children}
        </div>;
    }


    componentDidMount() {
        super.componentDidMount();
        if (!this.props.offset) {
            return;
        }

        this.ensurePosition();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    ensurePosition() {
        var flyout = this.refs["flyout"] as HTMLElement;
        ensureElementVisible(flyout, document.documentElement);
    }
}

interface IFlyoutContainerProps {

}

interface IFlyoutContainerState {
    target?: any;
    position?: any;
    children?: any;
    targetNode?: any;
}

interface IOffset {
    x?: any;
    y?: any;
    left?: any;
    bottom?: any;
    top?: any;
    right?: any;
}

export default class FlyoutContainer extends Component<IFlyoutContainerProps, IFlyoutContainerState> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    @listenTo(flyoutStore)
    onChange() {
        var state = flyoutStore.state;
        state = Object.assign({}, state, { targetNode: state.target });
        this.setState(state);
    }

    onAppMouseDown = e => {
        if (this.state.target || (this.state.position && this.state.position.absolute)) {
            dispatch(FlyoutActions.hide());
        }
    };

    onFlyoutMouseDown = e => {
        e.stopPropagation();
    };

    onFlyoutClick = e => {
        if (this.state.target && !this.state.position.disableAutoClose) {
            dispatch(FlyoutActions.hide());
        }
    };

    render() {
        if (!this.state.children) {
            return null;
        }

        var _offset: IOffset = {};
        var style = {
            position: 'absolute', zIndex: 100000,
            left: undefined, bottom: undefined, top: undefined, right: undefined,
            width: undefined, height: undefined
        };
        var targetWidth, targetHeight;
        var position = this.state.position || {};

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

            case !(this.state.targetNode):
                var documentHeight = document.documentElement.clientHeight;
                var documentWidth = document.documentElement.clientWidth;


                _offset = nodeOffset(this.state.targetNode);
                targetHeight = this.state.targetNode.offsetHeight;
                targetWidth = this.state.targetNode.offsetWidth;

                if (position.targetVertical === 'top') {
                    style.bottom = documentHeight - _offset.top;
                }
                else {
                    style.top = _offset.top + targetHeight;
                }

                if (position.targetHorizontal === "right") {
                    style.right = documentWidth - _offset.left - targetWidth;
                }
                else {
                    style.left = _offset.left;
                }

                if (position.syncWidth) {
                    style.width = targetWidth;
                }

                break;

            default:
        }

        return <FlyoutHost
            style={style}
            offset={_offset}
            key={flyoutNumber++}
            targetSize={{ width: targetWidth, height: targetHeight }}
            onMouseDown={this.onFlyoutMouseDown}
            onClick={this.onFlyoutClick}
        >
            {this.state.children}
        </FlyoutHost>
    }
}
