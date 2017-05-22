import React from "react";
import cx from 'classnames';
import {app} from '../../../RichApp'
import {BladeBody}  from "../BladePage";
import NotReady from "../../../shared/NotReady";

export default class PngExportBlade extends React.Component {
    constructor(props) {
        super(props);
    }

    handleChangeAll = (event)=> {
        if (event.target.checked) {
            app.appActions.blade2Tab(undefined);
        } else {
            app.appActions.blade2Tab(1);
        }
    }

    handleChangeSpecific = (event)=> {
        if (!event.target.checked) {
            app.appActions.blade2Tab(undefined);
        } else {
            app.appActions.blade2Tab(1);
        }
    }

    render() {
        return ( <BladeBody> <NotReady className="NotReady" feature="pngExport"/> </BladeBody>
            /* <div className="form__group">
             <div className="form__heading">
             <div className="cap">Include</div>
             </div>
             <div className="form__line">
             <label className="gui-check">
             <input type="checkbox" />
             <i />
             <span>comments</span>
             </label>
             </div>
             <div className="form__line">
             <label className="gui-check">
             <input type="checkbox" />
             <i />
             <span>link interactive areas</span>
             </label>
             </div>
             </div>
             <div className="form__group">
             <div className="form__heading">
             <div className="cap">Pages</div>
             </div>
             <div className="form__line">
             <label className="gui-radio gui-radio_line">
             <input type="radio" name="pages" defaultChecked onChange={this.handleChangeAll}/>
             <i />
             <span>All</span>
             </label>
             </div>
             <div className="form__line">
             <label className="gui-radio gui-radio_line">
             <input type="radio" name="pages" onChange={this.handleChangeSpecific} />
             <i />
             <span>Select specific pages</span>
             </label>
             </div>
             </div>
             <div className="form__group">
             <div className="form__line">
             <div className="gui-btn_submit">
             <b>Download file</b>
             </div>
             </div>
             </div>*/
        )
    }
}
