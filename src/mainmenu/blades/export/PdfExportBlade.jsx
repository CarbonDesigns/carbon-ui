import * as React from "react";
import * as cx from "classnames";
import {app} from '../../../RichApp'
import {BladeBody}  from "../BladePage";
import NotReady from "../../../shared/NotReady";

export default class PdfExportBlade extends React.Component {
    constructor(props) {
        super(props);
    }

    handleChangeAll = (event)=> {
        if (event.target.checked) {
            app.appActions.blade2Tab(undefined);
        } else {
            app.appActions.blade2Tab(1);
        }
    };

    handleChangeSpecific = (event)=> {
        if (!event.target.checked) {
            app.appActions.blade2Tab(undefined);
        } else {
            app.appActions.blade2Tab(1);
        }
    };

    render() {
        return <BladeBody><NotReady className="NotReady" feature="pdfExport"/></BladeBody>
        /*<div className="form__group">
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
         <input type="radio" name="all" ref="all" defaultChecked onChange={this.handleChangeAll} />
         <i />
         <span>All</span>
         </label>
         </div>
         <div className="form__line" data-mode-target="#blade2" data-turn-mode={1}>
         <label className="gui-radio gui-radio_line">
         <input type="radio" name="all" ref="specific" onChange={this.handleChangeSpecific}/>
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

    }
}
