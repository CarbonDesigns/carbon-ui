import {Component, listenTo, dispatch} from '../CarbonFlux';
import React from 'react';
import Panel from '../layout/Panel'
import {FormattedMessage} from "react-intl";
import StoriesStore from "./StoriesStore";
import StoriesActions from "./StoriesActions";
import StoriesList from "./StoriesList";
import {app, PatchType, createUUID, StoryType, util} from "carbon-core";
import ScrollContainer from "../shared/ScrollContainer";
import {default as TabContainer, TabArea, TabPage} from "../shared/TabContainer";
import {GuiButton, GuiRadio, GuiInput, GuiTextArea} from "../shared/ui/GuiComponents";
import {MarkupLine}  from "../shared/ui/Markup";

function _selectStory(item) {
    var story = app.getImmediateChildById(item.id);
    app.activeStory(story);
}

function _createEmptyStory(name){
    return {name: name, description: "", type: StoryType.Flow, pageName: app.activePage.name(), pageId:app.activePage.id() };
}

function _saveNewStory(state) {
    var newStory = {
        // id          : createUUID(),
        name        : state.name,
        description : state.description,
        type        : state.type,
        pageName    : state.pageName,
        pageId      : app.activePage.id()
    };
    app.addStory(newStory);
}


class StoryDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type        : props.item.type,
            pageName : props.item.pageName,
            name        : props.item.name,
            description : props.item.description
        };
        this._saveFunc = util.debounce(this._save.bind(this), 3000);
    }

    _onNameChange=(e)=> {
        this.setState({name: e.target.value});
        this._saved = false;
        this._saveFunc();
    }

    _onDescriptionChange=(e)=> {
        this.setState({description: e.target.value});
        this._saved = false;
        this._saveFunc();
    }

    _onFlowClicked=(e)=> {
        this.setState({type: StoryType.Flow});
    }

    _onPrototypeClicked=(e)=> {
        this.setState({type: StoryType.Prototype});
    }

    _save(){
        if(this._saved === false) {
            var story = app.getImmediateChildById(this.props.item.id);
            story.setProps({name: this.state.name, description:this.state.description});
            dispatch(StoriesActions.changed(this.props.item));
            this._saved = true;
        }
    }

    _saveNew = ()=>{
        _saveNewStory(this.state);
        this._saved = true;
        this.props.goBack()
    }

    render() {
        var renderedSubmit =  null;
        var renderedType = null;
        var heading = null;

        if (this.props.newStory) {
            renderedType = (<MarkupLine>
                <FormattedMessage tagName="span" id="@story.type"/>
                <p>
                    <GuiRadio onChange={this._onFlowClicked} checked={this.state.type===StoryType.Flow}      label="@flow"/>
                    <GuiRadio onChange={this._onPrototypeClicked} checked={this.state.type===StoryType.Prototype} label="@prototype"/>
                </p>
            </MarkupLine>);

            renderedSubmit = <div className="gui-btn-block">
                <GuiButton mods="submit" onClick={this._saveNew} caption="@story.create" icon={true}/>
                <GuiButton mods="hover-cancel" onClick={this.props.goBack} caption="@cancel" icon={true}/>
            </div>

            heading = "Create a new story";
        }
        else {
            renderedSubmit = <div className="gui-btn-block">
                <GuiButton mods="submit" onClick={this.props.goBack} caption="@story.save" icon={true}/>
                <GuiButton mods="delete" onClick={()=>this.props.onDelete(this.props.item)} icon="trash"/>
            </div>;

            var type = this.state.type===StoryType.Flow ? "Flow" : "Prototype";
            renderedType = null;

            heading = "Edit " + (type);
        }

        return <ScrollContainer className="wrap thin" boxClassName="story-details">
            <MarkupLine>
                <div onClick={this.props.goBack}><u>←back</u></div>
            </MarkupLine>

            <MarkupLine>
                <FormattedMessage tagName="h3" id={heading} defaultMessage={heading}/>
            </MarkupLine>

            { renderedType }

            <MarkupLine>
                <GuiInput
                    caption="@story.name"
                    value={this.state.name}
                    onChange={this._onNameChange}
                />
            </MarkupLine>

            <MarkupLine>
                <GuiTextArea caption="@story.description" style={{width: '100%', height: 141}} value={this.state.description} onChange={this._onDescriptionChange} />
            </MarkupLine>

            <MarkupLine>{renderedSubmit}</MarkupLine>

        </ScrollContainer>
    }
}

export default class StoriesPanel extends Component {
    static contextTypes = {
        intl: React.PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {data: StoriesStore.state};
    }

    @listenTo(StoriesStore)
    onChange() {
        if (this.state.data !== StoriesStore.state) {
            this.setState({data: StoriesStore.state});
        }
    }

    _removeItem=(item)=> {
        app.removeStoryById(item.id);
        this.setState({details: null});
        this.refs.container.changeTabById("1");
    }

    _renameItem(newName, item) {
        var story = app.getImmediateChildById(item.id);
        story.setProps({name: newName});
        dispatch(StoriesActions.changed(item));
    }

    _viewDetails = (item)=> {
        this.setState({details: item});
        this.refs.container.changeTabById("2");
    }

    _viewList = ()=> {
        this.setState({details: null});
        this.refs.container.changeTabById("1");

        if (this.refs.details != null) {
            this.refs.details._save();
        }
    }

    _getNewStoryName() {
        var index = this.state.data.stories.size + 1;
        let name = '';
        let prevName = null;
        while(true) {
            name = this.context.intl.formatMessage({id:"@story.newname"}, {index:index});
            if(prevName == name) {
                break;
            }
            if(!this.state.data.stories.find(s=>s.name === name)) {
                break;
            }
            prevName = name;
            index ++;
        }

        return name;
    }

    _newStoryClicked = ()=>{
        var name = this._getNewStoryName();
        this.setState({details: _createEmptyStory(name)});
        this.refs.container.changeTabById("3");
    }

    render() {
        return (
            <Panel  {...this.props} ref="panel" header="Stories" id="stories-panel">
                <TabContainer ref="container" id="stories-container">
                    <TabArea className="gui-pages">
                        <TabPage tabId="1" className="gui-page">
                            <div className="stories-panel__controls">
                                <GuiButton mods={["full", "hover-success"]} onClick={this._newStoryClicked} caption="@story.new" bold icon="new-page"/>
                            </div>

                            <StoriesList
                                stories={this.state.data.stories}
                                viewDetails={this._viewDetails}
                                selectStory={_selectStory}
                                activeStory={app.activeStory()}
                            />
                        </TabPage>

                        <TabPage tabId="2" className="gui-page">
                            { (!this.state.details) ? null
                                : <StoryDetails ref="details" item={this.state.details} newStory={false} goBack={this._viewList} onDelete={this._removeItem}/>
                            }
                        </TabPage>

                        <TabPage tabId="3" className="gui-page">
                            { (!this.state.details) ? null
                                : <StoryDetails ref="new_story" item={this.state.details} newStory={true} goBack={this._viewList}/>
                            }
                        </TabPage>
                    </TabArea>
                </TabContainer>
            </Panel>

        );
    }
};
