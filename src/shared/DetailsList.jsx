import React                  from 'react';
import {FormattedMessage} from "react-intl";
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
import {PropertyTracker, Page} from "carbon-core";

export class ListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    _onDetails = (e) => {
        this.props.onDetails(this.props.item, e);
        e.stopPropagation();
    };

    render() {
        var {onClick, ...other} = this.props;

        return (
            <div className="editable-list__item">
                { /* Body */ }
                <div className="editable-list__item-body" onClick={()=>onClick(this.props.item)}>
                    <div className="editable-list__item-name">{this.props.children}</div>
                </div>

                { /* Opener */ }
                <div className="editable-list__item-button editable-list__item-button_opener" onClick={this._onDetails}>
                    <div className="editable-list__item-button-icon"><Dots/></div>
                </div>
            </div>
        )
    }
}

export default class DetailsList extends Component {
    render() {
        var cn = cx('editable-list', this.props.className);
        return (
            <ScrollContainer className="editable-list__scroll-container  wrap  thin" boxClassName={cn}>
                {
                    this.props.items.map(item => <ListItem
                        key={item.id}
                        item={item}
                        onDetails={this.props.onDetails}
                        onClick={this.props.onClick}
                    >{item.name}</ListItem> )
                }
            </ScrollContainer>
        )
    }
}
