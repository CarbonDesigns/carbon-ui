import React from "react";
import SpriteView from "./SpriteView";
import Dropdown from "../../shared/Dropdown";
import Navigateable from "../../shared/Navigateable";
import { Component, listenTo, Dispatcher, dispatchAction } from "../../CarbonFlux";
import {richApp} from "../../RichApp";
import AppActions from '../../RichAppActions';
import {FormattedMessage} from "react-intl";
import { ToolboxConfiguration, app, NullPage, IPage, IDisposable } from "carbon-core";
import Toolbox from "../Toolbox";
import {GuiButton} from "../../shared/ui/GuiComponents";
import bem from '../../utils/commonUtils';
import { PageSelect } from "../../shared/ui/GuiSelect";
import { StencilsAction } from "./StencilsActions";
import { CarbonAction } from "../../CarbonActions";

require("../../import/ImportResourceDialog");

interface IStandardStencilsState{
    dirtyConfig: boolean;
    changedId: string;
    config: any;
    currentPage: IPage;
}

export default class StandardStencils extends Component<any, IStandardStencilsState> {
    private dirtyConfigToken: IDisposable;
    refs: any;

    constructor(props) {
        super(props);
        this.state = {
            currentPage: null,
            dirtyConfig: false,
            changedId: null,
            config: null
        };
    }

    canHandleActions() {
        return true;
    }
    onAction(action: StencilsAction | CarbonAction) {
        switch (action.type) {
            case "Stencils_ChangePage":
                this.loadConfig(action.page);
                return;
            case "Carbon_AppLoaded":
                let page = this.currentSymbolsPage();
                if (page) {
                    this.loadConfig(page);
                }
                return;
        }
    }

    private onPageSelected = (page) => {
        dispatchAction({type: "Stencils_ChangePage", page});
    };

    private onConfigDirty(forceUpdate, changedId) {
        if (forceUpdate) {
            this.refreshLibrary();
        } else {
            this.setState({dirtyConfig: true, changedId:changedId});
        }
    }

    private onAddMore = ()=> {
        dispatchAction({type: "Dialog_Show", dialogType: "ImportResourceDialog"});
    }

    private refreshLibrary = ()=> {
        ToolboxConfiguration.buildToolboxConfig(this.state.currentPage).then(config=> {
            this.setState({dirtyConfig: false, config: config, changedId:null});
        });
    }

    private loadConfig(page) {
        if (this.dirtyConfigToken) {
            this.dirtyConfigToken.dispose();
        }
        this.dirtyConfigToken = page.toolboxConfigIsDirty.bind(this, this.onConfigDirty);

        if (!page.props.toolboxConfigId) {
            ToolboxConfiguration.buildToolboxConfig(page).then(config=> {
                this.setState({dirtyConfig: false, config: config, changedId:null});
            });
        } else {
            ToolboxConfiguration.getConfigForPage(page)
                .then(config=> {
                    this.setState({config});
                })
        }
    }

    private currentSymbolsPage(page?: IPage) {
        if (arguments.length === 1) {
            app.setUserSetting("symbolsPageId", page.id());
            return page;
        }

        let pageId = app.getUserSetting("symbolsPageId", null);
        if (!pageId) {
            return null;
        }

        let pages = app.pagesWithSymbols();
        return pages.find(x => x.id() === pageId);
    }

    private renderPageItem = (page: IPage) => {        ;
        //TODO: add possibility to add page icons?
        return <p key={page.id()}>
            <i className="ico inline-ico ico-stencil-set" />
            <span>{page.name()}</span>
        </p>
    }

    private renderRefresher() {
        var visible = this.state.dirtyConfig;
        var cn = bem("stencils-refresher", null, {hidden: !visible});
        return <div className={cn} onClick={visible ? this.refreshLibrary : null}>
            <GuiButton onClick={visible ? this.refreshLibrary : null}
                       mods={['small', 'hover-white']}
                       icon="refresh"
                       caption="refresh.toolbox"
                       defaultMessage="Refresh"/>
        </div>
    }

    render() {
        if (!this.state.config) {
            return <div></div>
        }

        var page = this.state.currentPage;
        var config = this.state.config;

        return <div>
            <div className={bem("library-page", "header", "with-dropdown")}>
                <PageSelect className={bem("stencils-page", "select")} selectedItem={page} onSelect={this.onPageSelected}
                    items={app.pagesWithSymbols()}
                    renderItem={this.renderPageItem}
                    renderCustomItems={() => [
                        <p key="add_more" onClick={this.onAddMore}>
                            <i className="ico inline-ico ico-stencil-set"/>
                            <FormattedMessage id="@add.more"/>
                        </p>
                    ]}/>
            </div>
            <Navigateable className={bem("library-page", "content")}
                          config={config.groups}
                          getCategoryNode={c => this.refs.spriteView.getCategoryNode(c)}>
                {this.renderRefresher()}
                <SpriteView config={config} changedId={this.state.changedId} sourceId={this.state.currentPage.id()} ref="spriteView"/>
            </Navigateable>
        </div>
    }
}
