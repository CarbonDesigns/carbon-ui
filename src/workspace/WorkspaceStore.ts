import { handles, CarbonStore, dispatchAction } from "../CarbonFlux";
import {richApp} from '../RichApp';
import CarbonActions from "../CarbonActions";
import HotKeyListener from "../HotkeyListener";
import { app } from "carbon-core";

export default class WorkspaceStore extends CarbonStore {
    @handles(CarbonActions.loaded)
    onLoaded(){
        if (!app.serverless() && !app.id() && !app.pagesWithSymbols().length) {
            dispatchAction({type: "Dialog_Show", dialogType: "ImportResourceDialog", async: true});
        }
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
