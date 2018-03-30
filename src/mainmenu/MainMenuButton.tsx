import * as React from "react";
import classNames from 'classnames';
import {richApp} from "../RichApp";
import AppActions from "../RichAppActions";
import * as cx from "classnames";
import bem_mod from '../utils/commonUtils';

export default class MainMenuButton extends React.Component<any, any>{
    render(){
        var mod = null;

        var cn = bem_mod('main-menu', 'button', this.props.mods, this.props.className);


        // if (typeof this.props.mod === 'string')
        //     mod = "main-menu__button_" + this.props.mod;
        // // var cn = cx("main-menu__button", mod, this.props.className);
        //
        // var cn = cx("main-menu__button", mod, this.props.className);

        return (
            <div className={cn} id={this.props.id} data-mode-target={this.props.blade} onClick={this.props.onClick}>
                <div className="main-menu__icon"><i/></div>
                <span className="main-menu__button-caption">{this.props.children}</span>
            </div>
        )
    }
}
