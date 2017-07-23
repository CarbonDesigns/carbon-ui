import React, { PropTypes } from "react";
import { FormattedMessage } from 'react-intl';
import { Link } from "react-router";

import { backend } from "carbon-api";
import { handles, Component, CarbonLabel } from "../CarbonFlux";
import FlyoutButton from "../shared/FlyoutButton";
import LoginPopup from "../account/LoginPopup";
import { AccountAction } from "../account/AccountActions";
import RouteComponent, { IRouteComponentProps } from "../RouteComponent";
import TopMenu from "../shared/TopMenu";
import bem from "../utils/commonUtils";

function SearchTag(props) {
    return <div className="search-tag" onClick={()=>props.host.setState({searchText:"tags:"+props.text})}>
        {props.text}
    </div>
}

function GalleryListItem (props) {
    var item = props.item;
    return <div className={bem("gallery-item")} onClick={()=>props.host.goToItem(item.id)}>
        <div className={bem("gallery-item", "downloads")}>{item.downloadCount}</div>
        <h2 className={bem("gallery-item", "name")}>{item.name}</h2>
        <h3 className={bem("gallery-item", "tags")}>{item.tags}</h3>
    </div>
}

interface CommunityLibraryPageState {
    searchText:string;
}

export default class CommunityLibraryPage extends RouteComponent<IRouteComponentProps, CommunityLibraryPageState>{
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);
        this.state = {searchText:""};
    }

    componentDidMount() {
        super.componentDidMount();
    }

    _onTextChange = (event)=> {
        this.setState({searchText:event.target.value});
    }

    goToItem(itemId) {

    }

    render() {
        return <div className="library-page">
            <TopMenu location={this.props.location} dark={true}/>

            <section className="libraryheader-container smooth-header section-center">
                <h1 className={bem("libraryheader-container", "h")}><CarbonLabel id="@library.header" /></h1>
            </section>

            <section className="searchlib-container section-center">
                <input value={this.state.searchText} onChange={this._onTextChange} className={bem("searchlib-container", "input")} type="text" placeholder={this.context.intl.formatMessage({id:"@search.placeholder"})}></input>
            </section>

            <section className="searchtags-container section-center">
                <SearchTag text="iOS" host={this}></SearchTag>
                <SearchTag text="icons" host={this}></SearchTag>
                <SearchTag text="android" host={this}></SearchTag>
                <SearchTag text="landing" host={this}></SearchTag>
            </section>

            <section className="gallery-list-container">
               <GalleryListItem item={{name:"Responsive website guidelines", tags:"ios android", downloadCount:1000}}/>
               <GalleryListItem item={{name:"Responsive guide"}}/>
               <GalleryListItem item={{name:"Responsive guide"}}/>
               <GalleryListItem item={{name:"Responsiadf adf;lak jdf;lka jdsf;lad jsf;ad fa;lkdjf a;dfve guide aaa a aa"}}/>
            </section>

            <section className="subscribe-container">
                <p className="subscribe-container__details"><CarbonLabel id="@subscribe.details" /></p>
                <form className="subscribe-form">
                    <input type="text"  className="subscribe-form__email" placeholder={this.context.intl.formatMessage({id:"@email.placeholder"})} />
                    <button className="subscribe-form__button"><CarbonLabel id="@subscribe" /></button>
                </form>
            </section>
        </div>;
    }
}