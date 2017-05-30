import React from "react";
import Dropdown from '../shared/Dropdown';
import cx from 'classnames';
import {Component, listenTo} from '../CarbonFlux';
import PagesActions from './PagesActions';
import {richApp} from "../RichApp";
import FlyoutButton from '../shared/FlyoutButton';
import ScrollContainer from "../shared/ScrollContainer";

class PageGroupItem extends Component {
    constructor(props) {
        super(props);
        this.state = {edit:!!this.props.edit};
        if(this.props.edit) {
            this._text =  this.props.name;
        }
    }

    removeGroup=(e)=>{
        if(confirm('Are you sure you want to delete group ' + this.props.name + '?')) {
            richApp.pagesStore.doRemoveGroup(this.props.id);
        }
        e.preventDefault();
    }

    onKeyPressed=(event)=>{
        if(event.charCode === 13) {
            this.saveName(event);
        }
    }

    editName=(e)=>{
        this.setState({edit:true});
        this._text =  this.props.name;
        e.stopPropagation();
    }

    saveName=(e)=>{
        this.setState({edit:false});
        richApp.dispatch(PagesActions.changeGroupName(this.props.id, this._text));
        e.stopPropagation();
    }

    selectGroup=()=>{
        if(!this.state.edit) {
            richApp.dispatch(PagesActions.changeCurrentGroup(this.props.id));
        }
    }

    onTextChange=(event)=>{
        this._text =  event.target.value;
    }

    cancelEdit=(e)=>{
        this.setState({edit:false});
        delete this._text;
        e.stopPropagation();
    }

    mouseDown=(e)=>{
        e.stopPropagation();
    }

    componentDidUpdate(){
        if(this.refs.name && this.state.edit) {
            var input = React.findDOMNode(this.refs.name);

            input.select();
            input.focus();
        }
    }

    componentDidMount(){
        if(this.refs.name && this.state.edit) {
            var input = React.findDOMNode(this.refs.name);

            input.select();
            input.focus();
        }
    }

    stopPropagation(e){
        e.stopPropagation();
    }

    renderName(){
        if(this.state.edit) {
            return <input type="text" ref="name" defaultValue={this.props.name} onClick={this.stopPropagation} onMouseDown={this.mouseDown} onKeyDown={this.onKeyPressed} onChange={this.onTextChange}></input>;
        } else {
            return this.props.name;
        }
    }

    renderItemButtons() {
        if(!this.state.edit) {
            return <div className="line-item-controls">
                <q onClick={this.editName}>
                    <i className="ico ico--edit"/>
                </q>
                <q className="line-item-control_trash" onClick={this.removeGroup}>
                    <i className="ico ico--trash"/>
                </q>
            </div>;
        } else {
            return <div className="line-item-controls">
                <q onClick={this.saveName}>
                    <i className="ico ico--ok"/>
                </q>
                <q className="line-item-control_trash" onClick={this.cancelEdit}>
                    <i className="ico ico--cancel"/>
                </q>
            </div>;
        }
    }

  render() {
    return (<div ref="item" key={this.props.id} onClick={this.selectGroup} className="drop__item drop__item_compact drop__item_with-controls">
      <i className="ico ico--folder inline-ico"/>
        <div className="group-name">{this.renderName()}</div>
        {this.renderItemButtons()}
    </div>);
  }
}

class PageGroupContent extends Component {
    constructor(){
        super();
        this.state = richApp.pagesStore.getState().toJS();
    }

    @listenTo(richApp.pagesStore)
    onChange()
    {
        var state =  richApp.pagesStore.getState().toJS();
        this.setState(state);
    }

    newPageGroup=(e)=>{
        this._newGroupId = richApp.pagesStore.doAddNewGroup();
        e.stopPropagation();
    }

    stopPropagation(event){
        event.stopPropagation();
    }

    render() {
        return <div id="pageGroup-flyout" className="flyout__content">
          <hgroup className="drop__heading">
            <h4>Pages folder</h4>
            <div className="button" id="create-new-folder" onMouseDown={this.stopPropagation} onClick={this.newPageGroup}>
              <i/>
            </div>
          </hgroup>
            <ScrollContainer  insideFlyout={true} scrollEnd={!!this._newGroupId} className="thin dark vertical pageGroups-container">
              <div className="drop__list">
                {this.state.pageGroups.map(f=>{
                    var edit = f.id === this._newGroupId;
                    if(edit) {
                        delete this._newGroupId;
                    }
                    return <PageGroupItem name={f.name} id={f.id} edit={edit}/>
                })}
              </div>
            </ScrollContainer>
        </div>;
    }
}

export default class PageGroupDropdown extends Component {
    constructor(){
        super();
        this.state = richApp.pagesStore.getState().toJS();
    }

    @listenTo(richApp.pagesStore)
    onChange()
    {
        var state =  richApp.pagesStore.getState().toJS();
        this.setState(state);
    }
    renderContent(){
        var groupName = "";
        if(this.state.pageGroups && this.state.pageGroups.length > 0 && this.state.currentGroupIndex < this.state.pageGroups.length) {
            groupName = this.state.pageGroups[this.state.currentGroupIndex].name;
        }
        return <div className="drop__pill">
            <i className="ico inline-ico ico--folder"/>
            <span id="active-group-name">{groupName}</span>
            <i className="ico ico-triangle"/>
        </div>;
    }

    render(){
        var dropClasses = cx("drop drop-up drop_with-bordered-items _active", this.props.className);

        return <FlyoutButton id="pages-folder-selector" renderContent={this.renderContent.bind(this)} className={dropClasses} position={{targetVertical:'top'}}>
            <PageGroupContent />
        </FlyoutButton>
    }
}
