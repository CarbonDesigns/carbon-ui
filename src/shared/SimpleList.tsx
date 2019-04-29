import * as React from 'react';
import { FormattedMessage } from "react-intl";
import Dots from "./dots";
import ScrollContainer from "./ScrollContainer";
import EnterInput from "./EnterInput";
import {
    Component,
    handles,
    Dispatcher
} from "../CarbonFlux";
import { richApp } from "../RichApp";
import { PropertyTracker } from "carbon-core";
import IconButton from '../components/IconButton';
import icons from "../theme-icons";
import theme from "../theme";
import styled from 'styled-components';

export class SimpleListItem extends React.Component<any, any> {

    constructor(props) {
        super(props);
    }

    private onClick = e => {
        if (this.props.onClick) {
            this.props.onClick(this.props.item, e);
        }
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
            resolveOnEdit, ...rest } = this.props;

        if (typeof renderItem === 'function') {
            return renderItem(item)
        }

        // Listing all controls
        var controls = [];

        if (typeof onDelete === 'function') {
            controls.push(
                <IconButton key="delete" icon={icons.delete}onClick={() => onDelete(item, event)}/>
            )
        }
        if (typeof onEdit === 'function') {
            controls.push(
                <IconButton key="edit" icon={icons.edit} onClick={() => onEdit(item, event)}/>
            )
        }

        var body = (typeof renderItemBody === 'function')
            ? renderItemBody(item)
            : <div onClick={this.onClick}>{item.content}</div>;

        // Rendering.
        return (
            <ListItem active={ active} {...rest}>
                {body}
                {(controls.length) ? <ListControls>{controls}</ListControls> : null}
            </ListItem>
        )
    }
}

const ListItem = styled.div<{active:boolean}>`
    display:grid;
    width:100%;
    grid-template-columns: 1fr 14px;
`;

const ListControls = styled.div`
    display:grid;
`;

export default class SimpleList extends Component<any, any> {
    static defaultProps = {
        padding: true,
        scrolling: true
    }

    render() {
        var { items,
            className,
            boxClassName,
            insideFlyout,
            padding,
            emptyMessage,
            activeItem,
            scrolling,
            ...itemProps } = this.props;

        var content = (items.length)
            ? items.map(item => <SimpleListItem key={item.id} item={item} active={item === activeItem} {...itemProps} />)
            : (emptyMessage)
                ? <EmptyListMessage>{emptyMessage}</EmptyListMessage>
                : null;

        if (this.props.scrolling) {
            return <ScrollContainer
                insideFlyout={insideFlyout}>
                {content}
            </ScrollContainer>
        }
        return <div className={className}>
            {content}
        </div>;
    }
}

const EmptyListMessage = styled.p`
    width:100%;
    text-align:center;
    font:${theme.default_font};
    color:${theme.text_color};
`;