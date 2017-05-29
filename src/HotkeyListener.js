import {app, Clipboard, params} from "carbon-core";
import Mousetrap from "mousetrap";

var hotkeyMap = {};
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
    if (handler && (handler.options.repeatable || !e.repeat)){
        app.actionManager.invoke(handler.action);
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
        if (!this._attached && app.shortcutManager.actionShortcuts){
            for (var action in app.shortcutManager.actionShortcuts){
                var shortcuts = app.shortcutManager.actionShortcuts[action];
                for (var i = 0; i < shortcuts.length; i++){
                    var shortcut = shortcuts[i];
                    var shortcutType = shortcut.options && shortcut.options.type;
                    var hotkey = shortcut.key;
                    if (shortcutType){
                        hotkey += ":" + shortcutType;
                    }
                    var options = shortcut.options ? Object.assign({}, defaults, shortcut.options) : defaults;
                    hotkeyMap[hotkey] = {action, options};
                    Mousetrap.bind(shortcut.key, onKeyEvent, shortcutType);
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