import { Range, Map, List, fromJS, Record } from 'immutable';
import { handles, CarbonStore, Dispatcher, dispatch } from "../CarbonFlux";
import { app, NullPage, Brush, PrimitiveType } from "carbon-core";
import StoriesActions from "./StoriesActions";
import CarbonActions from "../CarbonActions";

var Story = Record({
    id: null,
    name: null,
    type: null,
    pageName: null,
    pageId: null,
    description: null,
    status: 0
});

var State = Record({
    stories: null,
    activeStory: null
});

class StoriesStore extends CarbonStore<any> {
    constructor(props) {
        super(props);

        this.state = new State({ stories: this._mapStories(app.stories) });

        app.storyInserted.bindAsync((item) => {
            dispatch(StoriesActions.inserted(item));
        });

        app.storyRemoved.bindAsync((item) => {
            dispatch(StoriesActions.removed(item));
        })

        app.activeStoryChanged.bindAsync((item) => {
            dispatch(StoriesActions.activeStoryChanged(item));
        });

    }

    @handles(CarbonActions.modeChanged)
    onModeChanged({ mode }) {
        if (mode === "prototype") {
            this.state = new State({ stories: this._mapStories(app.stories) });
        }
    }

    @handles(CarbonActions.pageChanged)
    onPageChanged({ newPage }) {
        var story = null;
        if (newPage) {
            story = this.state.stories.find(s => s.pageId === newPage.id);
            if (story) {
                story = app.findNodeByIdBreadthFirst(story.id);
            }
        }
        app.activeStory(story);
    }

    @handles(CarbonActions.pageRemoved)
    onPageRemoved({ page }) {
        var stories = this.state.stories.filter(s => s.pageId === page.id);
        for(var s of stories) {
            var story = app.findNodeByIdBreadthFirst(s.id);
            app.removeStory(story);
        }
    }

    @handles(StoriesActions.inserted)
    onInserted({ item }) {
        var newStories = this.state.stories.push(new Story(item.props));
        this.state = this.state.set("stories", newStories);
    }

    @handles(StoriesActions.activeStoryChanged)
    onActiveStoryChanged({ item }) {
        this.state = this.state.set("activeStory", item);
    }

    @handles(StoriesActions.changed)
    onChanged({ item }) {
        var index = this.state.stories.findIndex(i => i.id === item.id);
        if (index >= 0) {
            var newStories = this.state.stories.splice(index, 1, new Story(app.getImmediateChildById(item.id).props));
            this.state = this.state.set("stories", newStories);
        }
    }

    @handles(StoriesActions.removed)
    onRemoved({ item }) {
        var index = this.state.stories.findIndex(x=>x.id === item.id);
        if (index >= 0) {
            var newStories = this.state.stories.delete(index);
            this.state = this.state.set("stories", newStories);
        }
    }

    _mapStories(stories) {
        if (!stories || !stories.length) {
            return List();
        }

        return List(stories.map(s => new Story(s.props)));
    }
}

export default new StoriesStore(Dispatcher);
