import React from 'react';
import PropTypes from "prop-types";
import { app, backend } from "carbon-core";
import { richApp } from '../RichApp';
import { handles, ComponentWithImmutableState, Component, listenTo } from '../CarbonFlux';
import { FormattedMessage } from "react-intl"
import electronEndpoint from "electronEndpoint";

import MainMenuButton from './MainMenuButton';
import appStore from "../AppStore";

import PdfExportBlade from './blades/export/PdfExportBlade';
import PngExportBlade from './blades/export/PngExportBlade';
import HtmlExportBlade from './blades/export/HtmlExportBlade';
import ZipExportBlade from './blades/export/ZipExportBlade';

import PublishPageBlade from './blades/resources/PublishPageBlade';
import ShareLinkBlade from './blades/shareLink/ShareLinkBlade';
import ShareEmailBlade from './blades/shareEmail/ShareEmailBlade';
import MirroringBlade from './blades/mirroring/MirroringBlade';
import ProjectSettingsBlade from './blades/projectSettings/ProjectSettingsBlade';
import EditAvatarBlade from './blades/imageEdit/EditImageBlade';
import RecentProjectsBlade from './blades/recentProjects/RecentProjectsBlade';
// import SelectPagesBlade from './blades/selectPages/SelectPagesBlade';

import bem from 'bem';
import BladeContainer from "./blades/BladeContainer";
import { IRecentProject } from 'carbon-api';

function _heading(text) {
    return (<div className="main-menu__heading">
        <FormattedMessage tagName="h3" id={text} />
    </div>);
}

function _recentProject(project) {
    return (
        <section className="recent-project" key={project.url}>
            <div className="recent-project-avatar">
                <i style={{ backgroundImage: 'url("/i/images/42.png")' }} />
            </div>
            <p>{project.name}</p>
        </section>);
}

type BladeId = "project-settings" | "export-pdf" | "export-png" | "export-html" | "export-zip"
    | "share-link" | "mirroring" | "share-email" | "publish" | "project-avatar" | "recent-projects";

type MainMenuBladeState = {
    appName: string;
    appAvatar: string;
    recentProjects: IRecentProject[];
}

export default class MainMenuBlade extends Component<{}, MainMenuBladeState> {
    // context: {
    //     bladeContainer: BladeContainer
    // }

    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object,
        bladeContainer: BladeContainer
    }

    constructor(props) {
        super(props);
        this.state = {
            appName: appStore.state.appName,
            appAvatar: appStore.state.appAvatar,
            recentProjects: []
        }
    }

    componentDidMount() {
        super.componentDidMount();
        backend.accountProxy.recentProjects().then(data => {
            this.setState({ recentProjects: data.projects });
        })
    }

    @listenTo(appStore)
    onAppStoreChanged() {
        this.setState({
            appName: appStore.state.appName,
            appAvatar: appStore.state.appAvatar
        });
    }

    setBladePage(id, type, caption?) {
        this.context.bladeContainer.close(1);
        this.context.bladeContainer.addChildBlade(id, type, caption);
    }

    _resolveSetBladePage = (page: BladeId) => {
        switch (page) {
            case 'project-settings': return (() => this.setBladePage(`blade_${page}`, ProjectSettingsBlade, "@project.settings"));
            case 'export-pdf': return (() => this.setBladePage(`blade_${page}`, PdfExportBlade, "caption.export2pdf"));
            case 'export-png': return (() => this.setBladePage(`blade_${page}`, PngExportBlade, "caption.export2png"));
            case 'export-html': return (() => this.setBladePage(`blade_${page}`, HtmlExportBlade, "caption.export2html"));
            case 'export-zip': return (() => this.setBladePage(`blade_${page}`, ZipExportBlade, "caption.export2zip"));
            case 'share-link': return (() => this.setBladePage(`blade_${page}`, ShareLinkBlade, "caption.sharelink"));
            case 'mirroring': return (() => this.setBladePage(`blade_${page}`, MirroringBlade, "caption.mirroringblade"));
            case 'share-email': return (() => this.setBladePage(`blade_${page}`, ShareEmailBlade, "caption.sharebyemail"));
            case 'publish': return (() => this.setBladePage(`blade_${page}`, PublishPageBlade, "caption.publishpage"));
            case 'project-avatar': return (() => this.setBladePage(`blade_${page}`, EditAvatarBlade, "Edit proj avatar"));
            case 'recent-projects': return (() => this.setBladePage(`blade_${page}`, RecentProjectsBlade));
        }

        assertNever(page);
    };

    close() {
        this.context.bladeContainer.close(0);
    }

    _desktopSaveDialog() {
        electronEndpoint.saveFile({}, () => JSON.stringify(app.toJSON())).then(() => {
            this.close();
        });
    }

    _desktopOpenDialog() {
        electronEndpoint.openFile().then(data => {
            app.fromJSON(data);
            this.close();
        }).catch(err => console.error(err));
    }

    _goToRecentProject(project : IRecentProject) {
        return () => {
            this.close();
            this.context.router.push(
                {
                    pathname: '/app/' + project.projectId,
                    state: { companyId: project.companyId }
                }
            );
        }
    }

    _renderRecentList() {
        return this.state.recentProjects.map(p => {
            return <section className="main-menu__line" key={p.projectId}>
                <MainMenuButton onClick={this._goToRecentProject(p)} >
                    <span>{p.projectName}</span>
                </MainMenuButton>
            </section>
        })
    }

    _clickOnProjectSettings = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this._resolveSetBladePage("project-settings")();
    };

    _goToDashboard = () => {
        this.close();
        this.context.router.push({
            pathname: "/"
        });
    }

    _renderElectronMenu() {
        if (!app.isElectron()) {
            return null;
        }

        return <div className="main-menu__section" id="project-sharing">
            <section className="main-menu__line">
                <MainMenuButton id="main-menu__button_share-by-link" onClick={() => this._desktopOpenDialog()}>
                    <FormattedMessage id="@menu.openProject" defaultMessage="Open project..." />
                </MainMenuButton>
            </section>
            <section className="main-menu__line">
                <MainMenuButton id="main-menu__button_share-by-link" onClick={() => this._desktopSaveDialog()}>
                    <FormattedMessage id="@menu.saveProjectAs" defaultMessage="Save project..." />
                </MainMenuButton>
            </section>
        </div>
    }

    render() {
        return <div id="main-menu__content" className="main-menu">
            <div className="project-meta" onClick={this._clickOnProjectSettings}>
                <div className="project-meta__bg-avatar" style={{ backgroundImage: "url('" + this.state.appAvatar + "')" }}></div>
                <div className="project-meta__text-info">
                    <div className={bem("project-meta", "project-name", { 'big': this.state.appName.length > 20 })}>
                        <h2>{this.state.appName}</h2>
                    </div>
                    <div className="project-meta__device-info">
                        <FormattedMessage id="@project.comment" values={{ num: app.getAllArtboards().length }} />
                    </div>
                </div>
                <div className="project-meta__fg-avatar">
                    <figure style={{ backgroundImage: "url('" + this.state.appAvatar + "')" }} />
                    <div className="project-meta__edit-avatar-button"><i className="ico-big-pencil" /></div>
                </div>
            </div>

            {this._renderElectronMenu()}

            <div className="main-menu__section" id="project-dashboard">
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_dashboard" onClick={this._goToDashboard}>
                        <FormattedMessage id="menu.dashboard" defaultMessage="Dashboard" />
                    </MainMenuButton>
                </section>
            </div>


            {/* <div className="main-menu__section" id="project-download">
                {_heading('Download')}
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_pdf"  mods='half' onClick={this._resolveSetBladePage("export-pdf")}>pdf</MainMenuButton>
                    <MainMenuButton id="main-menu__button_png"  mods='half' onClick={this._resolveSetBladePage("export-png")}>png</MainMenuButton>
                </section>
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_html" mods='half' onClick={this._resolveSetBladePage("export-html")}>html</MainMenuButton>
                    <MainMenuButton id="main-menu__button_zip"  mods='half' onClick={this._resolveSetBladePage("export-zip")}>zip</MainMenuButton>
                </section>
            </div> */}

            <div className="main-menu__section" id="project-sharing">
                {_heading('Sharing')}
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_share-by-link" onClick={this._resolveSetBladePage("share-link")}>
                        <FormattedMessage id="menu.sharing" defaultMessage="Share link" />
                    </MainMenuButton>
                </section>
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_share-by-qr" onClick={this._resolveSetBladePage("mirroring")}>
                        <FormattedMessage id="menu.mirroring" defaultMessage="Mirroring" />
                    </MainMenuButton>
                </section>
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_share-by-email" onClick={this._resolveSetBladePage("share-email")}>
                        <FormattedMessage id="Share by email" />
                    </MainMenuButton>
                </section>
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_resources-page" onClick={this._resolveSetBladePage("publish")}>
                        <FormattedMessage id="menu.publish" />
                    </MainMenuButton>
                </section>
            </div>

            <div className="main-menu__section" id="project-recents">
                {_heading('Recent projects')}
                {/* {(this.props.recentProjects || []).map(_recentProject)} */}

                {this._renderRecentList()}
                <section className="main-menu__line">
                    <MainMenuButton onClick={this._goToDashboard} >
                        <FormattedMessage id="Show more..." />
                    </MainMenuButton>
                </section>

                {/*<section data-mode-target="#blade1" onClick={this._resolveSetBladePage("recent-projects",RecentProjectsBlade)}>
                <div className="main-menu__icon"><i /></div>
                <span>Show more...</span>
                </section>*/}
            </div>

            <footer className="main-menu__section" id="main-menu__branding">
                <div id="main-menu__socials">
                    <a href="javascript:void(0)" />
                    <a href="javascript:void(0)" />
                </div>
            </footer>
        </div>
    }
}


