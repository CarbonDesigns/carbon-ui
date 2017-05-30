import React from "react";
import cx from 'classnames';
import DropButton from './DropButton';

export default class UserAvatarButton extends DropButton {
    _buttonExtension(/*ext_data*/) {
        var ext_data = this.props.extension_data;
        return <div id="user-avatar" style={{ backgroundImage: "url('" + ext_data.avatar_url+ "')"}}></div>;
        // <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style={{height: '100%', width: 'auto'}} />
    }
}
