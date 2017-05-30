import React from 'react';
import DropButton from './DropButton';
import DropButtonItem from './DropButtonItem';
import ActionButton from './ActionButton';
import UserBar from "./UserBar";
import FlyoutButton from "../shared/FlyoutButton";
import {app} from "carbon-core";
import {richApp} from '../RichApp';
import {listenTo, Component, ComponentWithImmutableState, CarbonLabel} from '../CarbonFlux';
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

//import {FormattedHTMLMessage} from 'react-intl';
//import {Link} from 'react-router';
//import {msg} from '../intl/store';

var AVATAR_URL = '/target/res/avas/project-ava.jpg';

// Messages collocation ftw.
// https://github.com/yahoo/react-intl/wiki/API#definemessages
const messages = defineMessages({
    title: {
        defaultMessage: 'Test carbonium project',
        id: '@header.title'
    },
    alignSelected: {
        defaultMessage: 'Align selected objects',
        id: 'Align selected objects'
    },
    distributeSelected: {
        defaultMessage: 'Distribute selected objects',
        id: 'Distribute selected objects'
    }
});

var State = Record({
    canUndo        : false,
    canRedo        : false,
    selectionCount : 0,
    activeMode     : null,
    activeDevice   : 0
});

// class PagesBar extends Component {
//     render() {
//         return (
//             <div className="pages-bar">
//                 <div className="pages-bar__pill">
//                     <div className="pages-bar__board-name">Board name</div>
//                     <div className="pages-bar__artboard-title">
//                         <span className="pages-bar__artboard-icon"> </span>
//                         <span className="pages-bar__artboard-name">Artboard name</span>
//                     </div>
//                 </div>
//                 <div className="pages-bar__dropdown">
//                     dropdown
//                 </div>
//             </div>
//         )
//     }
// }


interface IStoriesSelectorProps
{
    name?:string;
}

interface IStoriesSelectorState
{
    data:any;
}


class StoriesSelector extends Component<IStoriesSelectorProps, IStoriesSelectorState> {
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
        //fixme translate
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

interface IHeaderProps
{
    isLoggedIn?:boolean;
}

export default class Header extends ComponentWithImmutableState<IHeaderProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            data: new State({
                canUndo: false,
                canRedo: false,
                selectionCount: 0,
                activeMode: richApp.appStore.state.activeMode
            })
        }
    }

    @listenTo(richApp.appStore)
    onChange() {
        this.mergeStateData({
            canUndo: richApp.appStore.state.canUndo,
            canRedo: richApp.appStore.state.canRedo,
            selectionCount: richApp.appStore.state.selectionCount,
            activeMode: richApp.appStore.state.activeMode
        });
    }

    @listenTo(PreviewStore)
    onChangePreview() {
        this.mergeStateData({
            activeDevice: PreviewStore.state.activeDevice
        });
    }

    changeDevice(i){
        richApp.dispatch(PreviewActions.changeDevice(i))
    }


    render() {
        const {isLoggedIn} = this.props;

        // Avatar
        var projectName = messages.title.defaultMessage; //fixme finish this - get data from somewhere
        var projectAvatarUrl = AVATAR_URL; //fixme finish this - get data from somewhere
        var that = this;

        return (
            <div className="layout__header">

                <div className="projectbar" onClick={()=>richApp.dispatch(AppActions.showMainMenu())}>
                    <div className="projectbar__pic">
                        { projectAvatarUrl
                              ? <div className="projectbar__project-avatar" style={{ backgroundImage: "url('" + projectAvatarUrl + "')" }}></div>
                              : <div className="projectbar__main-logo"></div>
                        }
                    </div>
                    <div className={ bem("projectbar", "name", {big: (messages.title.defaultMessage + '').length > 10}) }>
                    <h2>{projectName}</h2>
                    </div>
                </div>

                {/* Modebar */}
                <div className="modebar">
                    {
                        ['edit', 'prototype', 'preview'].map(function (item) {
                            var classname = cx("modebar__pill modebar__pill_" + item,
                                {
                                    "modebar__pill_active": (item === that.state.data.activeMode)
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
                { (this.state.data.activeMode === "preview")
                    &&  <StoriesSelector name=""/>
                }


                { /*   Userbar / Signup   */ }
                <UserBar/>

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

/*

 <div id="actions-bar">
 <div className="actions-group">
 <ActionButton id="action-button_undo" action="undo" disabled={!this.state.canUndo}/>
 <ActionButton id="action-button_redo" action="redo" disabled={!this.state.canRedo}/>
 </div>
 <div className="actions-group">
 <DropButton id="action-button_edit">
 <DropButtonItem id="action-button_copy" action="copy"
 disabled={this.state.selectionCount < 1}/>
 <DropButtonItem id="action-button_cut" action="cut"
 disabled={this.state.selectionCount < 1}/>
 <DropButtonItem id="action-button_paste" action="paste"/>
 <DropButtonItem id="action-button_delete" action="delete"
 disabled={this.state.selectionCount < 1}/>
 <DropButtonItem id="action-button_duplicate" action="duplicate"
 disabled={this.state.selectionCount < 1}/>
 </DropButton>

 <DropButton id="action-button_selection">
 { /*<DropButtonItem>Selection Mode</DropButtonItem>*
 <DropButtonItem action="selectAll"/>
 <DropButtonItem action="clearSelection" disabled={this.state.selectionCount < 1}/>
 { /*<DropButtonItem>Invert Selection</DropButtonItem>
 <DropButtonItem>Select Similar</DropButtonItem>*
 </DropButton>
 </div>
 <div className="actions-group">
 <DropButton id="action-button_order" disabled={this.state.selectionCount < 1}>
 <DropButtonItem id="action-button_move-upper" action="bringToFront"/>
 <DropButtonItem id="action-button_move-lower" action="sendToBack"/>
 <DropButtonItem id="action-button_send-to-foreground" action="bringForward"/>
 <DropButtonItem id="action-button_send-to-background" action="sendBackward"/>
 </DropButton>
 <DropButton id="action-button_path" disabled={this.state.selectionCount < 1}>
 <DropButtonItem id="action-button_move-upper" action="pathUnion"/>
 <DropButtonItem id="action-button_move-lower" action="pathIntersect"/>
 <DropButtonItem id="action-button_send-to-foreground" action="pathDifference"/>
 <DropButtonItem id="action-button_send-to-background" action="pathSubtract"/>
 </DropButton>
 <DropButton id="action-button_lock">
 <DropButtonItem id="action-button_lock" action="lock"></DropButtonItem>
 <DropButtonItem id="action-button_unlock" action="unlockAllOnArtboard"></DropButtonItem>
 </DropButton>
 <DropButton id="action-button_groupping" disabled={this.state.selectionCount < 2}>
 <DropButtonItem id="action-button_group" action="groupElements"/>
 <DropButtonItem id="action-button_ungroup" action="ungroupElements"/>
 </DropButton>
 <DropButton id="action-button_aligning" disabled={this.state.selectionCount < 2}>
 <hgroup>
 <h4><FormattedHTMLMessage {...messages.alignSelected}/></h4>
 </hgroup>
 {/*<section className="gui-pushbuttons">
 <label className="gui-inline-label">
 <span>Relatively to</span>
 </label>
 <div className="gui-inline-data">
 <div className="gui-pushbutton _pressed" data-switcher="_pressed">
 <span>
 selection
 </span>
 </div>
 <div className="gui-pushbutton " data-switcher="_pressed">
 <span>
 page
 </span>
 </div>
 <div className="gui-pushbutton " data-switcher="_pressed">
 <span>
 container
 </span>
 </div>
 </div>
 </section>*
 <section>
 <ActionButton id="action-button_align-tops" action="alignTop"/>
 <ActionButton id="action-button_align-middles" action="alignMiddle"/>
 <ActionButton id="action-button_align-bottoms" action="alignBottom"/>
 <ActionButton id="action-button_align-lefts" action="alignLeft"/>
 <ActionButton id="action-button_align-centers" action="alignCenter"/>
 <ActionButton id="action-button_align-rights" action="alignRight"/>
 </section>
 <hr />
 <hgroup>
 <h4><FormattedHTMLMessage {...messages.distributeSelected}/></h4>
 </hgroup>
 <section>
 {/*<ActionButton id="action-button_distribute-tops" />*
 <ActionButton id="action-button_distribute-middles" action="distributeHorizontally"/>
 {/*<ActionButton id="action-button_distribute-bottoms"/>
 <ActionButton id="action-button_distribute-lefts"/>*
 <ActionButton id="action-button_distribute-centers" action="distributeVertically"/>
 {/*<ActionButton id="action-button_distribute-rights"/>*
 </section>
 {/*<hr />
 <hgroup>
 <h4>Equalize spaces</h4>
 </hgroup>
 <section>
 <ActionButton id="action-button_equalize-horiz-spaces"/>
 <ActionButton id="action-button_equalize-vert-spaces"/>
 </section>*
 </DropButton>
 </div>
 </div>
 */