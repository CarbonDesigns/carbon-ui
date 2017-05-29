import React                  from 'react';
import {FormattedHTMLMessage} from "react-intl";
import cx                     from 'classnames';
import Dots                   from "./dots";
import ScrollContainer        from "./ScrollContainer";
import EnterInput             from "./EnterInput";
import {
    Component,
    handles,
    Dispatcher
}                             from "../CarbonFlux";
import {richApp}              from "../RichApp";
import {PropertyTracker}      from "carbon-core";
import bem from '../utils/commonUtils';

function bem_simple_list(elem, mods?, mix?) {
    return bem("simple-list", elem, mods, mix)
}


export class SimpleListItem extends React.Component<any, any> {

    static propTypes = {
        item             : React.PropTypes.any,
        renderItemBody   : React.PropTypes.func,
        renderItem       : React.PropTypes.func,
        onClick   : React.PropTypes.func,
        onDelete  : React.PropTypes.func,
        onEdit    : React.PropTypes.func
        // ...rest
    }

    constructor(props) {
        super(props);
    }

    render() {
        let {
            item,
            onClick,
            onDelete,
            onEdit,
            renderItem,
            renderItemBody,
            active,
            resolveOnEdit, ...rest} = this.props;

        if (typeof renderItem === 'function') {
            return renderItem(item)
        }

        // Listing all controls
        var controls = [];

        if (typeof onDelete === 'function') {
            controls.push(<div
                key="delete"
                className={bem_simple_list("item-control", "delete")}
                onClick={()=>onDelete(item, event)}><i className="ico--trash"/></div>)
        }
        if (typeof onEdit === 'function') {
            controls.push(<div
                key="edit"
                className={bem_simple_list("item-control", "edit")}
                onClick={(event)=>onEdit(item, event)}><Dots/></div>)
        }

        var body = (typeof renderItemBody === 'function')
            ? renderItemBody(item)
            : <div className={bem_simple_list("item-body")} onClick={(event)=>onClick(item, event)}>{item.content}</div>;

        // Rendering.
        return (
            <div className={bem_simple_list("item", {active:active})} {...rest}>
                { body }
                {(controls.length) ? <div className={bem_simple_list("item-controls")}>{controls}</div> : null}
            </div>
        )
    }
}

export default class SimpleList extends Component<any, any> {
    static defaultProps = {
        padding: true
    }
    static propTypes = {
        className    : React.PropTypes.string,
        boxClassName : React.PropTypes.string,
        insideFlyout : React.PropTypes.bool,
        padding      : React.PropTypes.bool,
        emptyMessage : React.PropTypes.node,
        selectedItem: React.PropTypes.any,
        items     : React.PropTypes.array,
        onClick   : React.PropTypes.func,
        onDelete  : React.PropTypes.func,
        onEdit    : React.PropTypes.func
    }

    render() {
        var {items,
            className,
            boxClassName,
            insideFlyout,
            padding,
            emptyMessage,
            activeItem,
            ...itemProps} = this.props;

        var content = (items.length)
            ? items.map(item => <SimpleListItem key={item.id} item={item} active={item === activeItem} {...itemProps} />)
            : (emptyMessage != null)
                ? <p className={bem_simple_list("message")}>{emptyMessage}</p>
                : null;

        return <ScrollContainer
                className={bem_simple_list('scroll-container', null, ["wrap thin", className] )}
                boxClassName={bem_simple_list(null, {padding : padding }, boxClassName)}
                insideFlyout={insideFlyout}>
            {content}
            </ScrollContainer>
    }
}
