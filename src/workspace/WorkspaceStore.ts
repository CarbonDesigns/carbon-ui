import { handles, CarbonStore, dispatchAction } from "../CarbonFlux";
import {richApp} from '../RichApp';
import CarbonActions from "../CarbonActions";
import HotKeyListener from "../HotkeyListener";
import { app, ArtboardType } from "carbon-core";

export default class WorkspaceStore extends CarbonStore {
    @handles(CarbonActions.loaded)
    onLoaded(){
        if (!app.serverless() && !app.id()) {
            let hasSymbols = app.getAllResourceArtboards(ArtboardType.Symbol);
            let hasIcons = app.getAllResourceArtboards(ArtboardType.IconSet);

            if (!hasSymbols && !hasIcons) {
                dispatchAction({type: "Dialog_Show", dialogType: "ImportResourceDialog", async: true});
            }
            else if (hasIcons) {
                dispatchAction({type: "Library_Tab", area: "library", tabId: "2", async: true});
            }
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
