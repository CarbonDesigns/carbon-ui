import { handles, CarbonStore, dispatchAction } from "../CarbonFlux";
import {richApp} from '../RichApp';
import CarbonActions from "../CarbonActions";
import HotKeyListener from "../HotkeyListener";
import { IApp } from "carbon-core";

interface IWorkspaceStoreState {
    app: IApp;
}

export default class WorkspaceStore extends CarbonStore<IWorkspaceStoreState> {
    @handles(CarbonActions.loaded)
    onLoaded({app}){
        this.setState({app:app});
        setTimeout(function() {
            dispatchAction({type: "Dialog_Show", dialogType: "ImportResourceDialog"})
        }, 10);
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
