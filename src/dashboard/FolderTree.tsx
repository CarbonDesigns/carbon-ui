import * as React from "react";
import {Link} from "react-router";
import {FormattedMessage} from "react-intl";
import { Component, listenTo, dispatch, CarbonLabel } from "../CarbonFlux";
import * as cx from "classnames";

import DashboardStore from "./DashboardStore";
import DashboardActions from "./DashboardActions";

export default class FolderTree extends Component<any, any>{
    constructor(props){
        super(props);
        this.state = {folders: [], activeFolderId:DashboardStore.state.get("activeFolderId")};
    }

    @listenTo(DashboardStore)
    _onChanged(){
        this.setState({folders: DashboardStore.state.get("folders"), activeFolderId:DashboardStore.state.get("activeFolderId")});
    }

    _folderClicked = e => {
        var folderId = e.currentTarget.dataset.folderId;
        dispatch(DashboardActions.changeFolder(folderId));
        e.preventDefault();
    };

    render(){
        return <div className="side-menu">
            {/* <Link to="/app"><span>Create new project</span></Link> */}
            {this.state.folders.map(x => {
                return <div key={x.get("id")}>
                    <a className={cx("side-menu_item", {"side-menu_item__active":(x.get("id") === this.state.activeFolderId)})} href="#" data-folder-id={x.get("id")} onClick={this._folderClicked}>
                        {this._renderFolderName(x)}
                    </a>
                </div>
            })}
        </div>
    }

    _renderFolderName(folder){
        switch(folder.get("id")){
            case "my":
                return <FormattedMessage id="folders.my" defaultMessage="My projects"/>;
            case "shared":
                return <FormattedMessage id="folders.shared" defaultMessage="Shared with me"/>;
            case "deleted":
                return <FormattedMessage id="folders.deleted" defaultMessage="Deleted"/>;
            default:
                return <span>{folder.get("name")}</span>;
        }
    }
}