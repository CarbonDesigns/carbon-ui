import * as React from "react";
import * as cx from "classnames";
import * as ReactDom from "react-dom";
import { richApp } from '../RichApp';
import { Component, listenTo, CarbonLabel } from "../CarbonFlux";
import Dropdown from "../shared/Dropdown";
import { ensureElementVisible } from "../utils/domUtil";
import { RequestAnimationSettings, app, ActionType, AnimationType, EasingType } from "carbon-core";
import { FormattedMessage, defineMessages } from 'react-intl';
import styled from "styled-components";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "../components/Icon";

var TransitionTypeValues = [
    { label: "transitionType.slideleft", value: AnimationType.SlideLeft },
    { label: "transitionType.slideright", value: AnimationType.SlideRight },
    { label: "transitionType.slideup", value: AnimationType.SlideUp },
    { label: "transitionType.slidedown", value: AnimationType.SlideDown },
    { label: "transitionType.dissolve", value: AnimationType.Dissolve },
];

var EasingValues = [
    { label: "easing.out", value: EasingType.EaseOutQuad },
    { label: "easing.in", value: EasingType.EaseInQuad },
    { label: "easing.inout", value: EasingType.EaseInOutQuad },
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
            .concat(app.activePage.getAllArtboards().map(x => { return { id: () => x.id, name: () => x.name } }));
        var artboardIndex = 0;
        for (var i = 0; i < this._artboards.length; i++) {
            if (this._artboards[i].id() === this.props.action.targetArtboardId) {
                artboardIndex = i;
                break;
            }
        }
        var DEFAULT_ANIMATION_DURATION = 200;
        var animation = this.props.action.animation;
        var segueIndex = TransitionTypeValues.findIndex(s => s.value === animation.type);
        var easingIndex = EasingValues.findIndex(s => s.value === animation.curve);
        var duration = animation.duration === undefined ? DEFAULT_ANIMATION_DURATION : (animation.duration);

        this.state = {
            artboardIndex: artboardIndex,
            segueIndex: segueIndex < 0 ? 0 : segueIndex,
            easingIndex: easingIndex < 0 ? 0 : easingIndex,
            duration: duration / 1000
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
        this.props.newAction.animation.type = TransitionTypeValues[i].value;
    }

    changeEasing = (i) => {
        this.setState({ easingIndex: i });
        this.props.newAction.animation.curve = EasingValues[i].value;
    }

    changeDuration = (event) => {
        this.setState({ duration: event.target.value });
        this.props.newAction.animation.duration = parseFloat(event.target.value) * 1000;
    }

    renderTarget = (selectedItemIndex) => {
        return this._artboards[selectedItemIndex].name();
    }

    renderTransitionType = (selectedItemIndex) => {
        return <FormattedMessage id={TransitionTypeValues[selectedItemIndex].label} />;
    }

    renderEasing = (selectedItemIndex) => {
        return <FormattedMessage id={EasingValues[selectedItemIndex].label} />;
    }

    render() {
        const duration = <FormattedMessage id="transition.duration" />;

        return <TransitionDialog>
            <DialogLine>
                <div className="_label"><FormattedMessage id="transition.target" /></div>

                <Dropdown
                    autoClose={true}
                    selectedItem={this.state.artboardIndex}
                    onSelect={this.changeArtboard}
                    renderSelected={this.renderTarget}
                >
                    {this._artboards.map(a => <p key={a.id()}><span>{a.name()}</span></p>)}
                </Dropdown>
            </DialogLine>


            {/* Transition effect */}
            <DialogLine>
                <div className="_label"><FormattedMessage id="transition.type" /></div>
                <Dropdown
                    autoClose={true}
                    selectedItem={this.state.segueIndex}
                    onSelect={this.changeTransitionType}
                    renderSelected={this.renderTransitionType}
                >
                    {TransitionTypeValues.map(v =>
                        <p key={v.label}><FormattedMessage id={v.label} /></p>
                    )}
                </Dropdown>
            </DialogLine>

            {/* Duration */}
            <DialogLine>
                <div className="_label">{duration}</div>
                <InputStyled
                    type="number"
                    value={this.state.duration}
                    step="0.1"
                    onChange={this.changeDuration}
                />
            </DialogLine>


            {/*Easing */}
            <DialogLine>
                <div className="_label"><FormattedMessage id="transition.easing" /></div>
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
            </DialogLine>
        </TransitionDialog>
    }
}


interface IAnimationSettingsPopupProps {
    onOpened?: () => void;
    onClosed?: () => void;
}

interface IAnimationSettingsPopupState {
    open: boolean;
    action: any;
    target: any;
    x?: number;
    y?: number;
}

export default class AnimationSettingsPopup extends Component<IAnimationSettingsPopupProps, IAnimationSettingsPopupState> {
    onClick = (e) => {
        this.open();
        e.stopPropagation();
    };

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            action: null,
            target: null
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
        let x = 0, y = 0;
        if (event) {
            x = event.pageX;
            y = event.pageY;
        }
        this.setState({ open: !this.state.open, action: action, target: target, x: x, y: y });
    };


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
        if (!this.state.open) {
            return <div></div>;
        }

        var newProps = clone(this.state.action.props);
        return ReactDom.createPortal(<ContextMenuContainer onClose={this.toggle} style={{ position: 'absolute', left: this.state.x, top: this.state.y }}><AnimationSettings target={this.state.target} action={this.state.action.props} newAction={newProps} /></ContextMenuContainer>, document.body);
    }
}

class ContextMenuContainer extends Component<any, any> {
    refs: {
        menu: HTMLElement
    }

    _onMouseDown = (event) => {
        this.props.onClose();
    }

    _preventDefault = (event) => {
        event.stopPropagation();
    }

    componentDidMount() {
        let menu = this.refs.menu;
        if (!menu) {
            return;
        }
        ensureElementVisible(menu, document.documentElement, 0, 40);
    }

    render() {
        return <div onMouseDown={this._onMouseDown} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }}>
            <div ref="menu" onMouseDown={this._preventDefault} {...this.props}>{this.props.children}</div>
        </div>
    }
}


const DialogLine = styled.div`
    & ._label {
        font:${theme.link_font};
        color:${theme.text_color};
        margin:4px 0;
    }
`;

const LineHeight = '28px';

const InputStyled = styled.input`
    background-color:${theme.input_background};
    color:${theme.text_color};
    height:${LineHeight};
    text-align:left;
    line-height:${LineHeight};
    font:${theme.font_largeInput};
    width:100%;
    padding: 0 0 0 ${theme.margin1};
    border-radius:3px;
    &::placeholder {
        color:${theme.text_color.darken()};
    }
`;

const TransitionDialog = styled.div`
    min-width: 20rem;
    height:auto;
    border-radius:4px;
    padding: ${theme.margin1};
    background: ${theme.flyout_background};
    box-shadow: ${theme.flyout_shadow};
    color: ${theme.text_color};
    display:grid;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    grid-row-gap:8px;
    z-index:10000;
`;