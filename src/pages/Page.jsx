

import React from "react";
import FlyoutButton from '../shared/FlyoutButton';
import cx from 'classnames';
import {Component} from '../CarbonFlux';
import {richApp} from "../RichApp";
import PagesActions from './PagesActions';
import {Page as AppPage} from "carbon-core";

export default class Page extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  selectPage=(event)=>{
      richApp.pagesStore.doSelectPage(this.props.page.id);
      event.stopPropagation();
  }

  duplicatePage=(event)=>{
      richApp.pagesStore.doDuplicatePage(this.props.page.id);
  }

  deletePage=(event)=>{
      if(confirm('Are you sure you want to delete page ' + this.props.page.name + '?')){
          richApp.pagesStore.doDeletePage(this.props.page.id);
      }
  }

  setStatus(status){
      richApp.dispatch(PagesActions.changePageStatus(this.props.page.id, status));
  }

  statusItem(status, label, currentStatus) {
      var that = this;
      return <div data-page-status={status} onMouseDown={()=>that.setStatus(status)} className={cx("drop__item drop__item_selectable drop__item_compact", {_current:status === currentStatus})}>
            <i className="status-big-icon"></i>
            <span>{label}</span>
        </div>
  }

  render() {
    var classNames = cx("page", {active:this.props.page.id === this.props.activePageId})
              // 200x100 -> 190x 69
    var page = this.props.page;
    var dh = 36;
    if(this.props.small || this.props.xsmall){
      dh = 15;
    }
    var height = this.props.height - dh;// magic const to mathch css paddings
    var status = this.props.page.status;
    return <div
        className={classNames}
        tabIndex={this.props.tabIndex}
        data-page-status={status}
        onClick={this.selectPage}>
      <div className="inner">
        <div className="page__preview" style={{width: height*page.ratio, height:height}}>
          <i style={{backgroundImage: 'url('+page.image+')'}}/>
        </div>

        <FlyoutButton className="page__status" position={{targetVertical:'top'}}>
            <div className="page__status flyout__content _overlaying drop-content_auto-width">
              <hgroup className="drop__heading">
                <h4>Page status</h4>
              </hgroup>
              <div className="drop__list">
                  {this.statusItem('inProgress', AppPage.Statuses.inProgress, status)}
                  {this.statusItem('designComplete', AppPage.Statuses.designComplete, status)}
                  {this.statusItem('approved', AppPage.Statuses.approved, status)}
              </div>
            </div>
        </FlyoutButton>

        <FlyoutButton className="page__button page__button_call-drop" position={{targetVertical:'top'}}>
            <div className="flyout__content _overlaying drop-content_auto-width">
                <div className="drop__list">
                    <div className="drop__item drop__item_compact" onMouseDown={this.duplicatePage}>
                      <span>Duplicate</span>
                    </div>
                    {
                    //<div className="drop__item drop__item_compact" onMouseDown={this.duplicatePage}>
                    //  <span>Move to folder...</span>
                    //</div>
                    }
                    <div className="drop__item drop__item_compact" onMouseDown={this.deletePage}>
                      <span>Delete</span>
                    </div>
                </div>
            </div>
        </FlyoutButton>

        <div className="page__caption">
          <span>{page.name}</span>
        </div>
      </div>
    </div>;
  }
}
