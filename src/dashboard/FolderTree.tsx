import React from "react";
import {Link} from "react-router";
import {FormattedMessage} from "react-intl";
import {Component, listenTo, dispatch} from "../CarbonFlux";

import DashboardStore from "./DashboardStore";
import DashboardActions from "./DashboardActions";

export default class FolderTree extends Component<any, any>{
    constructor(props){
        super(props);
        this.state = {folders: []};
    }

    @listenTo(DashboardStore)
    _onChanged(){
        this.setState({folders: DashboardStore.state.get("folders")});
    }

    _folderClicked = e => {
        var folderId = e.currentTarget.dataset.folderId;
        dispatch(DashboardActions.changeFolder(folderId));
        e.preventDefault();
    };

    render(){
        return <div className="folders">
            <Link to="/app"><span>Create new project</span></Link>
            {this.state.folders.map(x => {
                return <div key={x.get("id")}>
                    <a href="#" data-folder-id={x.get("id")} onClick={this._folderClicked}>
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
            default:
                return <span>{folder.get("name")}</span>;
        }
    }
}