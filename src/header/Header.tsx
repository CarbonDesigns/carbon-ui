import * as React from "react";
import UserBar from "./UserBar";
import FlyoutButton from "../shared/FlyoutButton";
import { app, PreviewDisplayMode } from "carbon-core";
import { listenTo, Component, ComponentWithImmutableState, CarbonLabel, dispatch } from '../CarbonFlux';
import AppActions from '../RichAppActions';
import * as cx from "classnames";
import { FormattedMessage, defineMessages } from 'react-intl';
import { Record } from "immutable";
import Dropdown from "../shared/Dropdown";
import PreviewActions from "../preview/PreviewActions";
import PreviewStore from "../preview/PreviewStore";
import { StoriesPopupList, StoriesListItem } from "../stories/StoriesList";
import StoriesStore from "../stories/StoriesStore";
import AppStatus from "./AppStatus";
import appStore from "../AppStore";
import styled from "styled-components";
import ModeSelector from './ModeSelector';
import theme from "../theme";
import icons from "../theme-icons";
import IconButton from '../components/IconButton';
import ActionHeader from './ActionHeader';

var State = Record({
    canUndo: false,
    canRedo: false,
    activeMode: null,
    activeDevice: 0
});

interface StoriesSelectorProps {
    name?: string;
}

interface StoriesSelectorState {
    data: any;
}


class StoriesSelector extends Component<StoriesSelectorProps, StoriesSelectorState> {
    constructor(props) {
        super(props);
        this.state = { data: StoriesStore.state };
    }

    public refs: {
        flyout: FlyoutButton;
    }

    @listenTo(StoriesStore)
    onChange() {
        if (this.state.data !== StoriesStore.state) {
            this.setState({ data: StoriesStore.state });
        }
    }

    _prevStory(event) {
        var story = app.activeStory();
        var stories = app.stories;
        var index = stories.findIndex(s => s.props.id === story.props.id);

        if (index > 0) {
            let newStory = stories[index - 1];
            app.activeStory(newStory);
        }

        event.stopPropagation();
    }

    _nextStory(event) {
        var story = app.activeStory();
        var stories = app.stories;
        var index = stories.findIndex(s => s.props.id === story.props.id);

        if (index >= 0 && index < stories.length - 1) {
            let newStory = stories[index + 1];
            app.activeStory(newStory);
        }

        event.stopPropagation();
    }

    _renderSelectedStory = () => {
        var story = app.activeStory();
        if (!story) {
            return <CarbonLabel id="@storyselector.empty" />;
        }

        var name = story.props.name;

        return <div>{name}</div>
    }

    _changeCurrentStory = (story) => {
        this.refs.flyout.close();
        app.setActiveStoryById(story.id);
    }

    render() {
        var stories = this.state.data.stories;
        var activeStory = app.activeStory();;
        var storyIndex = -1;
        let storiesCount = 0;
        if (stories && stories.count()) {
            storiesCount = stories.count();
            storyIndex = stories.findIndex(s => s.id === activeStory.props.id);
        }

        return (
            <div className="preview__story-selector" onClick={this._nextStory}>
                <FlyoutButton ref="flyout"
                    className="preview__story-dropdown light"
                    position={{ targetVertical: 'bottom', disableAutoClose: true }}
                    renderContent={this._renderSelectedStory}>
                    <StoriesPopupList
                        stories={this.state.data.stories}
                        selectStory={this._changeCurrentStory}
                        activeStory={activeStory}
                        padding={true}
                        insideFlyout={true}
                    />
                </FlyoutButton>

                {/* <div className={bem("preview", "story-switcher", { prev: true, disabled: storyIndex <= 0 })} onClick={this._prevStory}></div> */}
                {/* <div className={bem("preview", "story-switcher", { next: true, disabled: storyIndex < 0 || storyIndex >= storiesCount - 1 })} onClick={this._nextStory}></div> */}
            </div>
        );
    }

}

interface HeaderProps {
    isLoggedIn?: boolean;
}
type HeaderState = {
    activeMode: string;
    activeDevice?: any;
    appName: string;
    appAvatar: string;
    displayMode?: PreviewDisplayMode;
}

const ProjectBar = styled.div`
    position:relative;
    display: flex;
    align-items: center;
    align-content:center;
    flex-wrap: wrap;
    flex: 1;
    overflow:hidden;
    padding-left:20px;
`

const HeaderBase = styled.div`
    height: 47px;
    background:${theme.panel_background};
    position:relative;
    margin-bottom: 5px;
    display: grid;
    grid-template-columns: 60px 360px 1fr auto;
    align-items: center;
    flex-wrap: nowrap;
    align-items: stretch;
`

export default class Header extends Component<HeaderProps, HeaderState> {
    constructor(props) {
        super(props);
        this.state = {
            activeMode: appStore.state.activeMode,
            appName: appStore.state.appName,
            appAvatar: appStore.state.appAvatar,
            displayMode: PreviewStore.state.displayMode
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
            activeDevice: PreviewStore.state.activeDevice,
            displayMode: PreviewStore.state.displayMode
        });
    }

    changeDevice(i) {
        dispatch(PreviewActions.changeDevice(i))
    }

    private static onProjectClick() {
        dispatch(AppActions.showMainMenu());
    }

    render() {
        const { isLoggedIn } = this.props;

        var that = this;

        return (
            <HeaderBase>
                {/* <div className="projectbar">
                    {this.state.appAvatar && <div className="projectbar__pic" onClick={Header.onProjectClick}>
                        <div className="projectbar__project-avatar" style={{ backgroundImage: "url('" + this.state.appAvatar + "')" }} onClick={Header.onProjectClick}></div>
                    </div>
                    }
                    <div className={bem("projectbar", "name", { big: this.state.appName.length > 10 })} onClick={Header.onProjectClick}>
                        <h2>{this.state.appName}</h2>
                    </div>
                </div> */}

                <ProjectBar>
                    <IconButton icon={icons.menu_main} color="white" onClick={Header.onProjectClick}/>
                </ProjectBar>

                {/* Modebar */}
                <ModeSelector/>

                <ActionHeader/>

                { /*   Userbar / Signup   */}
                <div className="statusbar">
                    <AppStatus />
                    <UserBar />
                </div>
            </HeaderBase>
        );
    }

}