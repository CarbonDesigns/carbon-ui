import React from 'react';
import {app} from "carbon-core";
import {richApp}    from '../RichApp';
import {handles, ComponentWithImmutableState} from '../CarbonFlux';
import {FormattedHTMLMessage, FormattedMessage} from "react-intl"
import electronEndpoint from "electronEndpoint";

import MainMenuButton from './MainMenuButton';


import PdfExportBlade       from './blades/export/PdfExportBlade';
import PngExportBlade       from './blades/export/PngExportBlade';
import HtmlExportBlade      from './blades/export/HtmlExportBlade';
import ZipExportBlade       from './blades/export/ZipExportBlade';

import ResourcesBlade       from './blades/resources/ResourcesBlade';
import ShareLinkBlade       from './blades/shareLink/ShareLinkBlade';
import ShareEmailBlade      from './blades/shareEmail/ShareEmailBlade';
import MirroringBlade       from './blades/mirroring/MirroringBlade';
import ProjectSettingsBlade from './blades/projectSettings/ProjectSettingsBlade';
import EditAvatarBlade      from './blades/EditImageBlade';
import RecentProjectsBlade  from './blades/recentProjects/RecentProjectsBlade';
// import SelectPagesBlade from './blades/selectPages/SelectPagesBlade';

import bem from 'bem';

var AVATAR_URL = '/target/res/avas/project-ava.jpg';

function _heading(text) {
    return (<div className="main-menu__heading">
        <FormattedHTMLMessage tagName="h3" id={text}/>
    </div>);
}

function _recentProject(project) {
    return (
        <section className="recent-project" key={project.url}>
            <div className="recent-project-avatar">
                <i style={{backgroundImage: 'url("/i/images/42.png")'}}/>
            </div>
            <p>{project.name}</p>
        </section>);
}


export default class MainMenuBlade extends React.Component {

    setBladePage(id, type, caption) {
        this.context.bladeContainer.close(1);
        this.context.bladeContainer.addChildBlade(id, type, caption);
    }

    _resolveSetBladePage = (page)=> {
        switch (page) {
            case 'project-settings' : return (()=>this.setBladePage(`blade_${page}`, ProjectSettingsBlade ,"Project Settings")) ;
            case 'export-pdf'       : return (()=>this.setBladePage(`blade_${page}`, PdfExportBlade       ,"caption.export2pdf")     ) ;
            case 'export-png'       : return (()=>this.setBladePage(`blade_${page}`, PngExportBlade       ,"caption.export2png")     ) ;
            case 'export-html'      : return (()=>this.setBladePage(`blade_${page}`, HtmlExportBlade      ,"caption.export2html")    ) ;
            case 'export-zip'       : return (()=>this.setBladePage(`blade_${page}`, ZipExportBlade       ,"caption.export2zip")     ) ;
            case 'share-link'       : return (()=>this.setBladePage(`blade_${page}`, ShareLinkBlade       ,"caption.sharelink")      ) ;
            case 'mirroring'        : return (()=>this.setBladePage(`blade_${page}`, MirroringBlade       ,"caption.mirroringblade") ) ;
            case 'share-email'      : return (()=>this.setBladePage(`blade_${page}`, ShareEmailBlade      ,"caption.sharebyemail")   ) ;
            case 'resources'        : return (()=>this.setBladePage(`blade_${page}`, ResourcesBlade       ,"caption.resourceblade")  ) ;
            case 'project-avatar'   : return (()=>this.setBladePage(`blade_${page}`, EditAvatarBlade      ,"Edit proj avatar")       ) ;
            case 'recent-projects'  : return (()=>this.setBladePage(`blade_${page}`, RecentProjectsBlade                            )) ;
        }
        throw "Incorrect..."
    };

    close(){
        this.context.bladeContainer.close(0);
    }

    _desktopSaveDialog() {
        electronEndpoint.saveFile({}, ()=>JSON.stringify(app.toJSON())).then(()=>{
            this.close();
        });
    }

    _desktopOpenDialog() {
        electronEndpoint.openFile().then(data=>{
            app.fromJSON(data);
            this.close();
        }).catch(err=>console.error(err));
    }


    _clickOnProjectSettings = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this._resolveSetBladePage("project-settings")(ev);
    };

    _renderElectronMenu() {
        if (!app.isElectron()) {
            return null;
        }

        return <div className="main-menu__section" id="project-sharing">
            <section className="main-menu__line">
                <MainMenuButton id="main-menu__button_share-by-link" onClick={()=>this._desktopOpenDialog()}>
                    <FormattedHTMLMessage id="@menu.openProject" defaultMessage="Open project..."/>
                </MainMenuButton>
            </section>
            <section className="main-menu__line">
                <MainMenuButton id="main-menu__button_share-by-link" onClick={()=>this._desktopSaveDialog()}>
                    <FormattedHTMLMessage id="@menu.saveProjectAs" defaultMessage="Save project..."/>
                </MainMenuButton>
            </section>
        </div>
    }

    render() {
        var project_name = "Test carbonium project";//fixme change to real
        var comment = 'Freestyle';

        return <div id="main-menu__content" className="main-menu">
            <div className="project-meta" onClick={this._clickOnProjectSettings}>
                <div className="project-meta__bg-avatar" style={{ backgroundImage: "url('" + AVATAR_URL + "')" }}></div>
                <div className="project-meta__text-info">
                    <div className={bem("project-meta", "project-name", {'big': project_name.length > 20})}>
                        <h2>{project_name}</h2>
                    </div>
                    <div className="project-meta__device-info">
                        <i/><span>{comment}</span>
                    </div>
                </div>
                <div className="project-meta__fg-avatar">
                    <figure style={{ backgroundImage: "url('" + AVATAR_URL + "')" }} />
                    <div className="project-meta__edit-avatar-button"><i className="ico--big-pencil"/></div>
                </div>
            </div>

            {this._renderElectronMenu()}

            <div className="main-menu__section" id="project-download">
                {_heading('Download')}
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_pdf"  mods='half' onClick={this._resolveSetBladePage("export-pdf")}>pdf</MainMenuButton>
                    <MainMenuButton id="main-menu__button_png"  mods='half' onClick={this._resolveSetBladePage("export-png")}>png</MainMenuButton>
                </section>
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_html" mods='half' onClick={this._resolveSetBladePage("export-html")}>html</MainMenuButton>
                    <MainMenuButton id="main-menu__button_zip"  mods='half' onClick={this._resolveSetBladePage("export-zip")}>zip</MainMenuButton>
                </section>
            </div>

            <div className="main-menu__section" id="project-sharing">
                {_heading('Sharing')}
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_share-by-link" onClick={this._resolveSetBladePage("share-link")}>
                        <FormattedHTMLMessage id="menu.sharing" defaultMessage="Share link"/>
                    </MainMenuButton>
                </section>
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_share-by-qr" onClick={this._resolveSetBladePage("mirroring")}>
                        <FormattedMessage id="menu.mirroring" defaultMessage="Mirroring"/>
                    </MainMenuButton>
                </section>
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_share-by-email" onClick={this._resolveSetBladePage("share-email")}>
                        <FormattedHTMLMessage id="Share by email"/>
                    </MainMenuButton>
                </section>
                <section className="main-menu__line">
                    <MainMenuButton id="main-menu__button_resources-page" onClick={this._resolveSetBladePage("resources")}>
                        <FormattedHTMLMessage id="menu.resources"/>
                    </MainMenuButton>
                </section>
            </div>

            <div className="main-menu__section" id="project-recents">
                {_heading('Recent projects')}
                {(this.props.recentProjects || []).map(_recentProject)}

                <section className="main-menu__line">
                    {/*<MainMenuButton id="main-menu__button_resources-page" onClick={this._resolveSetBladePage("resources", ResourcesBlade, "caption.resourceblade")}>*/}
                    <MainMenuButton  blade="#blade1" onClick={this._resolveSetBladePage("recent-projects")} >
                        <FormattedHTMLMessage id="Show more..."/>
                    </MainMenuButton>
                </section>

                {/*<section data-mode-target="#blade1" onClick={this._resolveSetBladePage("recent-projects",RecentProjectsBlade)}>
                 <div className="main-menu__icon"><i /></div>
                 <span>Show more...</span>
                 </section>*/}
            </div>

            <footer className="main-menu__section" id="main-menu__branding">
                <div id="main-menu__socials">
                    <a href="javascript:void(0)"/>
                    <a href="javascript:void(0)"/>
                </div>
            </footer>

        </div>
    }
}


MainMenuBlade.contextTypes = {bladeContainer: React.PropTypes.any};


