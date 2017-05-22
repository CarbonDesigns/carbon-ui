import React from "react";
import cx from 'classnames';
import FlyoutActions from '../FlyoutActions';
import flyoutStore from '../FlyoutStore';
import {Component, listenTo, dispatch} from "../CarbonFlux";

var idCounter = 0;

// export class FlyoutPopup2 {
//     constructor(props) {
//         this.state = {};
//     }
//
//     open = () => {
//         if (!this.state.open) {
//             this.toggle();
//         }
//     };
//
//     close = () => {
//         if (this.state.open) {
//             this.toggle();
//         }
//     };
//     toggle = (event) => {
//         this.setState({open: !this.state.open});
//
//         if (!this.state.open) {
//             dispatch(FlyoutActions.show(this.refs.host, this.drawContent(), this.position));
//         } else {
//             dispatch(FlyoutActions.hide());
//         }
//
//         if (event) {
//             event.stopPropagation();
//         }
//     };
// };


export default class FlyoutPopup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
        this.position = this.props.position || {
                targetVertical: 'top',
                targetHorizontal: 'left'
                // , disableAutoClose:true
            };
    }

    drawContent(content_props) {
        if (this.props.drawContent) {
            return this.props.drawContent(content_props);
        }

        return this.props.children;
    }

    open = () => {
        if (!this.state.open) {
            this.toggle();
        }
    };

    close = () => {
        if (this.state.open) {
            this.toggle();
            if (typeof this.props.onClose === 'function') {
                this.props.onClose();
            }
        }
    };

    toggle = (event) => {
        this.setState({open: !this.state.open});

        if (!this.state.open) {
            //target, children, position, onClose
            dispatch(FlyoutActions.show(this.refs.host, this.drawContent(), this.position));
        } else {
            dispatch(FlyoutActions.hide());
        }

        if (event) {
            event.stopPropagation();
        }
    };

    openForTarget = (target, content_props) => {
        this.setState({open: !this.state.open});
        dispatch(FlyoutActions.show(target, this.drawContent(content_props), this.position));
    };


    @listenTo(flyoutStore)
    storeChanged() {

        var target = flyoutStore.state.target;
        if (target === this.refs.host) {
            this.props.onOpened && this.props.onOpened();
        }
        else if (!target && this.state.open) {
            if (this._mounted) {
                this.setState({open: false});
                this.props.onClosed && this.props.onClosed();
            }
        }
    }

    onKeyDown = (ev) => {
        if (ev.key === "Escape"){
            this.close();
            return prevent(ev);
        }

        ev.stopPropagation();
    };
    // _onMouseDown = (e) => {
    //     e.stopPropagation();
    // };

    componentDidMount() {
        super.componentDidMount();
        this._mounted = true;
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this._mounted = false;
    }

    // When flyout button is re-rendered, probably popup should not be updated, but this is arguable
    // componentDidUpdate(){
    //     if (this.state.open){
    //         dispatch(FlyoutActions.show(this.refs.host, this.drawContent(), this.position));
    //     }
    // }
    renderContent() {
        if (this.props.renderContent) {
            var content = this.props.renderContent();

            if (content) {
                if (Array.isArray(content)) {
                    return content.map(x => {
                        if (x) {
                            return React.cloneElement(x, {key: ++idCounter});
                        }
                        return null;
                    });
                }
                else {
                    return React.cloneElement(content, {key: ++idCounter});
                }
            }
        }

        return <div/>
    }

    // _stopPropagation(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     return false;
    // }

    render() {
        return (
            <div ref="host"
                // id={this.props.id}
                // className={this.props.className}
                // onClick={this.onClick}
                // onClick={this._stopPropagation}
                // onMouseDown={this._stopPropagation}
                // onKeyDown={this.onKeyDown}
                // tabIndex="0"
            ></div>
        );
    }
}


