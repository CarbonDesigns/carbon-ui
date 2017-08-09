import React from 'react';
import DropButton from './DropButton';
import DropButtonItem from './DropButtonItem';
import ActionButton from './ActionButton';
import UserBar from "./UserBar";
import FlyoutButton from "../shared/FlyoutButton";
import {app} from "carbon-core";
import { listenTo, Component, ComponentWithImmutableState, CarbonLabel, dispatch } from '../CarbonFlux';
import AppActions from '../RichAppActions';
import cx from "classnames";
import bem from '../utils/commonUtils';
import {FormattedHTMLMessage, defineMessages} from 'react-intl';
import {Record} from "immutable";
import Dropdown from "../shared/Dropdown";
import PreviewActions from "../preview/PreviewActions";
import PreviewStore from "../preview/PreviewStore";
import {StoriesPopupList, StoriesListItem}  from "../stories/StoriesList";
import StoriesStore from "../stories/StoriesStore";
import AppStatus from "./AppStatus";
import appStore from "../AppStore";

var State = Record({
    canUndo        : false,
    canRedo        : false,
    activeMode     : null,
    activeDevice   : 0
});

interface StoriesSelectorProps {
    name?:string;
}

interface StoriesSelectorState {
    data:any;
}


class StoriesSelector extends Component<StoriesSelectorProps, StoriesSelectorState> {
    constructor(props) {
        super(props);
        this.state = {data: StoriesStore.state};
    }

    public refs:{
        flyout:FlyoutButton;
    }

    @listenTo(StoriesStore)
    onChange() {
        if (this.state.data !== StoriesStore.state) {
            this.setState({data: StoriesStore.state});
        }
    }

    _prevStory(event) {
        var story = app.activeStory();
        var stories = app.stories;
        var index = stories.findIndex(s=>s.props.id == story.props.id);

        if(index > 0) {
            let newStory = stories[index - 1];
            app.activeStory(newStory);
        }

        event.stopPropagation();
    }

    _nextStory(event) {
        var story = app.activeStory();
        var stories = app.stories;
        var index = stories.findIndex(s=>s.props.id == story.props.id);

        if(index >=0 && index < stories.length - 1) {
            let newStory = stories[index + 1];
            app.activeStory(newStory);
        }

        event.stopPropagation();
    }

    _renderSelectedStory = ()=> {
        var story = app.activeStory();
        if (story == null){
            return <CarbonLabel id="@storyselector.empty" /> ;
        }

        var name = story.props.name;

        return <div>{name}</div>
    }

    _changeCurrentStory=(story) => {
        this.refs.flyout.close();
        app.setActiveStoryById(story.id);
    }

    render() {
        var stories = this.state.data.stories;
        var activeStory = app.activeStory();;
        var storyIndex = -1;
        let storiesCount = 0;
        if(stories && stories.count()) {
            storiesCount = stories.count();
            storyIndex = stories.findIndex(s=>s.id === activeStory.props.id);
        }

        return (
            <div className="preview__story-selector" onClick={this._nextStory }>
                <FlyoutButton ref="flyout"
                    className="preview__story-dropdown light"
                    position={{targetVertical:'bottom', disableAutoClose:true}}
                    renderContent={this._renderSelectedStory}>
                    <StoriesPopupList
                        stories={this.state.data.stories}
                        selectStory={this._changeCurrentStory}
                        activeStory={activeStory}
                        padding={true}
                        insideFlyout={true}
                    />
                </FlyoutButton>

                <div className={bem("preview", "story-switcher", {prev: true, disabled: storyIndex<=0 })} onClick={this._prevStory }></div>
                <div className={bem("preview", "story-switcher", {next: true, disabled: storyIndex<0 || storyIndex >= storiesCount - 1})} onClick={this._nextStory }></div>
            </div>
        );
    }

}

interface HeaderProps {
    isLoggedIn?:boolean;
}
type HeaderState = {
    activeMode: string;
    activeDevice?: any;
    appName: string;
    appAvatar: string;
}

export default class Header extends Component<HeaderProps, HeaderState> {
    constructor(props) {
        super(props);
        this.state = {
            activeMode: appStore.state.activeMode,
            appName: appStore.state.appName,
            appAvatar: appStore.state.appAvatar
        }
    }

    @listenTo(appStore)
    onChange() {
        this.setState({
            activeMode: appStore.state.activeMode,
            appName: appStore.state.appName,
            appAvatar: appStore.state.appAvatar
        });
    }

    @listenTo(PreviewStore)
    onChangePreview() {
        this.setState({
            activeDevice: PreviewStore.state.activeDevice
        });
    }

    changeDevice(i){
        dispatch(PreviewActions.changeDevice(i))
    }

    private static onProjectClick() {
        dispatch(AppActions.showMainMenu());
    }

    render() {
        const {isLoggedIn} = this.props;

        var that = this;

        return (
            <div className="layout__header">

                <div className="projectbar">
                        { this.state.appAvatar && <div className="projectbar__pic" onClick={Header.onProjectClick}>
                              <div className="projectbar__project-avatar" style={{ backgroundImage: "url('" + this.state.appAvatar + "')" }} onClick={Header.onProjectClick}></div>
                            </div>
                        }
                    <div className={ bem("projectbar", "name", {big: this.state.appName.length > 10}) } onClick={Header.onProjectClick}>
                        <h2>{this.state.appName}</h2>
                    </div>
                </div>

                {/* Modebar */}
                <div className="modebar">
                    {
                        ['edit', 'prototype', 'preview'].map(function (item) {
                            var classname = cx("modebar__pill modebar__pill_" + item,
                                {
                                    "modebar__pill_active": (item === that.state.activeMode)
                                });

                            return (
                                <div className={classname} key={item}
                                     onClick={()=>app.setMode(item)}>
                                    <div className="big-icon"></div>
                                    <div className="pill-cap">
                                        <FormattedHTMLMessage id={'mode.' + item}/>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>


                {/* Stories in preview*/}
                { (this.state.activeMode === "preview")
                    &&  <StoriesSelector name=""/>
                }


                { /*   Userbar / Signup   */ }
                <div className="statusbar">
                    <AppStatus/>
                    <UserBar/>
                </div>

                { /* Help   */ }
                {/*<DropButton key="helpbar" id="helpbar" caption="Help">
                    <DropButtonItem key="feedback"  id="action-button_feedback"  >Leave a feedback</DropButtonItem>
                    <DropButtonItem key="bugreport" id="action-button_bugreport" >Found a bug?</DropButtonItem>
                    <DropButtonItem key="message"   id="action-button_message"   >Send us a message</DropButtonItem>
                    <DropButtonItem key="keyboard"  id="action-button_keyboard"  >Keyboard shorcuts</DropButtonItem>
                </DropButton>*/}

            </div>
        );
    }

}