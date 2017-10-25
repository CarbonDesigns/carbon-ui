import { app, Clipboard, params, IShortcut, workspace } from "carbon-core";
import Mousetrap from "mousetrap";
import { dispatchAction } from "./CarbonFlux";
import { cancellationStack, searchStack } from "./shared/ComponentStack";
import { DefaultScheme } from "./Hotkeys";
import { WorkspaceCommand } from "./workspace/WorkspaceAction";

var hotkeyMap: {[key: string]: {action: string, shortcut: IShortcut}} = {};
var defaults = {
    type: undefined, //auto-detect best type
    repeatable: true
};
var suspended = false;
var handleKey = Mousetrap.prototype.handleKey;
Mousetrap.prototype.handleKey = function(){
    if (!suspended){
        handleKey.apply(this, arguments);
    }
};

function onKeyEvent(e, hotkey){
    var handler = hotkeyMap[hotkey + ":" + e.type];
    if (!handler){
        handler = hotkeyMap[hotkey];
    }
    if (handler && (handler.shortcut.repeatable !== false || !e.repeat)){
        if (handler.action === "general.cancel") {
            let top = cancellationStack.peek();
            if (top) {
                top.onCancel();
            }
        }
        else if (handler.action === "general.search") {
            let top = searchStack.peek();
            if (top) {
                top.onSearch();
            }
        }
        else if (handler.action.startsWith("ui.")) {
            dispatchAction({ type: "Workspace_Command", command: handler.action as WorkspaceCommand });
        }
        else {
            app.actionManager.invoke(handler.action);
        }
        return false;
    }
}

function bindPasteContent(){
    Mousetrap.bind(["meta+shift+v", "ctrl+shift+v"], () => Clipboard.pastingContent = true);
}

function bindFallbackClipboard(){
    Mousetrap.bind(["mod+c"], () => Clipboard.onCopy());
    Mousetrap.bind(["mod+v"], () => Clipboard.onPaste());
    Mousetrap.bind(["mod+x"], () => Clipboard.onCut());
}

export default {
    attach: function(){
        if (!this._attached){
            workspace.shortcutManager.mapScheme(DefaultScheme);

            for (var action in workspace.shortcutManager.actionShortcuts){
                var shortcuts = workspace.shortcutManager.actionShortcuts[action];
                for (var i = 0; i < shortcuts.length; i++){
                    var shortcut = shortcuts[i];
                    var hotkey = shortcut.key;
                    var shortcutType = shortcut.type;
                    if (shortcutType){
                        hotkey += ":" + shortcutType;
                    }
                    if (!hotkeyMap.hasOwnProperty(hotkey)) {
                        hotkeyMap[hotkey] = {action, shortcut};
                        Mousetrap.bind(shortcut.key, onKeyEvent, shortcutType);
                    }
                }
            }

            bindPasteContent();
            if (!Clipboard.testNativeSupport()){
                bindFallbackClipboard();
            }

            this._attached = true;
        }
    },
    detach: function(){
        Mousetrap.reset();
    },
    suspend: function(){
        suspended = true;
    },
    resume: function(){
        suspended = false;
    },
    isSuspended: function(){
        return suspended;
    }
}