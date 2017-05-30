import React from "react";
import { Component, dispatchAction } from "../CarbonFlux";
import { GuiButton, GuiButtonBlock } from "../shared/ui/GuiComponents";
import DialogRegistry from "../dialogs/DialogRegistry";
import Dialog from "../dialogs/Dialog";
import { FormattedMessage } from "react-intl";
import { app, backend, IDisposable } from "carbon-core";
import { ConnectionState } from "carbon-api";
import {default as TabContainer, TabTabs, TabHeader, TabPage, TabArea} from "../shared/TabContainer";
import {Markup, MarkupLine, MarkupSubmit}  from "../shared/ui/Markup";
import Search from "../shared/Search";
import bem from '../utils/commonUtils';
import {richApp} from "../RichApp.js";

class ResourceTile extends Component<any, any> {
    // selectResource=()=>{
    // };

    render() {
        const resource = this.props.resource;
        // var imgStyle = {backgroundImage: "url('" + this.props.img + "')"};
        var imgStyle = {backgroundImage: "url('" + "/target/1/image.png" + "')"};
        {/*<ResourceTile
         key={resource.id + 'ind'}
         name={resource.name}
         img={resource.imageUrl}
         data={resource}
         />*/}
        return (
            <div
                className="resource-tile"
                onClick={this.props.onClick}
                key={'key' + resource.id}
            >

                <div className="resource-tile__image" style={imgStyle}/>

                <div className="resource-tile__meta">
                    <div className="resource-tile__name">
                        <span>{/*this.props.name*/ "ААААААААААААААА"}</span>
                    </div>

                    {/*<p className="resource-tile__description"> Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl. </p> */}

                    <div className="resource-tile__tags">
                        <span className="resource-tile__tag"><span className="resource-tile__tag-title">Lorem ipsum 1</span></span>
                        <span className="resource-tile__tag"><span className="resource-tile__tag-title">Lorem ipsum 2</span></span>
                    </div>

                    <div className="resource-tile__bottom">
                        <span className="resource-tile__author">
                            <span className="resource-tile__author-avatar" style={{backgroundImage: `url('/target/1/image.png')`}}/>
                            <span className="resource-tile__author-name">Karlos Paculicasec-Bzinksky</span>
                        </span>

                        <span className="resource-tile__indicators">
                            <span className="resource__downloads">
                                <span className="resource__downloads-icon"><i className="ico--download"/></span>
                                <span className="resource__downloads-number">1234</span>
                            </span>
                            {/* <span className="resource__rating"> <span className="resource__rating-icon"><i className=""></i></span> <span className="resource__rating-number">4.5</span> </span>*/}
                        </span>
                    </div>

                </div>
            </div>
        );
    }
}





export default class ImportResourceDialog extends Dialog<any, any>{
    _connectionToken: IDisposable;

    constructor(props) {
        super(props);
        this.state = {
            detailsOpen : false,
            loading     : false,
        };
        //
        // this._debounceSearch = util.debounce((search)=>{
        //     ShareProxy.resources(search).then((data)=> {
        //         data.loading = false;
        //         this.setState(data);
        //     })
        // }, 400);
    }

    private resume = () => {
        backend.startConnection();
    };

    _toggleDetails = () => {
        console.log('switching');
        this.setState({detailsOpen : !this.state.detailsOpen})
    };

    _importPage = ()=> {
        fetch(this.props.dataUrl).then(response=>response.json()).then(data=>{
            //TODO: fix
            //var page = app.importPage(data);
            //richApp.dispatch(StencilsActions.changePage(page));
            this.context.bladeContainer.close(0);
        });
    }

    componentDidMount(){
        super.componentDidMount();

        this._connectionToken = backend.connectionStateChanged.bind(this, this.onConnectionStateChanged);
    }

    componentWillUnmount(){
        super.componentWillUnmount();
        if (this._connectionToken){
            this._connectionToken.dispose();
        }
    }

    private onConnectionStateChanged(newState: ConnectionState){
        if (newState.type === "connected"){
            dispatchAction({type: "Dialog_Hide"});
        }
    }

    //
    _renderTiles(data){
        if (this.state.loading && data && data.length == 0){
            return <FormattedMessage tagName="p" id="data.loading" defaultMessage="Loading..."/>
        }
        else if(!data.length){
            return <FormattedMessage tagName="p" id="list.empty" defaultMessage="No items found"/>
        }
        else {
            return <div className="tile-container">
                {data.map( (resource,ind)=><ResourceTile
                    key={resource.id}
                    resource={resource}
                    onClick={this._toggleDetails}
                /> )}
            </div>
        }

    }
    // _onSearch=(e)=>{
    //     var searchString = e.target.value;
    //     this.setState({loading:true, searchString:searchString});
    //     this._debounceSearch(searchString);
    // };
    //

    // _renderList() {
    //     return
    // }


    _renderDetails(details){

        // const dataUrl = "url('" + this.state.dataUrl + "')";
        const dataUrl = 'url("/target/1/image.png")';

        return <div className="resource-import-details">

            <MarkupLine>
                <figure>
                    <div className="resource-import-details__gallery">
                        <div className="resource-import-details__slides">
                            {/* todo    If slide is active =>  .resource-import-details__slide_active  */}
                            <div className="resource-import-details__slide  resource-import-details__slide_active ">
                                <img ref="preview" src={'/target/1/image.png'} className="resource-import-details__preview-img"/>
                            </div>
                            {/*<div className="resource-import-details__slide" style={{backgroundImage: `url('${details.imageUrl}')`, }}> */}
                            <div className="resource-import-details__slide" style={{backgroundImage: `url('${details.imageUrl}')`, }}>
                                <img ref="preview" src={'/target/2/image.png'} className="resource-import-details__preview-img"/>
                            </div>
                        </div>

                        {/* todo    If thumbs.length >= 1*/}
                        <div className="resource-import-details__thumbs">
                            {/* todo    If thumb  is active =>  .resource-import-details__thumb_active  */}
                            <div className="resource-import-details__thumb  resource-import-details__thumb_active"  style={{backgroundImage: `url('${details.imageUrl}')`}} />
                            <div className="resource-import-details__thumb" style={{backgroundImage: `url('/target/1/image.png')`}} />
                            <div className="resource-import-details__thumb" style={{backgroundImage: `url('/target/2/image.png')`}} />
                        </div>
                    </div>
                </figure>
            </MarkupLine>

            <MarkupLine>
                {/*<div className="markup-heading markup-heading_faded "><FormattedMessage id="sharepage.name" defaultMessage="Name"/></div>*/}
                <div className="resource-import-details__name">{"That's name"}</div>
            </MarkupLine>

            <MarkupLine>
                {/*<div className="markup-heading markup-heading_faded ">*/}
                    {/*<FormattedMessage id="=TRANSLATEME!!!" defaultMessage="Description"/>*/}
                {/*</div>*/}
                <p>{ details.description || "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl."}</p>
            </MarkupLine>

            <MarkupLine>
                {/*<label className="gui-input">*/}
                {/*<div className="markup-heading markup-heading_faded "><FormattedMessage id="sharepage.tags" defaultMessage="Tags"/></div>*/}
                <p className="resource-import-details__tags">
                    { details.tags  &&  <span className="resource-import-details__tag"><span className="resource-import-details__tag-title">{ details.tags }</span></span> }
                    <span className="resource-import-details__tag"><span className="resource-import-details__tag-title">Lorem ipsum 1</span></span>
                    <span className="resource-import-details__tag"><span className="resource-import-details__tag-title">Lorem ipsum 2</span></span>
                </p>
                {/*</label>*/}
            </MarkupLine>

            <MarkupLine>
                <div className="markup-heading markup-heading_faded "><FormattedMessage id="TRANSLATEME!!!" defaultMessage="Author"/></div>
                <div className="resource-import-details__author">
                    <div className="resource-import-details__author-avatar" style={{backgroundImage: `url('${ details.authorAvatarUrl || "/target/1/image.png" }')`}}/>
                    <span className="resource-import-details__author-name">{details.authorName || "Boris"}</span>
                </div>
            </MarkupLine>

            <MarkupSubmit>
                <GuiButtonBlock>
                    <GuiButton mods="submit" onClick={this._toggleDetails} caption="TRANSLATEME!!!" defaultMessage="Import resource" />
                    <GuiButton mods="hover-cancel" onClick={this._toggleDetails} caption="TRANSLATEME!!!" defaultMessage="Cancel import" />
                </GuiButtonBlock>
            </MarkupSubmit>
        </div>
    }

    onClose(){
        console.log('closed')
    }

    renderHeader(){
        return <FormattedMessage defaultMessage="Import resource" id="translateme" tagName="h2"/>;
    }

    renderBody(){
        const selectedResource = {};

        return <div className={bem("import-resource-dialog", null, {"details-open" : this.state.detailsOpen}  )}>
            <div className="import-resource-dialog__panel  import-resource-dialog__panel_list">
                <TabContainer type="normal" className="resources-list">
                    <TabTabs
                        items={[
                            <FormattedMessage  tagName="h5" id="translateme!" defaultMessage="Built-in"/>,
                            <FormattedMessage  tagName="h5" id="translateme!" defaultMessage="Public"/>,
                            <FormattedMessage  tagName="h5" id="translateme!" defaultMessage="My"/>,
                            <i className="ico--search"/>,
                        ]}
                    />
                    <TabArea className="gui-pages">
                        <TabPage className="gui-page" tabId="1">
                            {/*{this._renderTiles(this.state.staticResources)}*/}
                            {this._renderTiles([
                                {id: '1', name: 'aaaaaaaaaa  aaaaaaaa'},
                                {id: '3', name: 'c  ccccccc'},
                                {id: '4', name: 's fsda cccc'},
                                {id: '5', name: 'asdfsd dsf asd '},
                                {id: '2', name: 'bbbbbbbbb bbbbbbb'}
                            ])}
                        </TabPage>
                        <TabPage className="gui-page" tabId="2">
                            {/*{this._renderTiles(this.state.publicResources)}*/}
                        </TabPage>
                        <TabPage className="gui-page" tabId="3">
                            {/*{this._renderTiles(this.state.myResources)}*/}
                        </TabPage>

                        <TabPage className="gui-page" tabId="4">
                            <div className="resources-list__search">
                                <Search onQuery={console.log} placeholder={"Search..."} ref="search"/>
                            </div>
                        </TabPage>
                    </TabArea>

                </TabContainer>
            </div>


            <div className="import-resource-dialog__panel  import-resource-dialog__panel_details">
                {this._renderDetails(selectedResource)}
            </div>
        </div>
    }
}

DialogRegistry.register("ImportResourceDialog", ImportResourceDialog);