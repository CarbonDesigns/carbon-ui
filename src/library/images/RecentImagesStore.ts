import {app, Brush, Image} from "carbon-core";
import {ToolboxConfiguration} from "carbon-core";
import {IconsInfo} from "carbon-core";
import AbstractStore from "../AbstractRecentStore";
import Toolbox from "../Toolbox";
import { ImageSource, ImageSourceType, IImage } from "carbon-model";

export default class RecentImagesStore extends AbstractStore{
    constructor(){
        super("Recent images");
    }

    canAddElement(e){
        return e instanceof Image;
    }

    getTrackData(e){
        var data = {
            fill: e.fill(),
            stroke: e.stroke(),
            opacity: e.opacity(),
            source: e.props.source
        };

        return data;
    }

    createElementConfig(e){
        var w = e.width();
        var h = e.height();
        var tileType = ToolboxConfiguration.chooseTileType(w, h);
        var tileSize = ToolboxConfiguration.fitToTile(w, h, tileType);

        var imageDesc = this._getSourceDescription(e);
        var elementConfig = {
            id: imageDesc,
            type: "recentImage",
            json: e.toJSON(),
            spriteUrl: app.platform.renderElementToDataUrl(e, 1, tileSize.width, tileSize.height),
            tileWidth: tileSize.width,
            tileHeight: tileSize.height,
            fit: tileSize.scale < 1,
            title: e.displayName(),
            name: imageDesc,
            realWidth: e.width(),
            realHeight: e.height()
        };

        return elementConfig;
    }

    _getSourceDescription(e: IImage){
        return Toolbox.imageSourceToString(e.props.source);
    }
}
