import {app, Image, ToolboxConfiguration, IUIElement} from "carbon-core";
import AbstractStore from "../AbstractRecentStore";

export default class RecentStencilsStore extends AbstractStore{
    constructor(){
        super("Recent stencils");
    }

    getTrackData(e){
        var data: any = {
            fill: e.fill(),
            stroke: e.stroke(),
            opacity: e.opacity()
        };
        if (e instanceof Image){
            data.source = e.props.source;
        }
        if (e.props.font){
            data.font = e.props.font;
        }
        return data;
    }

    createElementConfig(e: IUIElement){
        var tileType = ToolboxConfiguration.chooseTileType(e.width(), e.height());
        var tileSize = ToolboxConfiguration.fitToTile(e.width(), e.height(), tileType);

        var elementConfig = {
            id: e.props.templateId,
            type: "recentElement",
            json: e.toJSON(),
            title: e.displayName(),
            spriteUrl: app.platform.renderElementToDataUrl(e, 1),
            realWidth: e.width(),
            realHeight: e.height(),
            spriteMap: [0, 0, tileSize.width, tileSize.height],
            imageClass: "custom-stencil"
        };
        if (e.width() <= tileSize.width && e.height() <= tileSize.height){
            elementConfig.imageClass += " no-scale";
        }

        return elementConfig;
    }
}