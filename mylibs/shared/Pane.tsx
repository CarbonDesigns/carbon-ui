import React                  from 'react';
import Dots                   from '../shared/dots';
// import {FormattedHTMLMessage} from "react-intl";

/**
 *  Turns ('base', ['mod1', 'mod2'])  to -> 'base_mod1 base_mod2'.
 * */
var _render_mods = function (base, mods, glue='_') {
    if (typeof mods === 'string') {
        mods = [mods]
    }
    var cn = [];
    mods.map(function(mod){
        cn.push(base + glue + mod);
    });
    return cn.join(' ');
};

var _render_full_classname = function (base, props) {
    var cn = base;
    if (props.classMods != null)
        cn += ' ' + _render_mods(base, props.classMods);
    if (props.className != null)
        cn += ' ' + props.className;

    return cn;
};


var _get_icon = function (props) {
    var icon;
    if (props.icon != null) {
        var base_icon_cn = "pane-icon";
        switch (props.icon) {
            case 'dots' :
                icon = <i className={base_icon_cn}><Dots/></i>;
                break;
            default :
                icon = <i className={base_icon_cn + " " + props.icon}/>;
        }
    }
    return icon
};

var _get_caption = function (props) {
    //todo wrap to pane-caption only strings
    var caption;
    switch (false) {
        case !((props.children != null) && !!props.children):
            caption = <span className="pane-caption">{props.children}</span>;
            break;
        default:
            caption = null;
    }
    return caption
};

interface IPanelButtonProps extends IReactElementProps{
    icon?: string;
    label?: string;
}

export class PaneButton extends React.Component<any, void>  {
    render() {
        var cn = _render_full_classname("pane-button", this.props);
        var caption = _get_caption(this.props);
        var icon = _get_icon(this.props);
        return (
            <div className={cn} onClick={this.props.onClick}>
                {icon}
                {caption}
            </div>
        )
    }
}

export class PaneListItem extends React.Component<any, void>  {
    render() {
        var cn = _render_full_classname("pane-list__item", this.props);
        var icon    = _get_icon(this.props);
        var caption = _get_caption(this.props);

        return (
            <p className={cn} onClick={this.props.onClick}>
                {icon}
                {caption}
            </p>
        )
    }
}

export class PaneList extends React.Component<IReactElementProps, void>  {
    render() {
        var cn = _render_full_classname("pane-list", this.props);
        return (<div className={cn}>{this.props.children || ''}</div>)
    }
}

export class PaneRow extends React.Component<IReactElementProps, void>  {
    render() {
        var cn = _render_full_classname("pane-row", this.props);
        return (<div className={cn}>{this.props.children || ''}</div>)
    }
}

export class PaneLabel extends React.Component<IReactElementProps, void>  {
    render() {
        var cn = _render_full_classname("pane-label", this.props);
        return (<h5 className={cn}>{this.props.children || ''}</h5>)
    }
}


export class Pane extends React.Component<IReactElementProps, void> {
    render() {
        var cn = _render_full_classname("pane", this.props);
        var pane_content = this.props.children || '';
        return (<div className={cn}>{pane_content}</div>)
    }
}
