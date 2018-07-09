import * as React from "react";
import * as PropTypes from "prop-types";
import { CompositeElement, PrimitiveType } from "carbon-core";
import { app, Artboard, Selection, LayerType, IIsolationLayer, Invalidate, IComposite, Primitive } from "carbon-core";
import * as cx from "classnames";
import { listenTo, Component } from "../../CarbonFlux";
import { iconType } from "../../utils/appUtils";
import {
    FormattedMessage,
    FormattedNumber,
    FormattedPlural
} from "react-intl";
import { CarbonAction } from "../../CarbonActions";
import styled from "styled-components";
import theme from "../../theme";

export default class Breadcrumbs extends Component<any, any> {
    static contextTypes = {
        workspace: PropTypes.object,
        intl: PropTypes.object
    }

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
        var view = this.context.workspace.view;
        var layer = null;
        if (view) {
            layer = view.getLayer(LayerType.Isolation) as IIsolationLayer;
        }

        if (layer.isActive) {
            let owner = layer.getOwner();
            if (e) {
                e = owner.findNodeByIdBreadthFirst(e.id);
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
                        id: e.id,
                        element: e,
                        exitIsolation: exit
                    });
                }
                e = e.parent;
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
                        id: e.id
                    });
                }
                e = e.parent;
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
            parentId = selection.elements[0].parent.id;
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

        var pageId = app.activePage.id;
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
            this.context.workspace.view._highlightTarget = element.element;
        } else {
            delete this.context.workspace.view._highlightTarget;
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

        return (<BreadcrumbsContainer>
            {renderedBreadcrumbs}
            <div className="breadcrumbs__actions">
                <div className={"breadcrumbs__action"} title="Select all" onClick={this._selectAll}><i className="ico-select-all" /></div>
                {selectedAmount > 0 &&
                    <div className={"breadcrumbs__action"} title="Deselect" onClick={this._selectNone}><i className="ico-select-none" /></div>}
            </div>
        </BreadcrumbsContainer>)
    }
}

const BreadcrumbsContainer = styled.div`
    font:${theme.default_font};
    color:${theme.text_color};
    display:flex;

    white-space:nowrap;
    height:100%;
    align-items: stretch;
    flex-wrap:nowrap;

    margin-right: auto;

    .breadcrumbs {
        &__selected-amount{
            margin-right: .3em;
            color: ${theme.text_color};
        }

        &__actions {
            display:flex;
            align-items: stretch;
            flex-wrap:nowrap;
            margin-left: ${theme.margin1};
        }

        &__action {
            opacity:0.7
            &:hover {
                opacity:1;
            }

            padding: 0 ${theme.margin1};
            cursor:pointer;
            font:${theme.default_font};
            color:${theme.text_color};
            display:flex;
            align-items:center;
            line-height: 1;
        }
    }

    .breadcrumb,
    .breadcrumbs__message {
        padding: 0 ${theme.margin1};
        font:${theme.default_font};
        color:${theme.text_color};
        display:flex;
        justify-content:left;
        line-height: 1;
    }

    .breadcrumb {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width:100px;
        position:relative;

        &_first {
            padding-left: ${theme.margin1};
        }

        &__icon {
            width:12px;
            height:11px;
            position:relative;
        }

        cursor:pointer;
        user-select: none;
        &_last {
            cursor: inherit;
        }

        &:hover &__caption {
            border-bottom: 1px dotted ${theme.action_underline};
        }

        &_last:hover &__caption {
            border-bottom: none;
        }

        &__arrow {
            position:absolute;
            right:3px;
            height:100%;
            top:0;
            width:0;

            &:after, &:before {
                content: "";
                position: absolute;
                display: block;
                left: 100%;
                width:0;
                height:16%;

                border-right: 1px solid ${theme.action_underline};
            }

            &:before {
                transform:skewX(40deg);
                top: 34%;
            }
            &:after {
                transform:skewX(-40deg);
                bottom: 34%;
            }
        }
    }
`;