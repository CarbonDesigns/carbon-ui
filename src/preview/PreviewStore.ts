import PreviewActions from './PreviewActions';
import {Range, Map, List, fromJS, Record} from 'immutable';
import {handles, CarbonStore, listenTo, Dispatcher} from "../CarbonFlux";
import LayoutActions from "../layout/LayoutActions";
import {Environment, Devices, PreviewDisplayMode} from "carbon-core";

var State = Record({
    frameVisible: false,
    // deviceWidth: Devices[0].w,
    // deviceHeight: Devices[0].h,
    // responsive:false,
    displayMode: PreviewDisplayMode.Fit,
    previewActive: true,
    activePage: null,
    activeDevice:0
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
            Environment.view && Environment.view.invalidate();
        }
    }

    @handles(PreviewActions.navigateTo)
    onNavigateToPage({artboardId, animation}) {
        this.state = this.state.set("activePage",{artboardId, animation});
    }

    @handles(PreviewActions.navigateBack)
    onNavigateBack() {

    }

    @handles(PreviewActions.changeDevice)
    onChangeDevice({device}) {
        var d = Devices[device];
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