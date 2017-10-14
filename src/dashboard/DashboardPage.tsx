import React from "react";
import PropTypes from "prop-types";
import {dispatch, listenTo, Component} from "../CarbonFlux";

import {backend} from "carbon-api";
import FolderTree from "./FolderTree";
import ProjectList from "./ProjectList";
import TopMenu from "../shared/TopMenu";

import DashboardStore from "./DashboardStore";
import DashboardActions from "./DashboardActions";
import { SideMenuContainer, ContentPage } from "../shared/SideMenuContainer";

export default class DashboardPage extends Component<any, any>{
    static childContextTypes  = {
        companyId: PropTypes.string,
        intl: PropTypes.object
    }

    constructor(props:any, context?:any) {
        super(props, context);
        this.state = {folders: [], activeFolderId:DashboardStore.state.get("activeFolderId")};
    }

    @listenTo(DashboardStore)
    _onDashboardStoreChanged(){
        this.setState({folders: DashboardStore.state.get("folders"), activeFolderId:DashboardStore.state.get("activeFolderId")});
    }

    _onActiveFolderChanged = (folderId) => {
        dispatch(DashboardActions.changeFolder(folderId));
    };

    getChildContext() {
        return Object.assign({}, this.context, {companyId: this.state.companyId});
    }

    private static _getFolderLabel(folder){
        switch(folder.get("id")){
            case "my":
                return "@folders.my";
            case "shared":
                return "@folders.shared";
            case "deleted":
                return "@folders.deleted";
            default:
                return folder.get("name");
        }
    }

    render(){

        return <div className="dashboard-page light-page">
            <SideMenuContainer activePageId={this.state.activeFolderId} onActiveChanged={this._onActiveFolderChanged}>
                {this.state.folders.map(folder=><ContentPage id={folder.get("id")} key={folder.get("id")} label={DashboardPage._getFolderLabel(folder)}>
                        <ProjectList key={"list"+folder.get("id")} />
                    </ContentPage>)}
            </SideMenuContainer>
        </div>;
    }

    _resolveCompanyId(){
        if (this.props.location.state && this.props.location.state.companyId){
            return Promise.resolve({companyId: this.props.location.state.companyId});
        }
        if (this.props.params.companyName && this.props.params.companyName !== "guest"){
            return backend.accountProxy.resolveCompanyId(this.props.params.companyName);
        }
        return Promise.resolve({companyId: backend.getUserId()});
    }

    componentDidMount(){
        super.componentDidMount();
        this._resolveCompanyId()
            .then(data => {
                this.setState({companyId:data.companyId});
                return backend.dashboardProxy.dashboard(data.companyId)
            })
            .then(data => dispatch(DashboardActions.refresh(data)));
    }
}