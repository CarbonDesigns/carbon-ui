import React from 'react';
import { CompositeElement, PrimitiveType } from "carbon-core";
import { app, Artboard, Selection, Environment, LayerType, IIsolationLayer, Invalidate, IComposite, Primitive } from "carbon-core";
import cx from 'classnames';
import { listenTo, Component } from "../../CarbonFlux";
import { iconType } from "../../utils/appUtils";
import {
    FormattedMessage,
    FormattedNumber,
    FormattedPlural
} from "react-intl";
import { CarbonAction } from "../../CarbonActions";

export default class Breadcrumbs extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            parentId: null,
            elements: [],
            selection: null
        };
    }

    canHandleActions() {
        return true;
    }

    onAction(action: CarbonAction) {
        switch (action.type) {
            case "Carbon_Selection":
                this.onElementSelected(action.composite);
                return;
            case "Carbon_AppChanged":
                this.onAppChanged(action.primitives);
                return;
        }
    }

    _buildBreadcrumbElements(element) {
        var e = element;
        var res = [];
        var view = Environment.view;
        var layer = Environment.view.getLayer(LayerType.Isolation) as IIsolationLayer;

        if (layer.isActive) {
            let owner = layer.getOwner();
            if (e) {
                e = owner.findNodeByIdBreadthFirst(e.id());
            }
            else {
                e = owner;
            }
            let exit = false;
            while (e) {
                if (e === owner) {
                    exit = true;
                }
                if (e.canSelect() || e instanceof Artboard) {
                    res.splice(0, 0, {
                        name: e.displayName(),
                        type: e.t,
                        iconType: iconType(e),
                        id: e.id(),
                        element: e,
                        exitIsolation: exit
                    });
                }
                e = e.parent();
            }
        }
        else {
            while (e) {
                if (e.canSelect() || e instanceof Artboard) {
                    res.splice(0, 0, {
                        name: e.displayName(),
                        type: e.t,
                        iconType: iconType(e),
                        element: e,
                        id: e.id()
                    });
                }
                e = e.parent();
            }
        }

        return res;
    }

    onSelectionMade(selection) {
        this.onElementSelected(selection);
    }

    onElementSelected(selection: IComposite) {
        var elements = [];
        var parentId = null;
        if (selection.elements.length === 1) {
            elements = this._buildBreadcrumbElements(selection.elements[0]);
            parentId = selection.elements[0].parent().id();
        } else {
            elements = this._buildBreadcrumbElements(null);
        }

        this.setState({ elements, selection, parentId });
    }

    onAppChanged(primitives: Primitive[]) {
        var current = this.state.selection;
        if (!current) {
            return;
        }

        var pageId = app.activePage.id();
        var elements = this.state.elements;

        for (var i = 0; i < primitives.length; i++) {
            var p = primitives[i];
            if (p.path[0] === pageId) {
                if (p.type === PrimitiveType.DataNodeRemove
                    || p.type === PrimitiveType.DataNodeChange
                    || p.type === PrimitiveType.DataNodeAdd) {
                    var elementId = p.path[p.path.length - 1];
                    var needUpdate = elements.some(x => x.id === elementId);
                    if (needUpdate) {
                        break;
                    }
                }
            }

        }

        if (needUpdate) {
            this.onElementSelected(current);
        }
    }

    _removeSelection() {
        Selection.clearSelection();
    }

    _select(element, isLast) {
        if (isLast) {
            return;
        }

        if (element.exitIsolation) {
            app.actionManager.invoke("exitisolation");
        }
        Selection.makeSelection([element.element]);
    }

    _arrow(isLast) {
        if (!isLast) {
            return (<div className="breadcrumb__arrow" key="breadcrumb__arrow"></div>);
        }
        return null;
    }

    _highlight(element) {
        if (element) {
            Environment.view._highlightTarget = element.element;
        } else {
            delete Environment.view._highlightTarget;
        }

        Invalidate.requestInteractionOnly();
    }

    _breadcrumbElement(element, isLast, index) {
        if (!element.id) {
            return null;
        }

        var type_cn = "type-icon_" + element.iconType;

        var className = cx("breadcrumb__icon type-icon inline-ico", type_cn);

        return (
            <div
                className={cx("breadcrumb", {
                    breadcrumb_first: index === 0,
                    breadcrumb_last: isLast
                })}
                onMouseEnter={() => this._highlight(element)}
                onMouseLeave={() => this._highlight(null)}
                onClick={() => this._select(element, isLast)} key={element.id}>
                <i className={className} />
                <span className="breadcrumb__caption" >{
                    (element.name || "").trim().length > 0
                        ? (element.name + '')
                        : (element.type + ' ' + element.id)
                }</span>
                {this._arrow(isLast)}
            </div>);
    }


    _renderMultiple(selection) {
        var plurals;
        if (selection.allHaveSameType()) {
            var displayType = selection.elements[0].displayType();
            var translatedType = this.context.intl.formatMessage({ id: displayType, defaultMessage: displayType });
            translatedType = translatedType.toLowerCase();
            plurals = {
                value: selection.count(),
                one: translatedType + "  selected",
                two: translatedType + "s selected",
                few: translatedType + "s selected",
                other: translatedType + "s selected"
            }
        }
        else {
            plurals = {
                value: selection.count(),
                one: "element selected",
                two: "elements selected",
                few: "elements selected",
                other: "elements selected"
            }
        }

        return <div className="breadcrumbs__message">
            <span className="breadcrumbs__selected-amount"><FormattedNumber value={selection.count()} /></span>
            <FormattedPlural {...plurals} />
        </div>
    }

    _selectAll() { app.actionManager.invoke('selectAll') }

    _selectNone() { app.actionManager.invoke('clearSelection') }

    render() {
        var renderedBreadcrumbs = null;

        if (this.state.selection) {
            var selectedAmount = this.state.selection.count();
            var lastElementIndex = this.state.elements.length - 1;

            if (this.state.elements.length) {
                renderedBreadcrumbs = this.state.elements.map((e, index) =>
                    this._breadcrumbElement(e, index === lastElementIndex, index)
                )
            }
            else if (selectedAmount > 1) {
                renderedBreadcrumbs = this._renderMultiple(this.state.selection)
            }
        }

        return (<div className="breadcrumbs">
            {renderedBreadcrumbs}
            <div className="breadcrumbs__actions">
                <div className={"breadcrumbs__action"} title="Select all" onClick={this._selectAll}><i className="ico-select-all" /></div>
                {selectedAmount > 0 &&
                    <div className={"breadcrumbs__action"} title="Deselect" onClick={this._selectNone}><i className="ico-select-none" /></div>}
            </div>
        </div>)
    }
}
