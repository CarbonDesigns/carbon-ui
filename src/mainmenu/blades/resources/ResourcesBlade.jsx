import React                                          from "react";
import {app, backend, ShareProxy, util} from "carbon-core";
import {Component}                                    from "../../../CarbonFlux";
import cx                                             from 'classnames';
import {FormattedMessage}                             from "react-intl";
import PublishBlade                                   from "./PublishPageBlade";
import ImportPageBlade                                from "./ImportPageBlade";
import {GuiButton}                                    from "../../../shared/ui/GuiComponents";
import ScrollContainer        from "../../../shared/ScrollContainer";

import {Markup, MarkupLine}  from "../../../shared/ui/Markup";
import Search from "../../../shared/Search";

import {BladeBody}  from "../BladePage";
import {default as TabContainer, TabTabs, TabHeader, TabPage, TabArea} from "../../../shared/TabContainer";

import {default as EditableList, ListItem} from "../../../shared/EditableList";
import SimpleList from "../../../shared/SimpleList";
import bem from '../../../utils/commonUtils';
import { dispatch, dispatchAction } from "../../../CarbonFlux";

import ImportResourceDialog from "../../../workspace/ImportResourceDialog";



class PagesForExportList extends Component {

    render() {

        const items = app.pages.map((page, ind)=>{ return {
                id      : page.id(),
                content : <p className={bem("publish", "pages-list-item", {selected: ind===0})}>{page.name()}</p>
            }
        });

        const simpleListProps = {
            // className      : bem_stories_panel('list-container'),
            // boxClassName   : bem_stories_panel('list'),
            padding        : false,
            insideFlyout   : false,
            emptyMessage   : <FormattedMessage defaultMessage="No pages in project" id="translate me!"/>,
            items          : items,
            onClick        : console.log //fixme выбирает страницу, открывает новый блейд
        };


        return (
            <ScrollContainer
                className={"wrap thin"}
                boxClassName={bem("publish", "pages-list")}
                insideFlyout={false}
            >
                <SimpleList {...simpleListProps}/>
            </ScrollContainer>
        )
    }
}

class ResourceTile extends Component {
    selectPage=()=>{
        this.props.bladeContainer.close(this.props.currentBladeId+1);
        this.props.bladeContainer.addChildBlade("import_blade", ImportPageBlade, "caption.importpageblade", this.props.data);
    };

    render() {
        var imgStyle = {backgroundImage: "url('" + this.props.img + "')"};

        return (
            <div className="resource-tile" onClick={this.selectPage} key={this.props.key}>
                <div className="resource-tile__image" style={imgStyle}></div>

                <div className="resource-tile__meta">

                    <div className="resource-tile__name"><span>{this.props.name}</span></div>


                    {/*<p className="resource-tile__description">
                        Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl.
                    </p> */}

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
                            {/*
                            <span className="resource__rating">
                                <span className="resource__rating-icon"> <i className=""></i></span>
                                <span className="resource__rating-number">4.5</span>
                            </span>a*/}
                        </span>
                    </div>

                </div>

            </div>
        );
    }
}

export default class ResourcesBlade extends Component {

    constructor() {
        super();
        this.state = {
            name            : "",
            description     : "",
            public          : false,
            myResources     : [],
            publicResources : [],
            staticResources : [],
            searchString    : '',
            loading         : true
        };

        this._debounceSearch = util.debounce((search)=>{
            ShareProxy.resources(search).then((data)=> {
                data.loading = false;
                this.setState(data);
            })
        }, 400);
    }

    _publishCompleted=(isPublic, page)=>{
        var items;
        if(isPublic){
            items = this.state.publicResources.slice();
            items.splice(0,0, page);
            this.setState({publicResources:items});
        } else {
            items = this.state.myResources.slice();
            items.splice(0,0, page);
            this.setState({myResources:items});
        }
        this.context.bladeContainer.close(this._childBlade);
    }

    _publishPage = ()=> {
        this.context.bladeContainer.close(this.context.currentBladeId+1);
        this._childBlade = this.context.bladeContainer.addChildBlade("blade_publish-page", PublishBlade, "caption.publishpage", {completed:this._publishCompleted})
    }

    _refreshLists(){
        this.setState({loading:true});
        ShareProxy.staticResources().then(data=>{
            this.setState({staticResources:data});
        })
        ShareProxy.resources("").then((data)=> {
            data.loading = false;
            this.setState(data);
        })
    }

    _onSearch=(e)=>{
        var searchString = e.target.value;
        this.setState({loading:true, searchString:searchString});
        this._debounceSearch(searchString);
    };

    componentDidMount() {
        super.componentDidMount();
        this._refreshLists();
    }

    componentDidUpdate() {
        super.componentDidUpdate();
    }

    _renderTiles(data){
        if(this.state.loading && data.length == 0){ //fixme data.length == 0 - could be incorrect
            return <FormattedMessage tagName="p" id="data.loading" defaultMessage="Loading..."/>
        }
        if(!data.length){
            return <FormattedMessage tagName="p" id="list.empty" defaultMessage="No items found"/>
        }

        return <div className="tile-container">
            {data.map((r,ind)=><ResourceTile
                key={r.id + 'ind'} //fixme - remove later
                name={r.name}
                currentBladeId={this.context.currentBladeId}
                bladeContainer={this.context.bladeContainer}
                img={r.imageUrl}
                data={r}
            />)}
        </div>
    }

    _renderPublishButton(){
        if(this.props.importOnly){
            return;
        }

        return <MarkupLine>
            <GuiButton mods="submit"  onClick={this._publishPage} caption="btn.publishpage" defaultMessage="Publish my current page" icon={true} />
        </MarkupLine>
    }

    render() {

        // const placeHolderMessage = this.context.intl.formatMessage({id:"Search...", defaultMessage:"Search..."})
        const placeHolderMessage = "Search..."; //this.context.intl.formatMessage({id:"Search...", defaultMessage:"Search..."})

        return <BladeBody>

            <MarkupLine>
                <p>Select a page to share</p>
                <PagesForExportList/>

            </MarkupLine>

            <MarkupLine>
                <GuiButton onClick={ ()=>{dispatchAction({type: "Dialog_Show", dialogType: "ImportResourceDialog"}) }} caption="btn.publishpage" defaultMessage="TTTT" />
            </MarkupLine>


            <MarkupLine>
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
                            {/*<div className="markup-heading markup-heading_faded "><FormattedMessage tagName="h3" id="resources.public"/></div>*/}
                            {this._renderTiles(this.state.staticResources)}
                        </TabPage>
                        <TabPage className="gui-page" tabId="2">
                            {/*<div className="markup-heading markup-heading_faded "><FormattedMessage tagName="h3" id="resources.static"/></div>*/}
                            {this._renderTiles(this.state.publicResources)}
                        </TabPage>
                        <TabPage className="gui-page" tabId="3">
                            {/*<div className="markup-heading markup-heading_faded "><FormattedMessage tagName="h3" id="resources.my"/></div>*/}
                            {this._renderTiles(this.state.myResources)}
                        </TabPage>

                        <TabPage className="gui-page" tabId="4">
                            <div className="resources-list__search">
                                <Search onQuery={this._onSearch} placeholder={placeHolderMessage} ref="search"/>
                                {/*<label className="gui-input">*/}
                                    {/*<input type="text" value={this.state.searchString} onChange={this._onSearch} placeholder="Search..."/>*/}
                                {/*</label>*/}
                            </div>

                            { false && (this.props.importOnly ? null :
                                <MarkupLine>
                                    <GuiButton mods="submit"  onClick={this._publishPage} caption="btn.publishpage" defaultMessage="Publish my current page" icon={true} />
                                </MarkupLine>)
                            }

                            {this._renderTiles(this.state.staticResources)}
                        </TabPage>
                    </TabArea>

                </TabContainer>
            </MarkupLine>


        </BladeBody>
    }
}

ResourcesBlade.contextTypes = {bladeContainer: React.PropTypes.any, currentBladeId:React.PropTypes.number};
