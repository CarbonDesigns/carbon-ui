import {app, FrameSource, ObjectFactory, Brush, IconsInfo, Frame, Platform} from "carbon-core";
import AbstractStore from "../AbstractRecentStore";
import Toolbox from "../Toolbox";
import LessVars from "../../styles/LessVars";

export class RecentIconsStore extends AbstractStore{
    canAddElement(e){
        return e instanceof Frame;
    }

    getTrackData(e){
        var data = {
            fill: e.fill(),
            stroke: e.stroke(),
            opacity: e.opacity(),
            source: e.props.source,
            sourceProps: e.props.sourceProps
        };

        return data;
    }

    createElement(id){
        var item = this.findById(id);
        return ObjectFactory.fromJSON(item.json);
    }

    createElementConfig(e){
        var iconName = this._getSourceDescription(e);
        var elementConfig = {
            id: this._getElementKey(iconName, e),
            type: RecentIconsStore.StoreType,
            json: e.toJSON(),
            spriteUrl: app.platform.renderElementToDataUrl(e, 1, LessVars.iconStencilHeight*2, LessVars.iconStencilHeight*2), //scale up max twice for retina
            title: e.displayName(),
            name: iconName,
            realWidth: e.width(),
            realHeight: e.height()
        };

        return elementConfig;
    }

    _getSourceDescription(e){
        return Toolbox.imageSourceToString(e.props.source);
    }
    _getElementKey(iconName, e){
        var key = iconName;

        var b = e.props.fill;
        key += b ? Brush.toString(b) : "";

        b = e.props.stroke;
        key += b ? Brush.toString(b) : "";

        key += e.props.opacity;

        return key;
    }

    static StoreType = "recentIcon";
}

export default Toolbox.registerStore(RecentIconsStore.StoreType, new RecentIconsStore());
