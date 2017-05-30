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
import {PropertyTracker, Page} from "carbon-core";
import bem from '../utils/commonUtils';


var b = "editable-list";

export class ListItem extends React.Component<any, any> {
    refs: any;

    constructor(props) {
        super(props);
        this.state = {
            controls_open: false,
            editing: false
        };
    }

    _onOpen = (e) => {
        this.setState({
            controls_open: true//!this.state.controls_open
        });
        e.stopPropagation();
    };

    _onRename = (e?) => {
        if (!this.state.editing) {
            this.setState({
                editing: true
            });
        }
        else {
            this.setState({
                editing: false,
                controls_open: false
            });
            this.props.onRename(this.refs.input.getValue(), this.props.item);
        }
        e && e.stopPropagation();
    };

    _onDelete = (e) => {
        this.props.onDelete(this.props.item);
        e.stopPropagation()
    };

    _onCancel = (e) => {
        this.setState({
            controls_open: false,
            editing: false
        });
        e.stopPropagation();
    };

    componentDidUpdate() {
        if (this.state.editing) {
            this.refs["input"].focus();
        }
    }

    render() {
        var cn = bem(b, "item", {
            "controls-open" : this.state.controls_open,
            editing         : this.state.editing,
            selected        : this.props.selected
        });
        var {text, onClick, icon, ...rest} = this.props;

        return (
            <div className={cn}>

                { /* Body */ }
                <div className={bem(b, "item-body")} onClick={()=>onClick&&onClick(this.props.item)}>
                    {
                        this.state.editing
                            ? <div className="inputWrap">
                                <EnterInput
                                    ref="input"
                                    value={text}
                                    changeOnBlur={false}
                                    onChange={() => this._onRename()}
                                />
                              </div>
                            : this._renderContent(text, icon)
                    }
                </div>

                { /* Opener */ }
                <div className={bem(b, "item-button", "opener")} onClick={this._onOpen}>
                    <div className={bem(b, "item-button-icon")}><Dots/></div>
                </div>

                { /* Board controls */ }
                <div className={bem(b, "item-controls")}>
                    <div className={bem(b, "item-button", "closer")} onClick={this._onCancel}>
                        <div className={bem(b, "item-button-icon")}><i className="ico--cancel"/></div>
                    </div>
                    {
                        !this.state.editing && (!this.props.canDelete || this.props.canDelete(this.props.item))
                            ? <div className={bem(b, "item-button", "delete")} onClick={this._onDelete}>
                                <div className={bem(b, "item-button-icon")}><i className="ico--trash"/></div>
                              </div>
                            : null
                    }
                    <div className={bem(b, "item-button")} onClick={this._onRename}>
                        <div className={bem(b, "item-button-icon")}>
                            <i className={this.state.editing ? "ico--ok" : "ico--edit"}/>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    _renderContent(text, icon){
        var content = [];
        if (icon){
            content.push(<i key="icon" className={icon}/>);
        }
        content.push(<p key="name" className={bem(b, "item-name")}>{text}</p>);
        return content;
    }
}

export default class EditableList extends Component<any, any> {
    render() {
        var items;
        if (this.props.children != null) {
            items = this.props.children;
        }
        else if (this.props.items != null) {
            items = this.props.items.map(item =>
                <ListItem
                    key={item.id}
                    text={item.name}
                    icon={item.icon}
                    item={item}
                    selected={item.selected || false}
                    onClick={this.props.onClick}
                    onRename={this.props.onRename}
                    onDelete={this.props.onDelete}
                    canDelete={this.props.canDelete}
                />)
        }

        return (
            <ScrollContainer
                className={bem(b, "scroll-wrap", null, "wrap thin")}
                boxClassName={bem(b)}
                insideFlyout={this.props.insideFlyout}
            >
                {items}
            </ScrollContainer>
        );
        // return (
        //     <div className={bem(b)}>
        //         <ScrollContainer className={bem(b, "scroll-container", null, "wrap thin")} insideFlyout={this.props.insideFlyout}>
        //             {
        //                 this.props.items.map(item => <ListItem
        //                     key={item.id}
        //                     text={item.name}
        //                     icon={item.icon}
        //                     item={item}
        //                     onClick={this.props.onClick}
        //                     onRename={this.props.onRename}
        //                     onDelete={this.props.onDelete}
        //                     canDelete={this.props.canDelete}
        //                 />
        //                 )
        //             }
        //         </ScrollContainer>
        //     </div>
        // )
    }

    static PropTypes = {
        items     : React.PropTypes.any,
        onClick   : React.PropTypes.func,
        onRename  : React.PropTypes.func,
        onDelete  : React.PropTypes.func,
        insideFlyout : React.PropTypes.bool,
        canDelete : React.PropTypes.any
    }
    static defaultProps = {
        // items     : React.PropTypes.any,
        // onClick   : React.PropTypes.func,
        // onRename  : React.PropTypes.func,
        // onDelete  : React.PropTypes.func,
        insideFlyout : false,
        canDelete : true
    }
}
