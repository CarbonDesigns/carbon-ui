import React from "react";
import SpriteView from "../stencils/SpriteView";
import Dropdown from "../../shared/Dropdown";
import Navigateable from "../../shared/Navigateable";
import { Component, listenTo, Dispatcher } from "../../CarbonFlux";
import { richApp } from "../../RichApp";
import AppActions from '../../RichAppActions';
import IconsActions from "./IconsActions";
import { FormattedMessage } from "react-intl";
// import StencilsActions from "./StencilsActions";
import { app, NullPage, IPage } from "carbon-core";
import InternalIconsStore from "./InternalIconsStore";
import { GuiButton } from "../../shared/ui/GuiComponents";
import bem from '../../utils/commonUtils';

interface IStandardStencilsState {
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
            dirtyConfig: false,
            changedId: null,
            config: null
        };
    }

    @listenTo(InternalIconsStore)
    onChange() {
        // var page = InternalIconsStore.state.currentPage;
        // if (page && (!this.state.config || page !== this.state.currentPage) && page.id()) {
        this.setState({ dirtyConfig: true });
        // }

        // this.setState({currentPage: page, pages: InternalIconsStore.state.pages});
    }

    _onConfigDirty(forceUpdate, changedId) {
        if (forceUpdate) {
            this._refreshLibrary();
        } else {
            this.setState({ dirtyConfig: true, changedId: changedId });
        }
    }

    loadConfig() {
        // if (this._dirtyConfigToken) {
        //     this._dirtyConfigToken.dispose();
        // }
        // TODO: bind to resourceChanged event to make config dirty
        //this._dirtyConfigToken = page.toolboxConfigIsDirty.bind(this, this._onConfigDirty);

        this.setState({ dirtyConfig: true });
        // if (!page.props.toolboxConfigId) {
        //     ToolboxConfiguration.buildToolboxConfig(page).then(config=> {
        //         this.setState({dirtyConfig: false, config: config, changedId:null});
        //     });
        // } else {

        //     ToolboxConfiguration.getConfigForPage(page)
        //         .then(config=> {
        //             this.setState({config});
        //         })
        // }
    }

    componentDidMount() {
        super.componentDidMount();
        this._refreshLibrary();
    }

    _renderPageItem(page) {
        var name = page.name();
        let className = "ico inline-ico ico-stencil-set ico-stencil-set_sketch";

        return <p key={page.id()}>
            <i className={className} />
            <span>{name}</span>
        </p>
    }

    _refreshLibrary = () => {
        InternalIconsStore.getIconsConfig().then(config => {
            this.setState({ dirtyConfig: false, config: config, changedId: null });
        })
    }

    _renderRefresher() {
        var visible = this.state.dirtyConfig;
        var cn = bem("stencils-refresher", null, { hidden: !visible });
        return <div className={cn} onClick={visible ? this._refreshLibrary : null}>
            <GuiButton onClick={visible ? this._refreshLibrary : null}
                mods={['small', 'hover-white']}
                icon="refresh"
                caption="refresh.toolbox"
                defaultMessage="Refresh" />
        </div>
    }

    _showResourcesBlade = () => {
        Dispatcher.dispatch(AppActions.showResourcesBlade({ importOnly: true }));
    }

    render() {
        var config = this.state.config || { groups: [] };

        return <div>
            <Navigateable className={bem("library-page", "content")}
                config={config.groups}
                getCategoryNode={c => this.refs.spriteView.getCategoryNode(c)}>
                {this._renderRefresher()}
                <SpriteView config={config} changedId={this.state.changedId} ref="spriteView" />
            </Navigateable>
        </div>
    }
}
