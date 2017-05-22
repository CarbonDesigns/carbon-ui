import {handles, CarbonStore} from "../CarbonFlux";
import {richApp} from '../RichApp';
import CarbonActions from "../CarbonActions";
import HotKeyListener from "../HotkeyListener";

export default class WorkspaceStore extends CarbonStore {
    @handles(CarbonActions.loaded)
    onLoaded({app}){
        this.setState({app:app});
    }

    @handles(CarbonActions.inlineEditModeChanged)
    inlineEditModeChanged({mode}){
        if (mode){
            HotKeyListener.suspend();
        }
        else{
            HotKeyListener.resume();
        }
    }
}
