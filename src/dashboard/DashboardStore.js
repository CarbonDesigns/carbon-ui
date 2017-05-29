import {CarbonStore, dispatch, handles} from "../CarbonFlux";
import Immutable from "immutable";

import DashboardActions from "./DashboardActions";

class DashboardStore extends CarbonStore{
    getInitialState(){
        return Immutable.fromJS({
            projectList: [],
            folders: [
                {
                    id: "my",
                    projects: []
                },
                {
                    id: "shared",
                    projects: []
                }
            ]
        });
    }

    @handles(DashboardActions.refresh)
    onRefreshed({data}){
        this.state = this.state.mergeDeep(data);
        dispatch(DashboardActions.changeFolder("my"));
    }

    @handles(DashboardActions.changeFolder)
    onFolderChanged({folderId}){
        var folder = this.state.get("folders").find(x => x.get("id") === folderId);
        this.state = this.state.set("projectList", folder.get("projects"));
    }
}

export default new DashboardStore();