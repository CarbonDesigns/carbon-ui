import React from 'react';
import ReactDom from "react-dom";
import Panel from '../layout/Panel';
import Page from './Page';
import PageGroupDropdown from './PageGroupDropdown';
import PagesActions from './PagesActions';
import {richApp} from "../RichApp";
import {listenTo, Component} from "../CarbonFlux";
import ScrollContainer from "../shared/ScrollContainer";
import PagesSearch from './PagesSearch';
import cx from 'classnames';

export default class PagesPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {data: richApp.pagesStore.getState().toJS(), size: undefined};
    }

    bigButton(name, id, visible, clickAction) {
        if (!visible) {
            return;
        }

        return <div className="big-button" id={id} onClick={clickAction}>
            <div className="big-button__content">
                <i/>
                <p className="big-button__caption">{name}</p>
            </div>
        </div>;
    }

    @listenTo(richApp.pagesStore)
    onPagesStoreChanged() {
        this.setState({data: richApp.pagesStore.getState().toJS()});
    }

    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if(!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        var size = this.refs.panel.height();
        //this.setState({small: size < 150 && size > 100, xsmall:size <= 100, height:size});
        this.refs.panel.updateSizeClasses();
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.state.height !== nextState.height) {
            var realHeight = ReactDom.findDOMNode(this.refs.PagesPanel).clientHeight;
            this.realHeight = realHeight;
        }
    }

    componentDidMount() {
        var realHeight = ReactDom.findDOMNode(this.refs.PagesPanel).clientHeight;
        this.realHeight = realHeight;
    }

    addPagePortrait = ()=> {
        richApp.Dispatcher.dispatch(PagesActions.newPage("portrait"));
    }

    addPageLandscape = ()=> {
        richApp.Dispatcher.dispatch(PagesActions.newPage("landscape"));
    }

    render() {
        var pages = [];
        var state = this.state.data;
        if (state.pageGroups && state.pageGroups.length) {
            pages = state.pageGroups[state.currentGroupIndex].pages;
        }

        var classname = cx({small:this.state.small, xsmall:this.state.xsmall});
        return (
            <Panel {...this.props} ref="panel" className={classname} header="Pages" id="pages-panel">
                <div className="panel__header-controls">
                    <PageGroupDropdown pageGroups={state.pageGroups || []}/>
                    <PagesSearch pageGroups={state.pageGroups}/>
                </div>
                <div id="pages-controls">
                    <div className="buttons">
                        {this.bigButton("Portrait", "pages-controls__new-page-portrait", state.portraitSupported, this.addPagePortrait)}
                        {this.bigButton("Landscape", "pages-controls__new-page-landscape", state.landscapeSupported, this.addPageLandscape)}
                        {this.bigButton("Custom", "pages-controls__new-page-custom", state.templateSupported)}
                    </div>
                    <div id="pages-controls__caption">
                        <span>New page</span>
                    </div>
                </div>
                <div id="pages-container">
                    <ScrollContainer className="thin dark horizontal pages-container">
                        <div id="pages" ref="PagesPanel">
                            {pages.map((p, i)=><Page tabIndex={i} page={p} height={this.realHeight}
                                                     key={p.id}
                                                     showMenuForPageId={state.showMenuForPageId}
                                                     activePageId={state.activePageId}
                                                     xsmall={this.state.xsmall}
                                                     small={this.state.small}
                            />)}
                        </div>
                    </ScrollContainer>
                </div>
            </Panel>
        );
    }

}
