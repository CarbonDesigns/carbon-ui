import React from "react";
import { Component } from "../CarbonFlux"
import LessVars from "../styles/LessVars";
import cx from "classnames";
import bem from '../utils/commonUtils';

interface ITabContainerProps extends IReactElementProps{
    currentTabId?: string;
    onTabChanged?: (e: {tabId: string, oldTabId: string}) => void;
    type?: string;
    defaultTabId?: string;
}
interface ITabContainerState{
    tabId: string;
    oldTabId: string;
}
export default class TabContainer extends Component<ITabContainerProps, ITabContainerState> {
    constructor(props) {
        super(props);
        this.state = {
            tabId: props.defaultTabId || props.currentTabId || "1",
            oldTabId: ""
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentTabId) {
            this.changeTabById(nextProps.currentTabId);
        }
    }

    changeTab = (e) => {
        var newIndex = e.currentTarget.dataset.targetTab;
        if (newIndex === this.state.tabId) {
            return;
        }
        if (this.props.currentTabId) {
            //controlled
            this.props.onTabChanged && this.props.onTabChanged({ tabId: newIndex, oldTabId: this.state.tabId });
        }
        else {
            //uncontrolled
            this.changeTabById(newIndex);
        }
    };

    changeTabById(tabId) {
        if (tabId === this.state.tabId) {
            return;
        }
        var newState = { oldTabId: this.state.tabId, tabId: tabId };
        this.setState(newState);
        setTimeout(() => this.setState({ oldTabId: "" }), LessVars.tabTransition);
    };

    getTabs() {
        var tabs = [];

        for (var ref in this.refs) if (this.refs.hasOwnProperty(ref)) {
            if (ref.indexOf("tab") === 0) {
                tabs.push(this.refs[ref]);
            }
        }

        return tabs;
    }

    render() {
        var { onTabChanged, defaultTabId, currentTabId, type, className, ...rest } = this.props;
        type = type || 'stretched';
        var cn = bem('gui-pages-container', null, type, className);
        return <div className={cn} {...rest}>
            {this.props.children}
        </div>
    }

    getChildContext() {
        return {
            activeTabId: this.state.tabId,
            oldTabId: this.state.oldTabId,
            tabContainer: this
        };
    }

    static childContextTypes = {
        activeTabId  : React.PropTypes.string,
        oldTabId     : React.PropTypes.string,
        tabContainer : React.PropTypes.any
    }
}

interface ITabHeaderProps extends IReactElementProps{
    activeClassName: string;
    tabId: string;
}
//derived from react component on purpose, tabs must re-render when tab container changes
export class TabHeader extends React.Component<ITabHeaderProps, void> {
    render() {
        var { className, activeClassName, tabId, ...other } = this.props;
        var mods = {};
        if (tabId === this.context.activeTabId) {
            mods[activeClassName || 'active'] = true;
        }
        var cn = cx(className, mods);
        return <div
            className={cn}
            data-target-tab={this.props.tabId}
            onClick={this.context.tabContainer.changeTab}
            {...other}
        >
            {this.props.children}
        </div>
    }

    static contextTypes = {
        activeTabId  : React.PropTypes.string,
        oldTabId     : React.PropTypes.string,
        tabContainer : React.PropTypes.any
    }
}

interface ITabPageProps extends IReactElementProps{
    tabId: string;
}
//derived from react component on purpose, tabs must re-render when tab container changes
export class TabPage extends React.Component<ITabPageProps, void> {
    render() {
        var { tabId, ...other } = this.props;
        return <div {...other}>
            {tabId === this.context.activeTabId || tabId === this.context.oldTabId ? this.props.children : null}
        </div>
    }

    static contextTypes = {
        activeTabId  : React.PropTypes.string,
        oldTabId     : React.PropTypes.string,
        tabContainer : React.PropTypes.any
    };
}


interface ITabAreaProps extends IReactElementProps{
}
//derived from react component on purpose, tab area must re-render when tab container changes
export class TabArea extends React.Component<ITabAreaProps, void> {
    render() {
        return <div {...this.props} data-current-tab={this.context.activeTabId}>
            {this.props.children}
        </div>
    }

    static contextTypes = { activeTabId: React.PropTypes.string, oldTabId: React.PropTypes.string, tabContainer: React.PropTypes.any }
}

interface ITabTabsProps extends IReactElementProps{
    items: any[];
    tabsClassName?: string;
    tabClassName?: string;
    tabActiveClassName?: string;
    tabMods?: string;
    insertBefore?: any;
}
export class TabTabs extends React.Component<ITabTabsProps, void> {
    render() {
        var { items, tabsClassName, tabClassName, tabActiveClassName, tabMods, insertBefore, ...rest } = this.props;
        var tabs_cn       = cx("gui-tabs", tabsClassName);
        var tab_cn        = bem("gui-tabs", "tab", tabMods, tabClassName);
        var active_tab_cn = cx("gui-tabs__tab_active", tabActiveClassName);
        var children      = [insertBefore];
        children = children.concat(items.map((item, ind) => {
            return <TabHeader key={"tab" + (ind + 1)} className={tab_cn} tabId={ind + 1 + ""} activeClassName={active_tab_cn}>
                {item}
            </TabHeader>
        }));
        return <div className={tabs_cn} {...rest}>
            {children}
        </div>
    }

    static contextTypes = {
        items              : React.PropTypes.array,
        tabsClassName      : React.PropTypes.string,
        tabClassName       : React.PropTypes.string,
        tabActiveClassName : React.PropTypes.string,
        tabMods            : React.PropTypes.any, //array or object or string
        insertBefore       : React.PropTypes.node
    };
}