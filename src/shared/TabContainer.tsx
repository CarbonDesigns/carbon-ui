import * as React from "react";
import * as PropTypes from "prop-types";
import { Component } from "../CarbonFlux"
import LessVars from "../styles/LessVars";
import * as cx from "classnames";
import bem from '../utils/commonUtils';

interface ITabContainerProps extends IReactElementProps {
    currentTabId?: string;
    onTabChanged?: (tabId: string, oldTabId?: string) => void;
    type?: string;
    defaultTabId?: string;
}
interface ITabContainerState {
    tabId: string;
    oldTabId: string;
}
export class TabContainer extends Component<ITabContainerProps, ITabContainerState> {
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

        this.props.onTabChanged && this.props.onTabChanged(newIndex, this.state.tabId);

        if (!this.props.currentTabId) {
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

        for (var ref in this.refs) {
            if (this.refs.hasOwnProperty(ref)) {
                if (ref.indexOf("tab") === 0) {
                    tabs.push(this.refs[ref]);
                }
            }
        }

        return tabs;
    }

    render() {
        var { onTabChanged, defaultTabId, currentTabId, type, className, children, ...rest } = this.props;
        var cn = bem('gui-pages-container', null, type, className);
        return <div className={cn} {...rest}>
            {children}
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
        activeTabId: PropTypes.string,
        oldTabId: PropTypes.string,
        tabContainer: PropTypes.any
    }
}

interface ITabHeaderProps extends IReactElementProps {
    activeClassName: string;
    tabId: string;
}
//derived from react component on purpose, tabs must re-render when tab container changes
export class TabHeader extends React.Component<ITabHeaderProps> {
    render() {
        var { className, activeClassName, tabId, children, ...other } = this.props;
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
            {children}
        </div>
    }

    static contextTypes = {
        activeTabId: PropTypes.string,
        oldTabId: PropTypes.string,
        tabContainer: PropTypes.any
    }
}

interface ITabPageProps extends IReactElementProps {
    tabId: string;
}
//derived from react component on purpose, tabs must re-render when tab container changes
export class TabPage extends React.Component<ITabPageProps> {
    render() {
        var { tabId, children, ...other } = this.props;
        return <div {...other}>
            {tabId === this.context.activeTabId || tabId === this.context.oldTabId ? children : null}
        </div>
    }

    static contextTypes = {
        activeTabId: PropTypes.string,
        oldTabId: PropTypes.string,
        tabContainer: PropTypes.any
    };
}


interface ITabAreaProps extends IReactElementProps {
}
//derived from react component on purpose, tab area must re-render when tab container changes
export class TabArea extends React.Component<ITabAreaProps> {
    render() {
        return <div {...this.props} data-current-tab={this.context.activeTabId} />
    }

    static contextTypes = { activeTabId: PropTypes.string, oldTabId: PropTypes.string, tabContainer: PropTypes.any }
}

interface ITabMods<TMods> {
    tabMods?: TMods | TMods[];
}
interface ITabTabsProps extends IReactElementProps, ITabMods<"nogrow" | "level2"> {
    items: any[];
    tabsClassName?: string;
    tabClassName?: string;
    tabActiveClassName?: string;
    insertBefore?: any;
    insertAfter?: any;
}
export class TabTabs extends React.Component<ITabTabsProps> {
    render() {
        var { items, tabsClassName, tabClassName, tabActiveClassName, tabMods, insertBefore, insertAfter, children, ...rest } = this.props;
        var tabs_cn = cx("gui-tabs", tabsClassName);
        var tab_cn = bem("gui-tabs", "tab", tabMods, tabClassName);
        var active_tab_cn = cx("gui-tabs__tab_active", tabActiveClassName);
        var newChildren = items.map((item, ind) => {
            return <TabHeader key={"tab" + (ind + 1)} className={tab_cn} tabId={ind + 1 + ""} activeClassName={active_tab_cn}>
                {item}
            </TabHeader>
        });
        return <div className={tabs_cn} {...rest}>
            {insertBefore}
            {newChildren}
            {insertAfter}
        </div>
    }

    static contextTypes = {
        items: PropTypes.array,
        tabsClassName: PropTypes.string,
        tabClassName: PropTypes.string,
        tabActiveClassName: PropTypes.string,
        tabMods: PropTypes.any, //array or object or string
        insertBefore: PropTypes.node
    };
}
