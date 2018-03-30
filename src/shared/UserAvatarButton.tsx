import * as React from "react";
import * as cx from "classnames";
import DropButton from './DropButton';
import {Avatar} from "../shared/Avatar";
import { backend } from "carbon-api";

export default class UserAvatarButton extends DropButton {
    _buttonExtension(/*ext_data*/) {
        var ext_data = this.props.extension_data;
        return <div id="user-avatar"><Avatar userName={backend.getUserName()} url={backend.getUserAvatar()} width={this.props.width||36} height={this.props.height||36}/></div>;
    }
}
