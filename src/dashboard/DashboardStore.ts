import {CarbonStore, dispatch, handles} from "../CarbonFlux";
import Immutable from "immutable";

import DashboardActions from "./DashboardActions";
import { DashboardProxy } from "carbon-api";

class DashboardStore extends CarbonStore<any> {
    getInitialState(){
        return Immutable.fromJS({
            projectList: [],
            activeFolderId: "my",
            folders: [
                {
                    id: "my",
                    projects: []
                },
                {
                    id: "shared",
                    projects: []
                },
                {
                    id: "deleted",
                    projects: []
                }
            ]
        });
    }

    @handles(DashboardActions.refresh)
    onRefreshed({data}){
        this.state = this.state.set('folders', []).mergeDeep(data);
        //dispatch(DashboardActions.changeFolder("my"));
        this.refreshProjectList(this.state.get("activeFolderId"));
    }

    @handles(DashboardActions.deleteProject)
    onDeleteProject({projectId, companyId}){
        DashboardProxy.deleteProject(companyId, projectId)
            .then(()=>DashboardProxy.dashboard(companyId))
            .then(data => dispatch(DashboardActions.refresh(data)));
    }

    @handles(DashboardActions.changeFolder)
    onFolderChanged({folderId}){
        this.refreshProjectList(folderId);
    }

    refreshProjectList(folderId) {
        var folder = this.state.get("folders").find(x => x.get("id") === folderId);
        this.state = this.state.set("activeFolderId", folderId);
        this.state = this.state.set("projectList", folder.get("projects"));
    }
}

export default new DashboardStore();