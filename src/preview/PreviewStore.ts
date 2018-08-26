import PreviewActions from './PreviewActions';
import {Range, Map, List, fromJS, Record} from 'immutable';
import {handles, CarbonStore, listenTo, Dispatcher} from "../CarbonFlux";
import LayoutActions from "../layout/LayoutActions";
import * as core from "carbon-core";

var State = Record({
    frameVisible: false,
    displayMode: core.PreviewDisplayMode.Fit,
    previewActive: true,
    activeDevice:0,
    activeArtboardId:""
});

class PreviewStore extends CarbonStore<any> {
    [name: string]: any;

    constructor(dispatcher){
        super(dispatcher);
    }

    getInitialState() {
        return new State();
    }

    @handles(LayoutActions.resizingPanel)
    onResizing() {
        if (this.state.previewActive) {
            core.Invalidate.request();
        }
    }

    @handles(PreviewActions.navigateTo)
    onNavigateToPage({artboardId, animation, data}) {
        this.state = this.state.set("activeArtboardId", artboardId);
        //let previewModel = core.PreviewModel.current;
        //core.PreviewModel.current.navigateToArtboard(artboardId, animation, data);
    }

    @handles(PreviewActions.navigateBack)
    onNavigateBack() {

    }

    @handles(PreviewActions.changeDevice)
    onChangeDevice({device}) {
        var d = core.Devices[device];
        this.state = this.state.withMutations(m=>{
            // m.set("activeDevice", device);
            // m.set("deviceWidth", d.w);
            // m.set("deviceHeight", d.h);
            // m.set("responsive", d.w == undefined);
        })
    }
    @handles(PreviewActions.changePreviewDisplayMode)
    onChangePreviewDisplayMode({mode}) {
        this.state = this.state.set("displayMode", mode);
    }
}

export default new PreviewStore(Dispatcher);