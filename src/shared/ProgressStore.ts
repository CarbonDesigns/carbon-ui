import {handles, CarbonStore} from "../CarbonFlux";
import AppActions from "../RichAppActions";
import {richApp} from '../RichApp';

export default class ProgressStore extends CarbonStore<any>{
    constructor(options){
        super(options);

        this.state = {
            visible: false
        };
    }

    isVisible(){
        return this.state.visible;
    }

    show(){
        this.setState({visible: true});
    }

    @handles(AppActions.progressHideDelayed)
    hide(){
        this.setState({visible: false});
    }

    hideAfterDelay(){
        setTimeout(() => richApp.dispatch(AppActions.progressHideDelayed()), 800);
    }
}
