import React from 'react';
import { List, Map, fromJS } from 'immutable';
import Splitter from './Splitter';
import { app } from "../RichApp";
import PanelContainer from './PanelContainer';

import { listenTo, Component, dispatch, handles } from "../CarbonFlux";
import LayoutActions from './LayoutActions';
import cx from 'classnames';
import bem_mod from '../utils/commonUtils';
import { util, LayoutDockPosition, LayoutDirection, Invalidate } from "carbon-core";
import Header from '../header/Header';
import { default as layoutStore } from "./LayoutStore";

import { findTransformProp } from "utils/domUtil"
import interact from "interact.js";

const PillsSize = 35;
const CatcherPointSize = 30;
const CatcherSize = 100;
/**
 * Perf: All panels should have a different z-index to denote a rendering stacking context.
 */
const ZIndexStart = 10;

function resolveWithContentFactory(c) {
    var panelName = c.panelName + layoutStore.getLayoutName();
    if (panelName) {
        var panel = this.panelCache[panelName];
        if (panel) {
            return panel;
        }

        var panelData = this.props.panels[c.panelName];
        if (panelData && panelData.contentFactory) {
            panel = panelData.contentFactory(c);
            this.panelCache[panelName] = panel;
            return panel;
        }

    }
    return null;
}

function dropToCatcherPoint(x, y, left, top) {
    return (x >= left && x <= (left + CatcherPointSize) && y >= top && y <= (top + CatcherPointSize))
}

interface ILayoutContainerProps extends IReactElementProps {
    panels: any;
}

interface ILayoutContainerState {
    renderingTree: any;
    resizing: boolean;
    ready: boolean;
    version: number;
    temporaryVisiblePanel?: string;
}

const PanelMinimalSize = 20;

function transparentForSplit(panel) {
    return panel.collapsed || panel.floating || panel.fixed;
}

export default class LayoutContainer extends Component<ILayoutContainerProps, ILayoutContainerState> {
    private panelCache: any;
    private _dispatchWindowResizedDebounced: any;
    private _splitterIndex: number;
    private _tmpVisibleContainer:any;

    refs: {
        layoutBody: HTMLElement
    }

    constructor(props) {
        super(props);
        var renderingTree = layoutStore.getRenderingTree();
        this.state = {
            renderingTree: renderingTree,
            resizing: false,
            ready: false,
            version: 0
        };
        this.panelCache = {};
        this._dispatchWindowResizedDebounced = util.debounce(this._dispatchWindowResized.bind(this), 200);
    }

    @listenTo(layoutStore)
    onStoreChange() {
        var renderingTree = layoutStore.getRenderingTree();
        var state: any = { resizing: layoutStore.resizing };
        if (renderingTree !== this.state.renderingTree) {
            state.renderingTree = renderingTree;
        }

        this.setState(state);
    }

    _prepareSplitterStyle(container: any) {
        var style: any = {
            left: container.x,
            top: container.y,
            width: container.width,
            height: container.height
        };

        return style;
    }

    refresh() {
        this.setState({ version: this.state.version + 1 });
    }

    _buildPanel(container: any, zIndex: number) {
        var childPanel = resolveWithContentFactory.call(this, container);

        if (container.type === 2) {
            var key;
            if (container.panel1.panelName) {
                key = container.panel1.panelName;
            } else {
                key = this._splitterIndex++;
            }
            var style = this._prepareSplitterStyle(container);
            return <Splitter key={layoutStore.getLayoutName() + 'splitter_' + key} layout={this} direction={container.direction} style={style} panel1={container.panel1} panel2={container.panel2} />
        }

        if (container.panelName === this.state.temporaryVisiblePanel) {
            this._tmpVisibleContainer = container;
        }

        var panelContainer = (<PanelContainer

            key={layoutStore.getLayoutName() + 'p' + container.panelName}
            minimized={layoutStore.state.minimized}
            container={container}
            temporaryVisiblePanel={this.state.temporaryVisiblePanel}
            zIndex={zIndex}>
            {childPanel}
        </PanelContainer>);


        return panelContainer;
    }

    _buildChildrenList(container: any, resultList: any[], indexBag: {index: number}) {
        let childrenDom = [];
        var direction = null;

        var children = container.children;

        if (!(children instanceof Array)) {
            resultList.push(this._buildPanel(container, indexBag.index++));
        } else {
            children.forEach((child: any, ind: number) => {
                this._buildChildrenList(child, resultList, indexBag);
            });
        }
    }

    _onDocumentMouseDown = () => {
        this.showPanel({ panel: null });
    }

    @handles(LayoutActions.togglePanelGroup)
    onTogglePanel() {
        this.showPanel({ panel: null })
    }

    @handles(LayoutActions.showPanel)
    showPanel({ panel }) {
        if (panel && panel.panelName !== this.state.temporaryVisiblePanel) {
            this.setState({ temporaryVisiblePanel: panel.panelName });
        } else {
            this.setState({ temporaryVisiblePanel: null });
        }
    }

    renderPills(list) {
        if (!list.length) {
            return;
        }
        return list.map(p => {
            return (
                <div className={"pills-bar__pill pills-bar__pill_" + p.panelName} key={p.panelName} onMouseDown={(e) => { dispatch(LayoutActions.showPanel(p)); e.stopPropagation(); }}>
                    <i className="pills-bar__pill-icon" />
                </div>
            )
        })
    }

    _resolveOnGroupCloseClick = (group_name) => (e) => {
        app.Dispatcher.dispatch(LayoutActions.togglePanelGroup(group_name, e))
    };

    _onKeyPressed = (event) => {
        if (event.keyCode === 9) { // TAB
            var isInput = event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA";
            if (!isInput) {
                app.Dispatcher.dispatch(LayoutActions.toggleMinimizedView())
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }

    _dispatchWindowResized() {
        dispatch(LayoutActions.windowResized(this.refs.layoutBody.clientWidth, this.refs.layoutBody.clientHeight));
    }

    componentDidMount() {
        super.componentDidMount();
        window.addEventListener("keydown", this._onKeyPressed);
        window.addEventListener("resize", this._dispatchWindowResizedDebounced);

        dispatch(LayoutActions.windowResized(this.refs.layoutBody.clientWidth, this.refs.layoutBody.clientHeight));
        this.setState({ ready: true });
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate(prevProps, prevState)
        Invalidate.request();

        var transformProp = findTransformProp();

        interact(".lbox:not(.floating), .layout__body").unset();
        interact('.lbox .panel__header').unset();

        interact('.lbox .panel__header')
            .draggable({ max: Infinity })
            .on('dragstart', event => {
                event.interaction.x = 0;
                event.interaction.y = 0;
                event.interaction.detached = false;

                var node: HTMLElement = event.interaction.node = event.target.parentElement.parentElement;
                var panelIndex = parseInt(node.getAttribute("data-index"));
                event.interaction.panelIndex = panelIndex;
                event.interaction.detached = node.classList.contains("floating");
                event.preventDefault();
            })
            .on('dragmove', function (event) {
                event.interaction.x += event.dx;
                event.interaction.y += event.dy;

                var d = Math.sqrt(event.interaction.x * event.interaction.x + event.interaction.y * event.interaction.y);

                if (!event.interaction.detached && d > 4) {
                    var node: HTMLElement = event.interaction.node;
                    var rect = node.getBoundingClientRect();

                    dispatch(LayoutActions.detachPanel(event.interaction.panelIndex, rect.left, rect.top, node.clientWidth, node.clientHeight));

                    event.interaction.detached = true;
                }

                if (event.interaction.detached) {
                    var target = event.interaction.node;
                    target.style[transformProp] = 'translate(' + event.interaction.x + 'px, ' + event.interaction.y + 'px)';
                }
            })
            .on("dragend", event => {
                event.preventDefault();
                if (!event.interaction.detached) {
                    return;
                }
                var target = event.interaction.node;
                var offset = $(target).offset();
                var bodyOffset = $(this.refs.layoutBody).offset();
                target.style[transformProp] = '';
                dispatch(LayoutActions.movePanel(event.interaction.panelIndex, offset.left - bodyOffset.left, offset.top - bodyOffset.top));
            });

        var lastTarget = null;
        var that = this;
        // box
        setTimeout(() =>
            interact(".lbox:not(.floating), .layout__body")
                .dropzone({
                    accept: ".lbox .panel__header"
                })
                .on('dragenter', (event) => {
                    if (lastTarget) {
                        lastTarget.classList.remove("droptarget");
                        lastTarget = null;
                    }

                    var target: HTMLElement = event.target;
                    target.classList.add("droptarget");
                    that.refs.layoutBody.classList.add("droptarget");
                    lastTarget = target;
                })
                .on('dragleave', function (event) {
                    var target: HTMLElement = event.target;
                })
                .on('drop', function ({ target, dragEvent, interaction }) {
                    target.classList.remove("droptarget");
                    that.refs.layoutBody.classList.remove("droptarget");
                    var offset = $(target).offset();
                    var dropIndex = parseInt(target.getAttribute("data-index"));
                    if (!that._handlePanelDrop(target, offset.left, offset.top, target.clientWidth, target.clientHeight, dragEvent, CatcherSize, CatcherSize, dropIndex, interaction.panelIndex)) {
                        var layoutBody = that.refs.layoutBody;
                        var offset = $(layoutBody).offset();
                        var w = layoutBody.clientWidth;
                        var h = layoutBody.clientHeight;
                        that._handlePanelDrop(target, offset.left, offset.top, w, h, dragEvent, w, h, that.state.renderingTree.index, interaction.panelIndex);
                    }
                }), 100);
    }

    _handlePanelDrop(target, targetLeft, targetTop, targetWidth, targetHeight, dragEvent, catcherWidth, catcherHeight, dropIndex, panelIndex) {
        var x = dragEvent.pageX - targetLeft;
        var y = dragEvent.pageY - targetTop;
        var l = (targetWidth - catcherWidth) / 2;
        var t = (targetHeight - catcherHeight) / 2;
        var lu = l + (catcherWidth - CatcherPointSize) / 2;
        var tu = t;

        var lr = l + catcherWidth - CatcherPointSize;
        var tr = t + (catcherHeight - CatcherPointSize) / 2;

        var lb = l + (catcherWidth - CatcherPointSize) / 2;
        var tb = t + catcherHeight - CatcherPointSize;

        var ll = l;
        var tl = t + (catcherHeight - CatcherPointSize) / 2;

        var dropPosition = null
        if (dropToCatcherPoint(x, y, lu, tu)) {
            dropPosition = LayoutDockPosition.Top;
        } else if (dropToCatcherPoint(x, y, lr, tr)) {
            dropPosition = LayoutDockPosition.Right;
        } else if (dropToCatcherPoint(x, y, lb, tb)) {
            dropPosition = LayoutDockPosition.Bottom;
        } else if (dropToCatcherPoint(x, y, ll, tl)) {
            dropPosition = LayoutDockPosition.Left;
        }

        if (dropPosition !== null) {
            dispatch(LayoutActions.attachPanel(panelIndex, dropIndex, dropPosition));
            return true;
        }

        return false;
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        window.removeEventListener("keydown", this._onKeyPressed);
        window.removeEventListener("resize", this._dispatchWindowResizedDebounced);
    }

    _renderSplitterForTmpVisiblePanel(container) {
        if (!container) {
            return;
        }

        var direction = container.collapseDirection & LayoutDirection.Row;
        var style: any = {};
        if (direction === LayoutDirection.Column) {
            style.height = Splitter.Size;
            style.width = container.width;
            style.left = container.x;
        } else {
            style.height = container.height;
            style.width = Splitter.Size;
            style.top = container.y;
        }

        if (container.collapseDirection === LayoutDockPosition.Left) {
            style.left = container.x + container.width;
        } else if (container.collapseDirection === LayoutDockPosition.Right) {
            style.left = container.x - Splitter.Size;
        } else if (container.collapseDirection === LayoutDockPosition.Top) {
            style.top = container.y + container.height;
        } else if (container.collapseDirection === LayoutDockPosition.Bottom) {
            style.top = container.y - Splitter.Size;
        }

        return <Splitter key={layoutStore.getLayoutName() + 'splitter_temp'} layout={this} direction={direction} style={style} panel1={container} panel2={null} />;
    }

    render() {
        var collapsedLeft = layoutStore.state.minimized ? [] : layoutStore.getCollapsed(LayoutDockPosition.Left);
        var collapsedRight = layoutStore.state.minimized ? [] : layoutStore.getCollapsed(LayoutDockPosition.Right);
        var collapsedTop = layoutStore.state.minimized ? [] : layoutStore.getCollapsed(LayoutDockPosition.Top);
        var collapsedBottom = layoutStore.state.minimized ? [] : layoutStore.getCollapsed(LayoutDockPosition.Bottom);

        var { className } = this.props;
        var mods = cx(className, {
            layout_resizing: this.state.resizing,
            layout_minimized: layoutStore.state.minimized
        });
        var left_classname = `pills-bar pills-bar_vertical  pills-bar_left${collapsedLeft.length ? '' : ' pills-bar_empty'}`;
        var right_classname = `pills-bar pills-bar_vertical  pills-bar_right${collapsedRight.length ? '' : ' pills-bar_empty'}`;
        var top_classname = `pills-bar pills-bar_horizontal  pills-bar_top${collapsedRight.length ? '' : ' pills-bar_empty'}`;
        var bottom_classname = `pills-bar pills-bar_horizontal  pills-bar_bottom${collapsedRight.length ? '' : ' pills-bar_empty'}`;

        var childrentList = [];
        this._tmpVisibleContainer = null;

        if (this.state.ready && this.state.renderingTree) {
            var l = collapsedLeft.length ? PillsSize : 0;
            var r = collapsedRight.length ? PillsSize : 0;
            this._splitterIndex = 0;
            var w = this.state.renderingTree.width;
            var h = this.state.renderingTree.height;
            this._buildChildrenList(this.state.renderingTree.toJS(), childrentList, { index: ZIndexStart });
        }



        return (
            <div className={`layout ${mods}`} onMouseDown={this._onDocumentMouseDown}>
                <Header />

                <div className="layout__body" ref="layoutBody" data-version={this.state.version}>
                    <div className={left_classname}>{this.renderPills(collapsedLeft)}</div>
                    <div className={top_classname}>{this.renderPills(collapsedTop)}</div>
                    {childrentList}
                    {this._renderSplitterForTmpVisiblePanel(this._tmpVisibleContainer)}
                    <div className={right_classname}>{this.renderPills(collapsedRight)}</div>
                    <div className={bottom_classname}>{this.renderPills(collapsedBottom)}</div>

                    <div className="lbox_catcher root">
                        <div className="lbox_catcher__point up"></div>
                        <div className="lbox_catcher__point left"></div>
                        <div className="lbox_catcher__point down"></div>
                        <div className="lbox_catcher__point right"></div>
                    </div>
                </div>
            </div>
        );
    }
}
