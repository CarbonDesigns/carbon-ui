import React from "react";
import cx from 'classnames';
import FlyoutActions from '../FlyoutActions';
import flyoutStore from '../FlyoutStore';
import { richApp } from '../RichApp';
import { Component, listenTo, CarbonLabel } from "../CarbonFlux";
import Dropdown from "../shared/Dropdown";
import { RequestAnimationSettings, app, ActionType, AnimationType, EasingType } from "carbon-core";
import { FormattedMessage, defineMessages } from 'react-intl';

var TransitionTypeValues = [
    { label: "transitionType.slideleft", value: AnimationType.SlideLeft },
    { label: "transitionType.slideright", value: AnimationType.SlideRight },
    { label: "transitionType.slideup", value: AnimationType.SlideUp },
    { label: "transitionType.slidedown", value: AnimationType.SlideDown },
    { label: "transitionType.dissolve", value: AnimationType.Dissolve },
];

var EasingValues = [
    { label: "easing.out", value: EasingType.EaseOut },
    { label: "easing.in", value: EasingType.EaseIn },
    { label: "easing.inout", value: EasingType.EaseInOut },
    { label: "easing.none", value: EasingType.None },
];

interface IAnimationSettingsProps {
    action?: any;
    newAction?: any;
    target: any;
}

class AnimationSettings extends Component<IAnimationSettingsProps, any> {
    private _artboards: any[];

    constructor(props) {
        super(props);
        this._artboards = [{ name: () => "Previous artboard", id: () => "-1" }]
            .concat(app.activePage.getAllArtboards().map(x => { return { id: () => x.id(), name: () => x.name() } }));
        var artboardIndex = 0;
        for (var i = 0; i < this._artboards.length; i++) {
            if (this._artboards[i].id() === this.props.action.targetArtboardId) {
                artboardIndex = i;
                break;
            }
        }
        var DEFAULT_ANIMATION_DURATION = .2;
        var animation = this.props.action.animation;
        var segueIndex = TransitionTypeValues.findIndex(s => s.value === animation.segue);
        var easingIndex = EasingValues.findIndex(s => s.value === animation.easing);
        var duration = animation.duration == undefined ? DEFAULT_ANIMATION_DURATION : animation.duration;

        this.state = {
            artboardIndex: artboardIndex,
            segueIndex: segueIndex < 0 ? 0 : segueIndex,
            easingIndex: easingIndex < 0 ? 0 : easingIndex,
            duration: duration
        };
    }

    changeArtboard = (i) => {
        this.setState({ artboardIndex: i });
        if (i >= 0) {
            this.props.newAction.targetArtboardId = this._artboards[i].id();
        } else {
            delete this.props.newAction.targetArtboardId;
            this.props.newAction.type = ActionType.GoBack;
        }
    }

    changeTransitionType = (i) => {
        this.setState({ segueIndex: i });
        this.props.newAction.animation.segue = TransitionTypeValues[i].value;
    }

    changeEasing = (i) => {
        this.setState({ easingIndex: i });
        this.props.newAction.animation.easing = EasingValues[i].value;
    }

    changeDuration = (event) => {
        this.setState({ duration: event.target.value });
        this.props.newAction.animation.duration = event.target.value;
    }

    renderTarget = (selectedItemIndex) => {
        const __target = <FormattedMessage id="transition.target" />;

        const current = this._artboards[selectedItemIndex].name();

        return <div className="tile-editor">
            <div className="tile-editor__label">{__target}</div>
            <div className="tile-editor__value">{current}</div>
        </div>
    }


    renderTransitionType = (selectedItemIndex) => {
        const __type = <FormattedMessage id="transition.type" />;

        const value = <FormattedMessage id={TransitionTypeValues[selectedItemIndex].label} />

        return <div className="tile-editor">
            <div className="tile-editor__label">{__type}</div>
            <div className="tile-editor__value">
                {value}
            </div>
        </div>
    }

    renderEasing = (selectedItemIndex) => {
        const __easing = <FormattedMessage id="transition.easing" />

        const value = <FormattedMessage id={EasingValues[selectedItemIndex].label} />

        return <div className="tile-editor">
            <div className="tile-editor__label">{__easing}</div>
            <div className="tile-editor__value">{value}</div>
        </div>
    }

    render() {
        const __duration = <FormattedMessage id="transition.duration" />;

        return <div className="transition-dialog">
            {/* <CarbonLabel id="@animation.header" tagName="h2" /> */}
            {/* <p className="transition-dialog__line  transition-dialog__intro">
                from&nbsp;
                <strong>page 1</strong>
                &nbsp;(button 1 - click)
            </p> */}

            <div className="transition-dialog__line">
                <Dropdown
                    autoClose={true}
                    className="drop_down_no-padding"
                    selectedItem={this.state.artboardIndex}
                    onSelect={this.changeArtboard}
                    renderSelected={this.renderTarget}
                >
                    {this._artboards.map(a => <p key={a.id()}><span>{a.name()}</span></p>)}
                </Dropdown>
            </div>

            <div className="transition-dialog__line">
                {/* Transition effect */}
                <Dropdown
                    autoClose={true}
                    className="drop_down_no-padding"
                    selectedItem={this.state.segueIndex}
                    onSelect={this.changeTransitionType}
                    renderSelected={this.renderTransitionType}
                >
                    {TransitionTypeValues.map(v =>
                        <p key={v.label}><FormattedMessage id={v.label} /></p>
                    )}
                </Dropdown>
            </div>

            {/* Duration */}
            <div className=" transition-dialog__line">
                <div className="tile-editor">
                    <div className="tile-editor__label">
                        {__duration}
                    </div>
                    <div className="tile-editor__value transition-dialog__duration-input">
                        <input
                            type="number"
                            value={this.state.duration}
                            step="0.1"
                            onChange={this.changeDuration}
                        />
                        {/* <span>s</span> */}
                    </div>
                </div>


                {/*Easing */}
                <div className=" transition-dialog__line">
                    <Dropdown
                        autoClose={true}
                        className="drop_down_no-padding"
                        selectedItem={this.state.easingIndex}
                        onSelect={this.changeEasing}
                        renderSelected={this.renderEasing}
                    >
                        {EasingValues.map(v => {
                            return <p key={v.label}><FormattedMessage id={v.label} /></p>
                        })}
                    </Dropdown>
                </div>
            </div>
        </div>
    }
}

interface IAnimationSettingsPopupProps {
    onOpened?: () => void;
    onClosed?: () => void;
}

interface IAnimationSettingsPopupState {
    open: boolean;
}

export default class AnimationSettingsPopup extends Component<IAnimationSettingsPopupProps, IAnimationSettingsPopupState> {
    onClick = (e) => {
        this.open();
        e.stopPropagation();
    };

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    private _onRequestSubscription: any;
    private _newActionProps: any;

    attach() {
        this._onRequestSubscription = RequestAnimationSettings.onRequest.bind(this.open);
    }

    detach() {
        if (this._onRequestSubscription) {
            this._onRequestSubscription.dispose();
            this._onRequestSubscription = null;
        }
    }

    open = (event?, target?, action?) => {
        if (!this.state.open) {
            this.toggle(event, target, action);
        }
    };

    close = () => {
        if (this.state.open) {
            this.toggle();
        }
    };

    toggle = (event?, target?, action?) => {
        this.setState({ open: !this.state.open });
        if (this.state.open) {
            var newProps = this._newActionProps = clone(action.props);
            richApp.dispatch(FlyoutActions.show(null, this.renderPopup(target, action.props, newProps), {
                absolute: true,
                x: event.pageX,
                y: event.pageY
            }, () => {
                action.setProps(this._newActionProps);
            }));
        } else {
            richApp.dispatch(FlyoutActions.hide());
        }

        if (event) {
            event.stopPropagation();
        }
    };

    @listenTo(flyoutStore)
    storeChanged() {
        var target = flyoutStore.state.target;
        if (target === this.refs.host) {
            this.props.onOpened && this.props.onOpened();
        }
        else if (!target && this.state.open) {
            this.setState({ open: !this.state.open });
            this.props.onClosed && this.props.onClosed();
        }
    }

    onKeyDown = (e) => {
        //TODO: handle ESC
    };
    onMouseDown = (e) => {
        e.stopPropagation();
    };

    onRightClick = (e) => {
        this.toggle(e);

        e.preventDefault();
    }


    renderPopup(target, action, newAction) {
        return <AnimationSettings target={target} action={action} newAction={newAction} />
    }

    onDocumentMouseDown = (e) => {
        this.close();
    }

    render() {
        return (
            <div>

            </div>
        );
    }

}
