import React from "react";
import cx from 'classnames';
import NotReady from "../../../shared/NotReady";
import {BladeBody}  from "../BladePage";

export default class ShareEmailBlade extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<BladeBody>
            <NotReady feature="shareByEmail"/>
        </BladeBody>
            /*  <div className="form__group">
             <div className="form__line">
             <label className="gui-input">
             <p>Recepient address</p>
             <input placeholder="viewer@example.com" type="text"/>
             </label>
             </div>
             <div className="form__line">
             <label className="gui-textarea">
             <p>Message text</p>
             <textarea style={{width: 211, height: 191}}></textarea>
             </label>
             </div>
             <div className="form__line">
             <label className="gui-check">
             <input type="checkbox"/>
             <i></i>
             <span>include qr-code</span>
             </label>
             </div>
             </div>
             <div className="form__group">
             <div className="form__line">
             <div className="gui-btn_submit">
             <i></i>
             <b>Send mail</b>
             </div>
             </div>
             </div>*/
        )
    }
}
