import {Component, listenTo, dispatch, stopPropagationHandler} from '../CarbonFlux';
import PropTypes from "prop-types";
import React from 'react';
import cx from "classnames";
import ScrollContainer from "../shared/ScrollContainer";
import bem from '../utils/commonUtils';
import Dots from "../shared/dots";
import SimpleList from '../shared/SimpleList';
import {FormattedMessage} from "react-intl";

function bem_stories_panel(elem, mods?, mix?) {
    return bem("stories-panel", elem, mods, mix)
}

export class StoriesListItem extends Component<any, any> {
    render() {
        var story = this.props.story;
        var page = story.pageName || '';
        var name = story.name;
        var type = story.type;
        return <div className={bem_stories_panel("item-name", null, 'txt')} onMouseDown={stopPropagationHandler}>
            <div className={bem_stories_panel("story-name")}><FormattedMessage id={['@flow.header', '@prototype.header'][type]} values={{name:name}}/></div>
            <div className={bem_stories_panel("story-meta")}>
                {/*<small className={bem_stories_panel("story-parts-amount")}>24 steps</small>*/}
                <small className={bem_stories_panel("story-page")}>{page}</small>
            </div>
        </div>
    }
}

export class StoriesPopupList extends Component<any, any> {
    static propTypes = {
        stories      : PropTypes.any,
        padding      : PropTypes.any,
        insideFlyout : PropTypes.any,
        selectStory  : PropTypes.func,
        activeStory  : PropTypes.any
    }

    render() {
        var items = [];
        this.props.stories.map((story)=>{
            items.push({
                id      : story.id,
                content : <StoriesListItem story={story}/>
            }
        )});

        var simpleListProps = {
            className      : bem_stories_panel('list-container'),
            boxClassName   : bem_stories_panel('list'),
            padding        : this.props.padding,
            insideFlyout   : this.props.insideFlyout,
            emptyMessage   : <FormattedMessage id="@stories.empty"/>,
            items          : items,
            onClick        : this.props.selectStory
        };

        return (<SimpleList {...simpleListProps}/>) ;
    }
}

export default class StoriesList extends Component<any, any> {
    static propTypes = {
        stories      : PropTypes.any,
        selectStory  : PropTypes.func,
        activeStory  : PropTypes.any,
        viewDetails  : PropTypes.func
    }

    render() {
        var emptyMessage = null;

        let activeStoryId = null;
        if(this.props.activeStory){
            activeStoryId = this.props.activeStory.id();
        }

        var stories = this.props.stories.map(story =>
            <div className={bem("editable-list", "item", {active:story.id===activeStoryId})} key={'item' + story.id}>
                <div className={bem("editable-list", "item-body")} onClick={()=>this.props.selectStory(story)}>
                    <StoriesListItem story={story} />
                </div>
                <div className={bem("editable-list", "item-button", "opener")} onClick={()=>this.props.viewDetails(story)}>
                    <div className={bem("editable-list", "item-button-icon")}><Dots/></div>
                </div>
            </div>
        );

        return <ScrollContainer
            className={bem("editable-list", "scroll-container", null, "wrap thin")}
            boxClassName={bem_stories_panel('list', null, 'editable-list')}
        >
            {emptyMessage}
            {stories}
        </ScrollContainer>
    }
}

