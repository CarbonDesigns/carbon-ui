import {default as React, ReactInstance, ReactHTMLElement} from "react";
import cx from 'classnames';
import FlyoutActions from '../FlyoutActions';
import flyoutStore from '../FlyoutStore';
import {Component, listenTo, dispatch, } from "../CarbonFlux";

var idCounter = 0;

interface IFlyoutButtonProps extends IReactElementProps{
    renderContent?:()=>ReactHTMLElement<any> | Element | React.ReactElement<any> | undefined | any;
    content?:any;
    position?:{
        targetVertical?: "top" | "bottom",
        targetHorizontal?: "left" | "right",
        syncWidth?: boolean
    };
    showAction?:any;
    onOpened?:any;
    onClosed?:any;
}

export default class FlyoutButton extends Component<IFlyoutButtonProps, any> {
    private position: any;
    private _mounted: boolean;

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
        this.position = this.props.position || {targetVertical: 'top'};
    }

    drawContent() {
        return this.props.children;
    }

    onDblClick = (e)=> {
        if (this.props.showAction === "dblclick") {
            this.open();
            e.stopPropagation();
        }
    }

    onClick = (e)=> {
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
        this.setState({open: !this.state.open});

        if (!this.state.open) {
            dispatch(FlyoutActions.show(this.refs.host, this.drawContent(), this.position));
        } else {
            dispatch(FlyoutActions.hide());
        }

        if (event) {
            event.stopPropagation();
        }
    }

    @listenTo(flyoutStore)
    storeChanged() {
        var target = flyoutStore.state.target;
        if (target === this.refs.host) {
            this.props.onOpened && this.props.onOpened();
        }
        else if (!target && this.state.open) {
            if (this._mounted) {
                this.setState({open: !this.state.open});
                this.props.onClosed && this.props.onClosed();
            }
        }
    }

    onKeyDown = (e) => {
        if (e.keyCode === 27) {
            this.close();
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
    }

    // When flyout button is re-rendered, probably popup should not be updated, but this is arguable
    // componentDidUpdate(){
    //     if (this.state.open){
    //         dispatch(FlyoutActions.show(this.refs.host, this.drawContent(), this.position));
    //     }
    // }
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
                            return React.cloneElement(x as any, {key: ++idCounter});
                        }
                        return null;
                    });
                }
                return React.cloneElement(content as any, {key: ++idCounter});
            }
        }
        return <i/>
    }

    render() {
        return (
            <div ref="host"
                id={this.props.id}
                className={cx(this.props.className, {opened:this.state.open})}
                onClick={this.onClick}
                onDoubleClick={this.onDblClick}
                onMouseDown={this.onMouseDown}
                onKeyDown={this.onKeyDown}
                tabIndex={0}
            >
                {this.renderContent()}
            </div>
        );
    }
}
