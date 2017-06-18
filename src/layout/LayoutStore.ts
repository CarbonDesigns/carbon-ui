import { Range, Map, List, fromJS, Record } from 'immutable';
import { handles, CarbonStore } from "../CarbonFlux";
import LayoutActions from "./LayoutActions";
import { LayoutDirection, LayoutDockPosition, IAreaConstraint } from "carbon-core";

enum PanelType {
    Container = 1,
    Splitter = 2
}

const SplitterSize: number = 3;
const CollapsedPillSize: number = 35;
const DefaultPanelWidth: number = 250;
const DefaultPanelHeight: number = 200;

const PanelRecord = Record({
    type: PanelType.Container,
    direction: undefined,
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
    panelName: null,
    children: null,
    collapsed: false,
    floating: false,
    fill: false,
    collapseDirection: undefined,
    fixed: undefined,
    index: 0,
    version:undefined
});

const SplitterRecord = Record({
    type: PanelType.Splitter,
    direction: undefined,
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
    panel1: null,
    panel2: false
});

const State = Record({
    renderingTree: null,
    resizing: false,
    minimized: false,
    name: "edit",
    width: undefined,
    height: undefined
})

function updateChildren(container, callback) {
    var children = updateList(container.children, callback);

    return container.set('children', children);
}

function insertChild(container, index, child) {
    return container.set('children', container.children.splice(index, 0, child));
}

function isCollapsed(panel) {
    return panel.collapsed || (this.state.minimized && !panel.fixed)
}

function transparentForSplit(panel) {
    return isCollapsed.call(this, panel) || panel.floating;
}

function updateList(list, callback) {
    var toreplace = [];
    var newList = list.withMutations((newList) => {
        list.forEach((t, i) => {
            var newElement = callback(t);
            if (newElement !== t) {
                if (newElement === null) {
                    toreplace.push({ index: i, elements: [] });
                }
                else if (newElement instanceof Array) {
                    toreplace.push({ index: i, elements: newElement });
                } else {
                    newList.set(i, newElement);
                }
            }
        })
    });

    while (toreplace.length) {
        var replace = toreplace.pop();
        newList = newList.splice(replace.index, 1, ...replace.elements);
    }

    return newList;
}


class Panel extends PanelRecord {

}

class LayoutMutator {
    protected parents: any[];
    constructor() {
        this.parents = [];
    }

    get parent() {
        var count = this.parents.length;
        if (count === 0) {
            return null;
        }
        return this.parents[count - 1];
    }

    mutate(e) {
        if (List.isList(e)) {
            return this.mutateList(e)
        } else {
            return this.mutatePanel(e);
        }
    }

    mutateList(list) {
        return updateList(list, this.mutatePanel.bind(this));
    }

    mutatePanel(element) {
        if (element === null) {
            return null;
        }
        if (List.isList(element.children)) {
            this.parents.push(element);
            var newList = this.mutateList(element.children);
            this.parents.pop();
            if (newList !== element.children) {
                return element.set('children', newList);
            }
        }
        return element;
    }
}

class LayoutMutatorCallback extends LayoutMutator {
    private callback: any;

    constructor(callback) {
        super();
        this.callback = callback;
    }

    static mutate(e, callback) {
        return new LayoutMutatorCallback(callback).mutate(e);
    }

    mutatePanel(e) {
        var newE = this.callback(e, this);
        return super.mutatePanel(newE);
    }
}

class LayoutMutatorCallbackDFS extends LayoutMutator {
    private callback: any;

    constructor(callback) {
        super();
        this.callback = callback;
    }

    static mutate(e, callback) {
        return new LayoutMutatorCallbackDFS(callback).mutate(e);
    }

    mutatePanel(e) {
        var newE = super.mutatePanel(e);
        return this.callback(newE, this);
    }
}

class FindAndReplaceMutator extends LayoutMutator {
    private _target: any;
    private _callback: any;

    constructor(target, callback) {
        super();
        this._target = target;
        this._callback = callback;
    }

    static mutate(e, target, callback) {
        return new FindAndReplaceMutator(target, callback).mutate(e);
    }

    mutatePanel(e) {
        if (e.index == this._target.index) {
            return this._callback(e, this, this.parents);//LayoutMutatorCallback.mutate(e, this._callback);
        }
        return super.mutatePanel(e);
    }
}

class AttachPanelMutator extends LayoutMutator {
    private _index: number;
    private _panel: any;
    private _dockPosition: LayoutDockPosition;

    constructor(index: number, panel: any, dockPosition: LayoutDockPosition) {
        super();
        this._index = index;
        this._panel = panel;
        this._dockPosition = dockPosition;
    }

    static mutate(e, index, panel, dockPosition) {
        return new AttachPanelMutator(index, panel, dockPosition).mutate(e);
    }

    _getCollapseDirection() {
        var collapseDirection;
        for (var i = 0; i < this.parents.length; ++i) {
            collapseDirection = this.parents[i].collapseDirection;
            if (collapseDirection) {
                break;
            }
        }

        return collapseDirection;
    }

    _getPreparedPanel(desiredDirection, collapseDirection, width, height) {
        return this._panel.withMutations(m => {
            m.set('floating', false);
            if (!collapseDirection) {
                m.set('collapseDirection', this._dockPosition);
            } else {
                m.set('collapseDirection', undefined);
            }

            if (desiredDirection === LayoutDirection.Row) {
                m.set('width', width);
                m.set('height', undefined);
            } else {
                m.set('height', height);
                m.set('width', undefined);
            }
            m.set('x', undefined);
            m.set('y', undefined);
        })
    }

    mutatePanel(e) {
        if (e.index === this._index) {
            var parent = this.parents[this.parents.length - 1];

            // detect children direction inside parent

            var desiredDirection = this._dockPosition & LayoutDirection.Row;
            var dock = this._dockPosition;
            var collapseDirection = this._getCollapseDirection();

            if (!parent) { // inserting into root
                let panel = this._getPreparedPanel(desiredDirection, collapseDirection, DefaultPanelWidth, DefaultPanelHeight);

                let t = new Panel({
                    direction: e.direction,
                    collapseDirection: e.collapseDirection,
                    index: ++LayoutStore.lastIndex,
                    fill: true,
                    width: 1,
                    height: 1,
                    children: e.children
                });

                if (this._dockPosition === LayoutDockPosition.Left ||
                    this._dockPosition === LayoutDockPosition.Top) {
                    children = [panel, t];
                } else {
                    children = [t, panel];
                }

                return new Panel({
                    width: e.width,
                    height: e.height,
                    x: e.x,
                    y: e.y,
                    direction: desiredDirection,
                    collapseDirection: e.collapseDirection,
                    index: ++LayoutStore.lastIndex,
                    fill: e.fill,
                    children: List(children)
                })
            }

            var panel = this._getPreparedPanel(desiredDirection, collapseDirection, e.width / 2, e.height / 2);
            var parentDirection = parent.direction;

            var children;
            var t;
            if (desiredDirection === LayoutDirection.Row) {
                t = e.set('width', 1 / 2);
                panel = panel.set('width', 1 / 2);
            } else {
                t = e.set('height', 1 / 2);
                panel = panel.set('height', 1 / 2);
            }

            if (this._dockPosition === LayoutDockPosition.Left ||
                this._dockPosition === LayoutDockPosition.Top) {
                children = [panel, t];
            } else {
                children = [t, panel];
            }

            return new Panel({
                width: e.width,
                height: e.height,
                direction: desiredDirection,
                collapseDirection: e.collapseDirection,
                index: ++LayoutStore.lastIndex,
                fill: e.fill,
                children: List(children)
            })
        }

        return super.mutatePanel(e);
    }
}

export class LayoutStore extends CarbonStore<any> {
    public static lastIndex: number = 0;

    public resizing: boolean;
    private _layoutTree: any;
    private collapseToMap: any;
    private _originalState: any;

    private layoutMetadata: any;

    constructor(props) {
        super(props);
        this.state = new State({ renderingTree: null, resizing: false });
        this.setLayout(null, null);
        this.resizing = false;
        this.collapseToMap = {};
    }

    _visiElementBFS(element, callback) {
        var stack = [element];
        var i = 0;
        while (i < stack.length) {
            var e = stack[i++];
            var res = callback(e);
            if (res === false) {
                break;
            } else if (res !== true) {
                if (List.isList(e.children)) {
                    e.children.forEach(c => stack.push(c));
                }
            }
        }
    }

    _findFirstByPredicate(layout, predicate) {
        var res = null;
        this._visiElementBFS(layout, (p) => {
            if (predicate(p)) {
                res = p;
                return false;
            }
        })

        return res;
    }

    _buildRenderingTree(panel) {
        var newPanel = panel;

        if (!this.state.width || !this.state.height) {
            return null;
        }

        this.collapseToMap = {};
        var collapsedMap = {};

        newPanel = newPanel.withMutations(m => {
            m.set('x', 0);
            m.set('y', 0);
            m.set('width', this.state.width);
            m.set('height', this.state.height);
        })

        newPanel = LayoutMutatorCallback.mutate(newPanel, (c, mutator) => {
            var collapseDirection = c.collapseDirection;
            if (c.fixed || c.floating) {
                return c;
            }
            for (var i = 0; i < mutator.parents.length; ++i) {
                var d = mutator.parents[i].collapseDirection;
                if (d) {
                    collapseDirection = d;
                    break;
                }
            }
            if (c.panelName) {
                var panelList = this.collapseToMap[collapseDirection] = this.collapseToMap[collapseDirection] || [];
                if (isCollapsed.call(this, c)) {
                    collapsedMap[collapseDirection] = true;
                }
                panelList.push(c);
            }
            return c.set('collapseDirection', collapseDirection);
        });

        newPanel = LayoutMutatorCallbackDFS.mutate(newPanel, (p) => {
            const children = p.children;
            if (List.isList(children)) {
                var allCollapsed = true;
                children.forEach(c => {
                    if (!isCollapsed.call(this, c) && !c.floating) {
                        allCollapsed = false;
                        return false;
                    }
                });

                if (allCollapsed) {
                    return p.set('collapsed', allCollapsed);
                }
            }
            return p;
        });

        var l = 0, r = 0, t = 0, b = 0;
        if (!this.state.minimized) {
            if (collapsedMap[LayoutDockPosition.Left]) {
                l = CollapsedPillSize;
            }
            if (collapsedMap[LayoutDockPosition.Right]) {
                r = CollapsedPillSize;
            }
            if (collapsedMap[LayoutDockPosition.Top]) {
                t = CollapsedPillSize;
            }
            if (collapsedMap[LayoutDockPosition.Bottom]) {
                b = CollapsedPillSize;
            }
        }
        newPanel = newPanel.withMutations(m => {
            m.set('x', newPanel.x + l);
            m.set('y', newPanel.y + t);
            m.set('width', newPanel.width - l - r);
            m.set('height', newPanel.height - t - b);
        })

        newPanel = LayoutMutatorCallback.mutate(newPanel, (p, m) => {
            var newP = p;

            if (List.isList(p.children)) {
                var size = { width: p.width, height: p.height };
                newP = this._insertSplitters(newP, p.direction, size);
                newP = this._calculateChildrenSizes(newP, p.direction, size, newPanel, m.parents || []);
                newP = this._calculateChildrenPositions(newP, p.direction, p.x, p.y, newPanel)
            }

            return newP;
        });

        return newPanel;
    }


    mutateLayout(callback) {
        if (!this._layoutTree) {
            return;
        }
        var newLayoutTree = LayoutMutatorCallback.mutate(this._layoutTree, callback);
        if (newLayoutTree !== this._layoutTree) {
            this.updateLayout(newLayoutTree, true);
        }
    }

    setLayout(name: string, layoutMetadata: any) {
        this.state = this.state.withMutations(m=>{
            m.set('name', name);
            m.set('minimized', false);
        });

        if (name) {
            let storedMetadata = localStorage['layout:' + name];
            if (storedMetadata) {
                storedMetadata = JSON.parse(storedMetadata);
                if(storedMetadata.version === layoutMetadata.version) {
                    layoutMetadata = storedMetadata;
                }
            }
        }

        this.layoutMetadata = layoutMetadata;
        this._layoutTree = null;

        this.getRenderingTree(true);

        this._simplifyLayout();
    }

    getLayoutName() {
        return this.state.get('name');
    }

    _immutableChildren(array) {
        if (!array) {
            return undefined;
        }

        return List(array.map(p =>
            new Panel({
                width: p.width,
                height: p.height,
                direction: p.direction,
                panelName: p.panelName,
                collapsed: p.collapsed,
                collapseDirection: p.collapseDirection,
                fixed: p.fixed,
                index: p.index || ++LayoutStore.lastIndex,
                floating: p.floating,
                fill: p.fill,
                x: p.x,
                y: p.y,
                children: this._immutableChildren(p.children)
            }))
        );
    }

    _initLastUsedIndex(layoutMetadata) {
        var stack = [layoutMetadata];
        LayoutStore.lastIndex = 0;
        while (stack.length) {
            var p = stack.pop();
            LayoutStore.lastIndex = Math.max(LayoutStore.lastIndex, p.index || 0);

            if (p.children) {
                stack = stack.concat(p.children);
            }
        }
    }

    getRenderingTree(force?: boolean) {
        var renderingTree = this.state.get('renderingTree');
        if (!renderingTree || force) {
            var layoutMetadata = this.layoutMetadata;

            if (!layoutMetadata) {
                return null;
            }

            this._initLastUsedIndex(layoutMetadata);

            if (!this._layoutTree) {
                this._layoutTree = new Panel({
                    width: layoutMetadata.width,
                    height: layoutMetadata.height,
                    direction: layoutMetadata.direction,
                    panelName: layoutMetadata.panelName,
                    collapsed: layoutMetadata.collapsed,
                    version: layoutMetadata.version,
                    collapseDirection: layoutMetadata.collapseDirection,
                    fixed: layoutMetadata.fixed,
                    fill: layoutMetadata.fill,
                    x: layoutMetadata.x,
                    y: layoutMetadata.y,
                    index: layoutMetadata.index || ++LayoutStore.lastIndex,
                    children: this._immutableChildren(layoutMetadata.children)
                });
            }

            this.updateLayout(this._layoutTree, false);
        }

        return this.state.get('renderingTree');
    }

    getCollapsed(dock) {
        var res = [];
        var list = this.collapseToMap[dock] || [];
        for (var i = 0; i < list.length; ++i) {
            var p = list[i];
            if (p.collapsed && p.panelName) {
                res.push(p);
            }
        }

        return res;
    }

    updateLayout(layout, save) {
        this._layoutTree = layout;
        var renderingTree = this._buildRenderingTree(layout);
        this.state = this.state.set('renderingTree', renderingTree);
        if (save) {
            localStorage['layout:' + this.state.get('name')] = JSON.stringify(this._layoutTree.toJSON());
        }
    }

    @handles(LayoutActions.setLayout)
    onSetLayout({ name, layout }) {
        this.setLayout(name, layout);
    }

    @handles(LayoutActions.attachPanel)
    onAttachPanel(data) {
        this.attachPanel(data.sourceIndex, data.targetIndex, data.dockPosition);
    }

    attachPanel(sourceIndex, targetIndex, dockPosition) {
        var source = null;
        var parent = null;

        var newLayoutTree = FindAndReplaceMutator.mutate(this._layoutTree, { index: sourceIndex }, (c, mutator, parents) => {
            source = c;
            return null;
        });

        newLayoutTree = AttachPanelMutator.mutate(newLayoutTree, targetIndex, source, dockPosition);

        this._simplifyLayout();

        if (newLayoutTree !== this._layoutTree) {
            this.updateLayout(newLayoutTree, true);
        }
    }

    @handles(LayoutActions.toggleMinimizedView)
    onToggleMinimizedView({ layout }) {
        this.state = this.state.set('minimized', !this.state.minimized);

        this.getRenderingTree(true);
    }

    @handles(LayoutActions.togglePanelGroup)
    onTogglePanelGroup({ group }) {
        this.mutateLayout((e) => {
            if (e.index === group.index) {
                return e.set('collapsed', !e.collapsed);
            }

            return e;
        });
    }

    togglePanelByName(name: string) {
        this.mutateLayout((e) => {
            if (e.panelName === name) {
                return e.set('collapsed', !e.collapsed);
            }

            return e;
        });
    }

    @handles(LayoutActions.detachPanel)
    _onDetachPanel({ index, x, y, width, height }) {
        this._detachPanel(p => p.index === index, x, y, width, height);
    }

    detachPanelByName(name, x, y, width, height) {
        this._detachPanel(p => p.panelName === name, x, y, width, height);
    }

    _detachPanel(predicate, x, y, width, height) {
        var parent = null;
        var removed = null;

        var newLayoutTree = LayoutMutatorCallback.mutate(this._layoutTree, (e, m) => {
            if (predicate(e)) {
                if (e.floating) {
                    return e;
                }

                parent = m.parents[m.parents.length - 1];
                removed = e.withMutations(m => {
                    m.set('floating', true);
                    m.set('x', x);
                    m.set('y', y);
                    m.set('width', width);
                    m.set('height', height);
                    m.set('collapsed', false);
                })

                return null;
            }

            return e;
        });

        if (parent) {
            var floatingChildren = newLayoutTree.children;
            if (!List.isList(floatingChildren)) {
                floatingChildren = List();
            }
            floatingChildren = floatingChildren.push(removed);
            this.updateLayout(newLayoutTree.set('children', floatingChildren), true);

            this._simplifyLayout();
        }
    }


    @handles(LayoutActions.movePanel)
    onMovePanel({ index, x, y }) {
        this.mutateLayout((e) => {
            if (e.index === index && e.floating) {
                return e.withMutations(m => {
                    m.set('x', x);
                    m.set('y', y);
                })
            }

            return e;
        });
    }

    @handles(LayoutActions.startResizing)
    onStartResizing() {
        this.resizing = true;
        this.state = this.state.set('resizing', true);
    }

    @handles(LayoutActions.stopResizing)
    onStopResizing() {
        this.resizing = false;
        this.state = this.state.set('resizing', false);
    }

    @handles(LayoutActions.resizingPanel)
    onResizing({ panel, recalculate }) {
        this.mutateLayout((e) => {
            if (e.index === panel.index) {
                return e.withMutations(m => {
                    if (panel.x !== undefined) {
                        m.set('x', panel.x);
                    }

                    if (panel.y !== undefined) {
                        m.set('y', panel.y);
                    }

                    m.set('width', panel.width);
                    m.set('height', panel.height);
                });
            }

            return e;

        });
    }

    @handles(LayoutActions.windowResized)
    onResizingWindow({ width, height }) {
        this.resize(width, height);
    }

    getRenderedPanelByIndex(index: number) {
        return this._findFirstByPredicate(this.state.renderingTree, p => p.index === index);
    }

    getRenderedPanelByName(panelName: string) {
        return this._findFirstByPredicate(this.state.renderingTree, p => p.panelName === panelName);
    }

    resize(width, height) {
        this.state = this.state.withMutations(m => {
            m.set('width', width);
            m.set('height', height);
        })
        this.getRenderingTree(true);
    }

    _simplifyLayout() {
        this.mutateLayout((p, m) => {
            if (List.isList(p.children)) {
                if (p.children.size === 0) {
                    return null; // remove this panel
                }
                if (p.children.size === 1) {
                    var e = p.children.get(0);
                    return m.mutatePanel(e.withMutations(m => {
                        m.set('collapseDirection', p.collapseDirection);
                        m.set('width', p.width);
                        m.set('height', p.height);
                    }));
                }
            }
            return p;
        })
    }

    _insertSplitters(newP, direction, size) {
        var splitterSize = SplitterSize;
        var splitters = [];
        // add splitters
        for (var i = 0; i < newP.children.size - 1; ++i) {
            var child = newP.children.get(i);
            var k = i + 1;
            if (transparentForSplit.call(this, child)) {
                continue;
            }

            for (var j = k; j < newP.children.size; ++j) {
                var nextChild = newP.children.get(j);
                if (!transparentForSplit.call(this, nextChild)) {
                    splitters.push({ index: k, panel1: child, panel2: nextChild });
                    break;
                }
            }
        }
        while (splitters.length) {
            var s = splitters.pop();
            newP = insertChild(newP, s.index, new SplitterRecord({
                panel1: s.panel1,
                panel2: s.panel2,
                direction: direction,
                width: (direction === LayoutDirection.Row) ? splitterSize : size.width,
                height: (direction === LayoutDirection.Column) ? splitterSize : size.height
            }));
        }

        return newP;
    }

    _calculateChildrenSizes(newP, direction, size, root, parents) {
        var prop;
        var orthogonalProp;

        if (direction === LayoutDirection.Column) {
            prop = 'height';
            orthogonalProp = 'width';
        } else {
            prop = 'width';
            orthogonalProp = 'height';
        }

        var totalSize = 0;
        var fixedSize = 0;
        var flexSize = 0;
        newP.children.forEach(e => {
            var v = e.get(prop) || 1;
            if (e.fill) {
                v = 1;
            }

            if (!(e.floating || isCollapsed.call(this, e))) {
                if (v <= 1) {
                    flexSize += v;
                } else {
                    fixedSize += v;
                }
            }
        });

        var availiableSize = size[prop] - fixedSize;
        var flexibleChildren = 0;
        newP = updateChildren(newP, e => {
            var v = e.get(prop) || 1;
            if (e.fill) {
                v = 1;
            }

            if (isCollapsed.call(this, e)) {
                if (e.collapseDirection & 1) { //horizontal
                    v = e.width;

                    // detect width from parents chain
                    var elements = parents.concat([newP, e]);
                    let width = DefaultPanelWidth;
                    for (var i = elements.length - 1; i >= 0; --i) {
                        width = elements[i].width;
                        if (width && width > 1) {
                            break;
                        }
                    }

                    return e.withMutations(m => {
                        m.set('width', width);
                        m.set('height', root.height);
                    });
                } else {
                    v = e.height;

                    // detect height from parents chain
                    let height = DefaultPanelHeight;
                    var elements = parents.concat([newP, e]);
                    for (var i = elements.length - 1; i >= 0; --i) {
                        height = elements[i].height;
                        if (height && height > 1) {
                            break;
                        }
                    }

                    return e.withMutations(m => {
                        m.set('width', root.width);
                        m.set('height', height);
                    });
                }
            }

            var pvalue = 0;
            var opvalue = size[orthogonalProp];
            if (v <= 1) {
                pvalue = availiableSize * v / flexSize;
            } else {
                pvalue = v;
            }

            if (e.floating) {
                return e;
            }

            if ((e.type === 1) && !e.floating && !isCollapsed.call(this, e)) {
                flexibleChildren++;
            }
            totalSize += pvalue;

            return e.withMutations(m => {
                m.set(prop, pvalue);
                m.set(orthogonalProp, opvalue);
            });
        });

        var ds = size[prop] - totalSize;
        if (ds != 0 && flexibleChildren) {
            ds /= flexibleChildren;
            newP = updateChildren(newP, e => {
                if ((e.type === 1) && !e.floating && !isCollapsed.call(this, e)) {
                    return e.set(prop, e.get(prop) + ds);
                }
                return e;
            });
        }

        return newP;
    }

    _calculateChildrenPositions(newP, direction, x, y, root) {
        return updateChildren(newP, e => {
            var newE = e;
            if (isCollapsed.call(this, e)) {
                if (e.collapseDirection === LayoutDockPosition.Right) {
                    newE = newE.withMutations(m => {
                        m.set('x', root.width - newE.width + root.x);
                        m.set('y', root.y);
                    });
                }
                else if (e.collapseDirection === LayoutDockPosition.Bottom) {
                    newE = newE.withMutations(m => {
                        m.set('x', root.x);
                        m.set('y', root.height - newE.height + root.y);
                    });
                }
                else {
                    newE = newE.withMutations(m => {
                        m.set('x', root.x);
                        m.set('y', root.y);
                    });
                }
            }
            else if (!e.floating) {
                newE = newE.withMutations(m => {
                    m.set('x', x);
                    m.set('y', y);
                });

                if (direction === LayoutDirection.Row) {
                    x += e.width;
                } else {
                    y += e.height;
                }
            }
            return newE;
        })
    }
}

export default new LayoutStore(null);
