import React from 'react';
import {CompositeElement, PrimitiveType} from "carbon-core";
import {app, Artboard, Selection, Environment} from "carbon-core";
import cx from 'classnames';
import {listenTo, Component} from "../../CarbonFlux";
import {iconType} from "../../utils/appUtils";
import {
    FormattedMessage,
    FormattedNumber,
    FormattedPlural
} from "react-intl";

export default class Breadcrumbs extends Component<any, any> {
    [name:string] : any;

    constructor(props) {
        super(props);
        this.state = {
            parentId       : null,
            elements       : [],
            selection      : null
        };
    }

    _buildBreadcrumbElements(element) {
        var e = element;
        var res = [];
        var view = Environment.view;
        while (e) {
            if (e.canSelect()  || e instanceof Artboard) {
                res.splice(0, 0, {
                    name     : e.displayName(),
                    type     : e.t,
                    iconType : iconType(e),
                    id       : e.id()
                });
            }
            e = e.parent();
        }

        return res;
    }

    onSelectionMade(selection){
        this.onElementSelected(selection);
    }

    onElementSelected(selection) {
        var elements = [];
        var parentId = null;
        if (selection.count() === 1) {
            elements = this._buildBreadcrumbElements(selection.elements[0]);
            parentId = selection.elements[0].parent().id();
        }

        this.setState({ elements, selection, parentId });
    }

    onAppChanged(primitives) {
        var current = this.state.selection;
        if (!current) {
            return;
        }

        var pageId = app.activePage.id();
        var elements = this.state.elements;

        for (var i = 0; i < primitives.length; i++){
            var p = primitives[i];
            if (p.path[0] === pageId){
                if (p.type === PrimitiveType.DataNodeRemove
                    || p.type === PrimitiveType.DataNodeChange
                    || p.type === PrimitiveType.DataNodeAdd){
                    var elementId = p.path[p.path.length - 1];
                    var needUpdate = elements.some(x => x.id === elementId);
                    if (needUpdate){
                        break;
                    }
                }
            }

        }

        if (needUpdate) {
            setTimeout(()=>this.onElementSelected(current), 0);
        }
    }

    componentDidMount() {
        app.onLoad(()=> {
            this._onElementSelectedSubscribtion = Selection.onElementSelected.bind(this, this.onSelectionMade);
            this._syncLogToken                  = app.changed.bind(this, this.onAppChanged);
        });
    }

    componentWillUnmount() {
        if (this._onElementSelectedSubscribtion) {
            this._onElementSelectedSubscribtion.dispose();
            delete this._onElementSelectedSubscribtion;
        }

        if (this._syncLogToken) {
            this._syncLogToken.dispose();
            delete this._syncLogToken;
        }
    }

    _removeSelection() {
        Selection.clearSelection();
    }

    _select(element, isLast) {
        if (isLast) {
            return;
        }
        if (this.state.selection.count() === 1){
            var e = this.state.selection.elements[0];
            while (e && e.parent && e.id() !== element.id) {
                e = e.parent();
            }
            Selection.makeSelection([e]);
        }
    }


    _arrow(isLast) {
        if (!isLast)
            return (<div className="breadcrumb__arrow" key="breadcrumb__arrow"></div>);
        return null;
    }

    _breadcrumbElement(element, isLast, index) {
        if(!element.id) {
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
                onClick={()=>this._select(element, isLast)} key={element.id}>
                <i className={className} />
                <span className="breadcrumb__caption" >{
                    (element.name||"").trim().length>0
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
            var translatedType = this.context.intl.formatMessage({id: displayType, defaultMessage: displayType});
            translatedType = translatedType.toLowerCase();
            plurals = {
                value : selection.count(),
                one   : translatedType + "  selected",
                two   : translatedType + "s selected",
                few   : translatedType + "s selected",
                other : translatedType + "s selected"
            }
        }
        else {
            plurals = {
                value : selection.count(),
                one   : "element selected",
                two   : "elements selected",
                few   : "elements selected",
                other : "elements selected"
            }
        }

        // <FormattedMessage id="todo translateme!" defaultMessage={`{1} elements selected`} values={{amount: amount}}/>
        return <div className="breadcrumbs__message">
            <span className="breadcrumbs__selected-amount"><FormattedNumber value={selection.count()} /></span>
            <FormattedPlural {...plurals} />
        </div>
    }

    _selectAll(){app.actionManager.invoke('selectAll')}

    _selectNone(){app.actionManager.invoke('clearSelection')}

    render() {
        var renderedBreadcrumbs = null;

        if (this.state.selection){
            var selectedAmount = this.state.selection.count();
            var lastElementIndex = this.state.elements.length - 1;

            if (this.state.elements.length) {
                renderedBreadcrumbs = this.state.elements.map((e, index)=>
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
                <div className={"breadcrumbs__action"} title="Select all" onClick={this._selectAll}><i className="ico-select-all"/></div>
                { selectedAmount > 0 &&
                    <div className={"breadcrumbs__action"} title="Deselect" onClick={this._selectNone}><i className="ico-select-none"/></div> }
                {//fixme - translate titles
                    /*<div className="breadcrumbs__action"><i className="ico-select-all"/>Isolate</div> */}
            </div>
        </div>)
    }
}
