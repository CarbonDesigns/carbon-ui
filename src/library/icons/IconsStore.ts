import {Image, IconsInfo} from "carbon-core";
import {CarbonStore} from '../../CarbonFlux';
import Toolbox from "../Toolbox";

export class IconsStore extends CarbonStore<void> {
    createElement({templateId}){
        var templateConfig = {
            realWidth: 50,
            realHeight: 50
        };
        var element = new Image();
        element.setProps({
            width: templateConfig.realWidth,
            height: templateConfig.realHeight,
            source: Image.createFontSource(templateId)
        });
        return element;
    }

    getConfig(){
        return IconsInfo.fonts[IconsInfo.defaultFontFamily];
    }

    static StoreType = "icon";
}

export default Toolbox.registerStore(IconsStore.StoreType, new IconsStore());
