import React                  from 'react';
import ReactDom               from 'react-dom';
import {FormattedHTMLMessage} from "react-intl";
import cx                     from 'classnames';
import Dots                   from "../../shared/dots";
import FlyoutButton           from "../../shared/FlyoutButton";
import FlyoutActions          from "../../FlyoutActions";
import ScrollContainer        from "../../shared/ScrollContainer";
import EnterInput             from "../../shared/EnterInput";
import {
    Component,
    handles,
    Dispatcher
}                             from "../../CarbonFlux";
import CarbonActions          from "../../CarbonActions";
import {richApp}              from "../../RichApp";
import { PropertyTracker, Page, app, IPage } from "carbon-core";
import bem from '../../utils/commonUtils';
import {GuiButton} from "../../shared/ui/GuiComponents";

import EditableList from "../../shared/EditableList";

type PageList = new (props) => EditableList<IPage>;
const PageList = EditableList as PageList;

// export class EditableListItem extends React.Component {
//
//     constructor(props) {
//         super(props);
//         this.state = {
//             controls_open : false,
//             editing: false
//         };
//     }
//
//     _onOpen = (e) => {
//         this.setState({
//             controls_open : true//!this.state.controls_open
//         });
//         e.stopPropagation();
//     };
//
//     _onRename = (e) => {
//         if (!this.state.editing){
//             this.setState({
//                 editing: true
//             });
//         }
//         else{
//             this.setState({
//                 editing: false,
//                 controls_open: false
//             });
//             this.props.onRename(this.refs["input"].getValue(), this);
//         }
//         e && e.stopPropagation();
//     };
//
//     _onDelete = (e) => {
//         this.props.onDelete(this);
//         e.stopPropagation()
//     };
//
//     _onCancel = (e) => {
//         this.setState({
//             controls_open : false,
//             editing: false
//         });
//         e.stopPropagation();
//     };
//
//     componentDidUpdate(){
//         if (this.state.editing){
//             this.refs["input"].focus();
//         }
//     }
//
//     render() {
//         // var cn = cx("editable-list__item", );
//         var cn = bem("editable-list", "item", {
//             "controls-open" : this.state.controls_open,
//             editing  : this.state.editing,
//             selected : this.props.selected
//         });
//         var {item_caption, onDelete, onRename, ...other} = this.props;
//
//         return (
//             <div className={cn} {...other}>
//
//                 { /* Body */ }
//                 <div className={bem("editable-list", "item-body")}>
//                     {
//                         this.state.editing
//                             ?  <div className="inputWrap">
//                                     <EnterInput
//                                         ref="input"
//                                         value={item_caption}
//                                         changeOnBlur={false}
//                                         onChange={() => this._onRename()}
//                                     />
//                                 </div>
//                             : <p className="editable-list__item-name">{item_caption}</p>
//                     }
//                 </div>
//
//                 { /* Opener */ }
//                 <div className={bem("editable-list", "item-button", "opener")} onClick={this._onOpen}>
//                     <div className="editable-list__item-button-icon"><Dots/></div>
//                 </div>
//
//                 { /* Page controls */ }
//                 <div className="editable-list__item-controls">
//                     <div className={bem("editable-list", "item-button", "closer")} onClick={this._onCancel}>
//                         <div className="editable-list__item-button-icon"><i className="ico-cancel"/></div>
//                     </div>
//
//                     {
//                         !this.state.editing ?
//                             <div className={bem("editable-list", "item-button", "delete")} onClick={this._onDelete}>
//                                 <div className="editable-list__item-button-icon">
//                                     <i className="ico-trash"/>
//                                 </div>
//                             </div>
//                             :
//                             null
//                     }
//
//                     <div className={bem("editable-list", "item-button")} onClick={this._onRename}>
//                         <div className="editable-list__item-button-icon">
//                             <i className={this.state.editing ? "ico-ok" : "ico-edit"} />
//                         </div>
//                     </div>
//                 </div>
//
//             </div>
//         )
//     }
// }
// EditableListItem.defaultProps = {
//     item_caption : '-'
// };

class PagesList extends React.Component<any, any> {

    constructor(props){
        super(props);
        this.state = {version:0};
    }

    _pageClicked = (page: IPage) => {
        var pageId = page.id();
        app.setActivePageById(pageId);
        this.setState({version: this.state.version + 1});
    };

    _pageRenamed = (newName: string, page: IPage) => {
        page.setProps({name:newName});
        this.setState({version: this.state.version + 1});
    };

    _pageDeleted = (page: IPage) => {
        app.removePage(page);
        this.setState({version: this.state.version + 1});
    };

    _newPageClicked = () => {
        app.addNewPage();
        richApp.dispatch(FlyoutActions.hide());
    };

    private pageId(page: IPage) {
        return page.props.id;
    }

    private pageName(page: IPage) {
        return page.props.name;
    }

    render(){
        return <div className="pagesbar__panel flyout__content">
            <div className="pagesbar__panel-controls">
                <div className="pagesbar__new-board">
                    <GuiButton mods={["full", "hover-success"]} onClick={this._newPageClicked} caption="New page" bold icon="new-page"/>
                </div>
            </div>
            <PageList data={app.pages} idGetter={this.pageId} nameGetter={this.pageName}
                onClick={this._pageClicked}
                onRename={this._pageRenamed}
                onDelete={this._pageDeleted}
                selectedItem={app.activePage}
                insideFlyout={true}>
            </PageList>
        </div>
    }
}


export default class PagesBar extends Component<any, any> {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        super.componentDidMount();
        PropertyTracker.propertyChanged.bind(this, this._propsChanged);
        PropertyTracker.elementInserted.bind(this, this._elementInsertedOrDeleted);
        PropertyTracker.elementDeleted.bind(this, this._elementInsertedOrDeleted);

        app.pages.forEach(x => x.enablePropsTracking());
        this.setState({pageName: app.activePage.name()});
    }

    componentWillUnmount(){
        super.componentWillUnmount();
        PropertyTracker.propertyChanged.unbind(this, this._propsChanged);
        PropertyTracker.elementInserted.unbind(this, this._elementInsertedOrDeleted);
        PropertyTracker.elementDeleted.unbind(this, this._elementInsertedOrDeleted);
    }

    _propsChanged(element, props){
        //render on name change of any page in case the popup is open
        if (element instanceof Page && props.name !== undefined){
            this.setState({pageName: app.activePage.name()})
        }
    }
    _elementInsertedOrDeleted(parent, child){
        if (child instanceof Page){
            this.setState({...this.state})
        }
    }

    @handles(CarbonActions.pageChanged)
    _onPageChanged({newPage}){
        this.setState({pageName: newPage.name()});
    }

    _renderCurrentPage = () =>{
        if (!this.state){
            return null;
        }
        return [
            <i className="type-icon inline-ico type-icon_board"/>,
            <span className="cap">{this.state.pageName}</span>
        ];
    };

    render() {
        //pagesbar_open
        return (
            <div className="pagesbar">
                <FlyoutButton
                    className="pagesbar__pill"
                    renderContent={this._renderCurrentPage}
                    position={{targetVertical: "top", disableAutoClose: true}}
                >
                    <PagesList pages={app.pages}/>
                </FlyoutButton>
            </div>
        )
    }
}
