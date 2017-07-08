import React from "react";
import ReactDom from "react-dom";

<<<<<<< HEAD
import { Component, listenTo, dispatchAction } from "../../CarbonFlux";
import {richApp} from "../../RichApp";
import {FormattedHTMLMessage, defineMessages} from 'react-intl';
=======
import { Component, listenTo } from "../../CarbonFlux";
import { richApp } from "../../RichApp";
import StencilsActions from "./StencilsActions";
import { FormattedHTMLMessage, defineMessages } from 'react-intl';
>>>>>>> f0ae3b365cc9269dd98d3aaf75539906c1833fb5
import bem from '../../utils/commonUtils';

export default class SpriteView extends Component<any, any>{
    onClicked = (e) => {
        var templateId = e.currentTarget.dataset.templateId;
        var templateType = e.currentTarget.dataset.templateType;
        var sourceId = e.currentTarget.dataset.sourceId;
<<<<<<< HEAD
        dispatchAction({type: "Stencils_Clicked", e, templateType, templateId, sourceId});
=======
        richApp.dispatch(StencilsActions.clicked({ e, ...e.currentTarget.dataset }));
>>>>>>> f0ae3b365cc9269dd98d3aaf75539906c1833fb5
    };
    getCategoryNode(name) {
        return ReactDom.findDOMNode(this.refs[name]);
    }
    getTemlateNode(name) {
        return ReactDom.findDOMNode(this.refs[name]);
    }
    render() {
        return <div>
            {this.props.config && this.props.config.groups.map(g => {
                return <section className="stencils-group" key={g.name} ref={g.name} data-name={g.name}>
                    <div className="stencils-group__name">
                        <strong><FormattedHTMLMessage id={g.name} defaultMessage={g.name} /></strong>
                    </div>
                    {this.renderTemplates(g)}
                </section>
            })}
        </div>;
    }
    isRetina() {
        if (window.matchMedia) {
            var mq = window.matchMedia("only screen and (-moz-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            if (mq && mq.matches) {
                return true;
            }
        }
        return false;
    }
    renderTemplates(g) {
        var res = [];
        for (let x of g.templates) {
            var containerStyle = {};
            if (x.style) {
                extend(containerStyle, x.style);
            }
            var spriteMap = x.spriteMap;
            var spriteUrl;

            if (this.isRetina()) {
                spriteUrl = (x.spriteUrl2x || g.spriteUrl2x || x.spriteUrl || g.spriteUrl);
            } else {
                spriteUrl = (x.spriteUrl || g.spriteUrl);
            }

            var width = spriteMap[2];
            var height = spriteMap[3];

            var imageStyle: any = {
                backgroundImage: 'url(' + spriteUrl + ')',
                width: width,
                height: height,
                overflow: 'hidden'
            };

            if (g.size) {
                imageStyle.backgroundSize = g.size.width + 'px ' + g.size.height + "px";
            }
            if (spriteMap[0] || spriteMap[1]) {
                imageStyle.backgroundPosition = -spriteMap[0] + 'px ' + -spriteMap[1] + 'px';
            }

            var modified = x.id === this.props.changedId;
            var modification_badge = modified ? <div className="stencil__modification-indicator"><i className="ico--refresh" /></div> : null;

            var cn = bem("stencil", null, {
                modified: modified
            });

            res.push(<div key={g.name + x.id}
                ref={x.ref || ""}
                className={cn}
                data-template-id={x.id}
                data-template-type={x.type}
                data-template-pid={x.pageId}
                data-template-aid={x.artboardId}
                data-template-width={x.realWidth}
                data-template-height={x.realHeight}
                data-source-id={this.props.sourceId}
                title={x.title}
                style={containerStyle}
                onClick={this.onClicked}>
                <div className={bem("stencil", "image", null, x.imageClass)} style={imageStyle}>
                </div>
                {modification_badge}
            </div>);
        }
        return res;
    }
}
