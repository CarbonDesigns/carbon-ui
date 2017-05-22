import PagesActions from './PagesActions';
import {Range, Map, List, fromJS, Record} from 'immutable';
import {handles, CarbonStore} from "../CarbonFlux";
import CarbonActions from "../CarbonActions";
import LayoutActions from "../layout/LayoutActions";
import {NullPage, imageCache, Environment, DataNode} from "carbon-core";

var State = Record({
    currentGroupIndex: 0,
    templateSupported: false,
    portraitSupported: true,
    landscapeSupported: false,
    activePageId: 0,
    pageGroups: new List(),
    height:0
});


var Group = Record({
    id: null,
    name: null,
    pages: new List()
});

var Page = Record({
    id: null,
    name: null,
    status: 'inProgress',
    groupId: null,
    ratio: 1,
    image:null,
    version:null
});

export default class PagesStore extends CarbonStore {

    getInitialState() {
        return new State();
    }

    constructor(dispatcher) {
        super(dispatcher);
        this.allPages = [];
    }

    findGroupIndexById(id) {
        return this.state.pageGroups.findIndex(g => {
            return g.id === id;
        });
    }

    @handles(PagesActions.deletePage)
    onDeletePage({pageId}){
        var page = this.removePageById(pageId);
        if (page) {
            removeElement(this.allPages, page);
        }
    }

    doDeletePage(pageId){
        var appPage = DataNode.getImmediateChildById(this.app, pageId);
        if(appPage) {
            this.app.removePageByCommand(appPage);
        }
    }

    doDuplicatePage(pageId){
        this.app.duplicatePageById(pageId);
    }

    @handles(PagesActions.changePageStatus)
    changePageStatus({pageId, status}) {
        this.updatePageById(pageId, p=> p.set('status', status));
        this.app.setPageStatus(pageId, status);
    }

    doAddNewGroup(){
        var appGroup = this.app.createPageGroup();
        appGroup.name("New Group");
        this.app.addPageGroupByCommand(appGroup);
        return appGroup.id();
    }

    @handles(PagesActions.addPageGroup)
    onAddPageGroup({group, position}) {
        this.state = this.state.updateIn(['pageGroups'], groups=>groups.splice(position, 0, new Group({id:group.id(), name:group.name()})))
    }

    @handles(PagesActions.changeCurrentGroup)
    onChaneCurrentGroup({groupId}){
        var index = this.findGroupIndexById(groupId);
        if(index < 0) {
            return;
        }
        this.state = this.state.set('currentGroupIndex', index);
    }

    doRemoveGroup(groupId) {
        var appGroup = this.app.getPageGroupById(groupId);
        this.app.removePageGroupByCommand(appGroup);
    }

    @handles(PagesActions.removePageGroup)
    onRemovePageGroup({groupId}) {
        var index = this.findGroupIndexById(groupId);
        if(index < 0) {
            return;
        }

        this.state = this.state.updateIn(['pageGroups'], groups=>groups.splice(index, 1));

        if (index === this.state.currentGroupIndex){
            //ok if undefined
            this._setCurrentGroup(this.state.pageGroups.get(0));
        }
    }

    @handles(PagesActions.changeGroupName)
    onChangeGroupName({groupId, newName}) {
        var groupIndex = this.findGroupIndexById(groupId);
        if(groupIndex < 0) {
            return;
        }
        this.state = this.state.updateIn(['pageGroups', groupIndex], group=>group.set('name', newName));
    }

    findGroupByPageId(pageId) {
        return this.state.pageGroups.find(group=> {
            var page = group.pages.find(page=> {
                return page.id === pageId;
            })

            return !!page;
        });
    }

    findPageById(pageId) {
        return this.allPages.find(p => p.id === pageId);
    }

    cleanPages() {
        this.state = this.state.set('pageGroups', new List([]));
    }

    // refreshPagesState() {
    //     this.cleanPages();

    //     var groups = [];
    //     var app = this.app;
    //     var that = this;

    //     var mustHideNotShared = false;
    //     var sharedStatuses;
    //     if (mustHideNotShared) {
    //         sharedStatuses = app.viewModel.getSharedPageStatuses();
    //     }

    //     //TODO: fix or remove
    //     each(app.pageGroups || [], function (g) {
    //         var pages = [];
    //         each(g.pageIds(), (pageId)=> {
    //             var appPage = DataNode.getImmediateChildById(app, pageId, true);
    //             //it is allowed to store ids of temporary pages in the page group
    //             if (appPage) {
    //                 var shouldShow = true;
    //                 if (mustHideNotShared) {
    //                     shouldShow = sharedStatuses.indexOf(appPage.status()) !== -1;
    //                 }
    //                 if (shouldShow) {
    //                     var newPage = new Page({
    //                         id: appPage.props.id,
    //                         name: appPage.props.name,
    //                         groupId:appPage.props.groupId,
    //                         status: appPage.props.status,
    //                         ratio: appPage.getAspectRation()
    //                     });
    //                     pages.splice(g.indexOfPageId(pageId), 0, newPage);
    //                     that.allPages.push(newPage);
    //                 }
    //             }
    //         });
    //         var group = new Group({
    //             id: g.id(),
    //             name: g.name(),
    //             pages: new List(pages)
    //         });

    //         var shouldShowGroup = true;
    //         if (mustHideNotShared && group.pages.count() === 0) {
    //             shouldShowGroup = false;
    //         }
    //         if (shouldShowGroup) {
    //             groups.push(group);
    //         }
    //     });

    //     this.state = this.state.set('pageGroups', new List(groups));
    //     if (false && app.activePage) {
    //         var page = findPageById.call(this, app.activePage.id());
    //         if (page) {
    //             markSelectedPage.call(this, page);
    //             this._setCurrentGroup(page.group);
    //         }
    //     }
    //     else {
    //         this._setCurrentGroup(groups[0]);
    //     }

    //     this.refreshPagePreviewsTimerCallback();
    // }

    refreshPagePreviewsTimerCallback(){
        clearTimeout(this._refreshPreviewsTimer);
        var requests = this._pageRefreshRequest;
        delete this._pageRefreshRequest;

        // for(var id in requests) {
        //    var page = requests[id];
        //    this.requestPagePreview(page);
        // }

        // this._refreshPreviewsTimer = setTimeout(()=>{
        //    this.refreshPagePreviewsTimerCallback();
        // }, 5000);
    }

    _setCurrentGroup(group) {
        this.app.activePageGroupId = group ? group.id : undefined;
        var index = this.findGroupIndexById(this.app.activePageGroupId);
        if(index < 0) {
            index = 0;
        }
        this.state = this.state.set('currentGroupIndex', index);
    }

    requestPagePreview(page){
        setTimeout(()=>{
            imageCache.getOrPutPage(this.app.id(), page.id(), page.version(), ()=>{
                return page.renderContentToDataURL();
            }).then((image)=>{
                this.getDispatcher().dispatch(PagesActions.previewChanged(page.id(), image));
            })
        }, 0);
    }

    appPageVersionChanged(page) {
        this._pageRefreshRequest = this._pageRefreshRequest || {};
        this._pageRefreshRequest[page.id()] = page;
    }

    @handles(PagesActions.previewChanged)
    onPreviewChanged(action){
        var page = DataNode.getImmediateChildById(this.app, action.pageId);
        if(page) {
            this.updatePageById(action.pageId, p=> {
                return p.withMutations(m=>{
                    m.set('image', action.imageData);
                    m.set('ratio', page.getAspectRation());
                });
            });
        }
    }

    @handles(PagesActions.pageAdded)
    appPageAdded(action) {
        var appPage = action.appPage,
            positionInGroup = action.positionInGroup,
            newPage = new Page({
                id: appPage.id(),
                name: appPage.name(),
                groupId: appPage.groupId(),
                status: appPage.status(),
                ratio: appPage.getAspectRation()
            });
        var groupIndex = this.findGroupIndexById(appPage.groupId());
        if(groupIndex < 0) {
            return;
        }

        this.state = this.state.updateIn(['pageGroups', groupIndex, 'pages'], pages=>pages.splice(positionInGroup, 0, newPage));
        this.allPages.push(newPage);
    }


    doSelectPage(pageId) {
        this.app.setActivePageById(pageId);
    }
    //
    //@handles(LayoutActions.resizingPanel)
    //onLayoutResized({panel, size}){
    //    if(panel.panelName === "pages") {
    //        this.state = this.state.set('height', size);
    //    }
    //}

    updatePageById(pageId, callback) {
        for(var i = 0 ; i < this.state.pageGroups.count(); ++i) {
            var group = this.state.pageGroups.get(i);
            for(var j = 0; j < group.pages.count(); ++j) {
                var page = group.pages.get(j);
                if(page.id === pageId) {
                    this.state = this.state.updateIn(['pageGroups', i, 'pages', j], p=>{return callback(p)});
                    return;
                }
            }
        }
    }

    removePageById(pageId) {
        for(var i = 0 ; i < this.state.pageGroups.count(); ++i) {
            var group = this.state.pageGroups.get(i);
            for(var j = 0; j < group.pages.count(); ++j) {
                var page = group.pages.get(j);
                if(page.id === pageId) {
                    this.state = this.state.updateIn(['pageGroups', i, 'pages'], pages=>pages.splice(j, 1));
                    return page;
                }
            }
        }
    }

    @handles(PagesActions.activePageChanged)
    onAppPageChanged({nextPage}) {
         if (nextPage !== NullPage){
             var page = this.findPageById(nextPage.id());
             var index = this.findGroupIndexById(page.groupId);
             if(index < 0) {
                 index = 0;
             }
             this.state = this.state.mergeToRecord({activePageId:page.id, currentGroupIndex:index});
         } else {
             this.state = this.state.mergeToRecord({activePageId:0, currentGroupIndex:0});
         }
    }


    appPageGroupRemoved() {

    }

    get _currentGroupId() {
        return this.state.pageGroups.get(this.state.currentGroupIndex).id;
    }

    addPage(orientation) {
        var app = this.app;
        // var isPhoneVisible = app.activePage.isPhoneVisible();
        var appPage = app.createNewPage(orientation);
        appPage.groupId(this._currentGroupId);
        // appPage.isPhoneVisible(isPhoneVisible);
        app.addPage(appPage);
        // if (!that.isExpandedView()){
        //  selectPageById.call(that, appPage.id());
        // }
    }

    @handles(PagesActions.newPage)
    onAddPage(action) {
        this.addPage(action.orientation);
    }

    @handles(CarbonActions.loaded)
    onLoaded({app}) {
        this.app = app;

        this.state = this.state.mergeToRecord({
            templateSupported: false,
            portraitSupported: true,
            landscapeSupported: true
        });

        this._subscriptions = [];
        // Commented by Misha
        /*var s;
        s = app.pageAdded.bind((appPage, positionInGroup)=> {
            this.getDispatcher().dispatchAsync(PagesActions.pageAdded(appPage, positionInGroup));
        });
        this._subscriptions.push(s);

        s = app.pageRemoved.bind(this, (appPage)=>{
            this.getDispatcher().dispatch(PagesActions.deletePage(appPage.id()));
        });
        this._subscriptions.push(s);

        s = app.pageChanged.bind(this, (prevPage, nextPage)=>{
            this.getDispatcher().dispatch(PagesActions.activePageChanged(prevPage, nextPage));

        });
        this._subscriptions.push(s);

        s = app.pageGroupAdded.bind(this, (group, position)=>{
            this.getDispatcher().dispatch(PagesActions.addPageGroup(group, position));
        });
        this._subscriptions.push(s);

        s = app.pageGroupRemoved.bind(this, (group)=>{
            this.getDispatcher().dispatch(PagesActions.removePageGroup(group.id()));

        });
        this._subscriptions.push(s);*/

        // s = app.pageVersionChanged.bind(this, this.appPageVersionChanged);
        // this._subscriptions.push(s);

        //this.refreshPagesState();


    }
}
