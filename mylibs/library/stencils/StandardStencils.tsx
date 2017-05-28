import React from "react";
import SpriteView from "./SpriteView";
import Dropdown from "../../shared/Dropdown";
import Navigateable from "../../shared/Navigateable";
import {Component, listenTo, Dispatcher} from "../../CarbonFlux";
import {richApp} from "../../RichApp";
import AppActions from '../../RichAppActions';
import {FormattedMessage} from "react-intl";
import StencilsActions from "./StencilsActions";
import { ToolboxConfiguration, app, NullPage, IPage } from "carbon-core";
import Toolbox from "../Toolbox";
import {GuiButton} from "../../shared/ui/GuiComponents";
import bem from '../../utils/commonUtils';

interface IStandardStencilsState{
    currentPage: IPage;
    pages: IPage[];
    dirtyConfig: boolean;
    changedId: string;
    config: any;
}

export default class StandardStencils extends Component<any, IStandardStencilsState> {
    [name: string]: any;
    refs: any;

    constructor(props) {
        super(props);
        this._cache = {};
        this.state = {
            currentPage: null,
            pages: [],
            dirtyConfig: false,
            changedId: null,
            config: null
        };
    }

    @listenTo(Toolbox)
    onChange() {
        var page = Toolbox.state.currentPage;
        if (page && (!this.state.config || page !== this.state.currentPage) && page.id()) {
            this.loadConfig(page);
        }

        this.setState({currentPage: page, pages: Toolbox.state.pages});
    }

    changePage = (i) => {
        this._cache = {};
        var page = this.state.pages[i];
        richApp.dispatch(StencilsActions.changePage(page));
    };

    _onConfigDirty(forceUpdate, changedId) {
        if (forceUpdate) {
            this._refreshLibrary();
        } else {
            this.setState({dirtyConfig: true, changedId:changedId});
        }
    }

    loadConfig(page) {
        if (this._dirtyConfigToken) {
            this._dirtyConfigToken.dispose();
        }
        this._dirtyConfigToken = page.toolboxConfigIsDirty.bind(this, this._onConfigDirty);

        if (page.props.toolboxConfigId == null) {
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

    componentDidMount() {
        super.componentDidMount();
    }

    _renderPageItem(page) {
        var name = page.name();
        if (name.startsWith('Web ')) {
            var className = "ico inline-ico ico-stencil-set ico-stencil-set_web";
        } else if (name.startsWith('iOS ')) {
            className = "ico inline-ico ico-stencil-set ico-stencil-set_iphone";
        } else if (name.startsWith('Android ')) {
            className = "ico inline-ico ico-stencil-set ico-stencil-set_android";
        } else if (name.startsWith('Windows ')) {
            className = "ico inline-ico ico-stencil-set ico-stencil-set_windows";
        } else {
            className = "ico inline-ico ico-stencil-set ico-stencil-set_sketch";
        }
        return <p key={page.id()}>
            <i className={className}/>
            <span>{name}</span>
        </p>
    }

    _refreshLibrary = ()=> {
        ToolboxConfiguration.buildToolboxConfig( this.state.currentPage).then(config=> {
            this.setState({dirtyConfig: false, config: config, changedId:null});
        });
    }

    _renderRefresher() {
        var visible = this.state.dirtyConfig;
        var cn = bem("stencils-refresher", null, {hidden: !visible});
        return <div className={cn} onClick={visible ? this._refreshLibrary : null}>
            <GuiButton onClick={visible ? this._refreshLibrary : null}
                       mods={['small', 'hover-white']}
                       icon="refresh"
                       caption="refresh.toolbox"
                       defaultMessage="Refresh"/>
        </div>
    }

    _showResourcesBlade = ()=> {
        Dispatcher.dispatch({type: "Dialog_Show", dialogType: "ImportResourceDialog"});
    }

    render() {
        var item = this.state.pages.indexOf(this.state.currentPage);
        if (item < 0) {
            item = 0;
        }

        if (!this.state.config) {
            return <div></div>
        }

        var config = this.state.config;

        return <div>
            <div className={bem("library-page", "header", "with-dropdown")}>
                <Dropdown selectedItem={item} onSelect={this.changePage}>
                    {this.state.pages.map(p=>this._renderPageItem(p))}
                    <p key="add_more" onClick={this._showResourcesBlade}>
                        <i className="ico inline-ico ico-stencil-set"/>
                        <FormattedMessage id="@add.more"/>
                    </p>
                </Dropdown>
            </div>
            <Navigateable className={bem("library-page", "content")}
                          config={config.groups}
                          getCategoryNode={c => this.refs.spriteView.getCategoryNode(c)}>
                {this._renderRefresher()}
                <SpriteView config={config} changedId={this.state.changedId} sourceId={this.state.currentPage.id()} ref="spriteView"/>
            </Navigateable>
        </div>
    }
}
