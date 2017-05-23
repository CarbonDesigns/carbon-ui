import PreviewActions from './PreviewActions';
import {Range, Map, List, fromJS, Record} from 'immutable';
import {handles, CarbonStore, listenTo, Dispatcher} from "../CarbonFlux";
import LayoutActions from "../layout/LayoutActions";
import {Environment, Devices} from "carbon-core";

var State = Record({
    frameVisible: false,
    deviceWidth: Devices[0].w,
    deviceHeight: Devices[0].h,
    responsive:false,
    previewActive: true,
    activePage: null,
    activeDevice:0
});

class PreviewStore extends CarbonStore<any> {
    [name: string]: any;

    constructor(dispatcher){
        super(dispatcher);
        this._navigationStack = [];
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
        if(this.state.activePage){
            this._navigationStack.push(this.state.activePage);
        }
        this.state = this.state.set("activePage",{artboardId, animation});
    }

    @handles(PreviewActions.navigateBack)
    onNavigateBack() {

    }
    @handles(PreviewActions.changeDevice)
    onChangeDevice({device}) {
        var d = Devices[device];
        this.state = this.state.withMutations(m=>{
            m.set("activeDevice", device);
            m.set("deviceWidth", d.w);
            m.set("deviceHeight", d.h);
            m.set("responsive", d.w == undefined);
        })
    }
}

export default new PreviewStore(Dispatcher);