import { IShortcut, IShortcutScheme } from "carbon-core";

export const WindowsShortcuts: IShortcut[] = [
    { key: "ctrl+shift+.", action: "fontIncreaseSize" },
    { key: "ctrl+shift+,", action: "fontDecreaseSize" },
    { key: "alt+shift+.", action: "fontIncreaseSize1" },
    { key: "alt+shift+,", action: "fontDecreaseSize1" },

    { key: "ctrl+d", action: "duplicate" },
    { key: "ctrl+g", action: "groupElements" },
    { key: "ctrl+shift+g", action: "ungroupElements" },
    { key: "ctrl+alt+p", action: "convertToPath" },
    { key: "ctrl+alt+m", action: "groupWithMask" },
    { key: "del", action: "delete" },
    { key: "backspace", action: "delete" },

    { key: "ctrl+b", action: "fontBold" },
    { key: "ctrl+i", action: "fontItalic" },
    { key: "ctrl+u", action: "fontUnderline" },

    { key: "alt+i", action: "isolateSelection" },

    { key: "ctrl+a", action: "selectAll" },

    { key: "ctrl+shift+]", action: "bringToFront" },
    { key: "ctrl+shift+[", action: "sendToBack" },
    { key: "ctrl+]", action: "bringForward" },
    { key: "ctrl+[", action: "sendBackward" },

    { key: "ctrl+n", action: "newPagePortrait" },
    { key: "ctrl+shift+n", action: "newPageLandscape" },

    { key: "left", action: "moveLeft" },
    { key: "right", action: "moveRight" },
    { key: "up", action: "moveUp" },
    { key: "down", action: "moveDown" },

    { key: "shift+left", action: "moveLeft10" },
    { key: "shift+right", action: "moveRight10" },
    { key: "shift+up", action: "moveUp10" },
    { key: "shift+down", action: "moveDown10" },

    { key: "alt+left", action: "moveLeft.1" },
    { key: "alt+right", action: "moveRight.1" },
    { key: "alt+up", action: "moveUp.1" },
    { key: "alt+down", action: "moveDown.1" },

    { key: "left", action: "moveFinished", type: "keyup" },
    { key: "right", action: "moveFinished", type: "keyup" },
    { key: "up", action: "moveFinished", type: "keyup" },
    { key: "down", action: "moveFinished", type: "keyup" },
    { key: "shift+left", action: "moveFinished", type: "keyup" },
    { key: "shift+right", action: "moveFinished", type: "keyup" },
    { key: "shift+up", action: "moveFinished", type: "keyup" },
    { key: "shift+down", action: "moveFinished", type: "keyup" },
    { key: "alt+left", action: "moveFinished", type: "keyup" },
    { key: "alt+right", action: "moveFinished", type: "keyup" },
    { key: "alt+up", action: "moveFinished", type: "keyup" },
    { key: "alt+down", action: "moveFinished", type: "keyup" },

    { key: "ctrl+z", action: "undo" },
    { key: "ctrl+shift+z", action: "redo" },
    { key: "shift+z", action: "undoViewport" },
    { key: "alt+shift+z", action: "redoViewport" },

    { key: "x", action: "ui.swapSlots" },
    { key: "shift+x", action: "swapColors" },

    { key: "f2", action: "enter" },

    { key: "ctrl+alt+u", action: "pathUnion" },
    { key: "ctrl+alt+s", action: "pathSubtract" },
    { key: "ctrl+alt+i", action: "pathIntersect" },
    { key: "ctrl+alt+x", action: "pathDifference" },

    { key: "/", action: "ui.transparentColor" },

    { key: "p", action: "pathTool" },
    { key: "r", action: "rectangleTool" },
    { key: "o", action: "circleTool" },
    { key: "v", action: "pointerTool" },
    { key: "d", action: "pointerDirectTool" },
    { key: "l", action: "lineTool" },
    { key: "y", action: "pencilTool" },
    { key: "a", action: "artboardTool" },
    { key: "shift+o", action: "artboardTool" },
    { key: "shift+a", action: "artboardViewerTool" },
    { key: "t", action: "textTool" },
    { key: "i", action: "imageTool" },

    { key: "h", action: "handTool" },
    { key: "space", action: "handTool", repeatable: false },
    { key: "space", action: "handToolRelease", type: "keyup" },

    { key: "ctrl+s", action: "save" },

    { key: "ctrl+alt+s", action: "forceSave" },

    { key: "f3", action: "general.search" },
    { key: "esc", action: "general.cancel" },
    { key: "enter", action: "enter" },

    { key: "z", action: "zoomIn" },
    { key: "alt+z", action: "zoomOut" },
    { key: "ctrl+0", action: "zoom100" },
    { key: "ctrl+.", action: "zoomFit" },

    { key: "f", action: "toggleFrame" }
];

export const MacShortcuts: IShortcut[] = [
    { key: "meta+shift+.", action: "fontIncreaseSize" },
    { key: "meta+shift+,", action: "fontDecreaseSize" },
    { key: "alt+shift+.", action: "fontIncreaseSize1" },
    { key: "alt+shift+,", action: "fontDecreaseSize1" },

    { key: "meta+d", action: "duplicate" },
    { key: "meta+g", action: "groupElements" },
    { key: "meta+shift+g", action: "ungroupElements" },
    { key: "meta+alt+p", action: "convertToPath" },
    { key: "meta+alt+m", action: "groupWithMask" },

    { key: "backspace", action: "delete" },
    { key: "del", action: "delete" },

    { key: "meta+b", action: "fontBold" },
    { key: "meta+i", action: "fontItalic" },
    { key: "meta+u", action: "fontUnderline" },

    { key: "alt+i", action: "isolateSelection" },

    { key: "meta+a", action: "selectAll" },

    { key: "meta+shift+]", action: "bringToFront" },
    { key: "meta+shift+[", action: "sendToBack" },
    { key: "meta+]", action: "bringForward" },
    { key: "meta+[", action: "sendBackward" },

    { key: "meta+n", action: "newPagePortrait" },
    { key: "meta+shift+n", action: "newPageLandscape" },

    { key: "left", action: "moveLeft" },
    { key: "right", action: "moveRight" },
    { key: "up", action: "moveUp" },
    { key: "down", action: "moveDown" },

    { key: "ctrl+alt+u", action: "pathUnion" },
    { key: "ctrl+alt+s", action: "pathSubtract" },
    { key: "ctrl+alt+i", action: "pathIntersect" },
    { key: "ctrl+alt+x", action: "pathDifference" },

    { key: "/", action: "ui.transparentColor" },

    { key: "shift+left", action: "moveLeft10" },
    { key: "shift+right", action: "moveRight10" },
    { key: "shift+up", action: "moveUp10" },
    { key: "shift+down", action: "moveDown10" },

    { key: "alt+left", action: "moveLeft.1" },
    { key: "alt+right", action: "moveRight.1" },
    { key: "alt+up", action: "moveUp.1" },
    { key: "alt+down", action: "moveDown.1" },

    { key: "left", action: "moveFinished", type: "keyup" },
    { key: "right", action: "moveFinished", type: "keyup" },
    { key: "up", action: "moveFinished", type: "keyup" },
    { key: "down", action: "moveFinished", type: "keyup" },
    { key: "shift+left", action: "moveFinished", type: "keyup" },
    { key: "shift+right", action: "moveFinished", type: "keyup" },
    { key: "shift+up", action: "moveFinished", type: "keyup" },
    { key: "shift+down", action: "moveFinished", type: "keyup" },
    { key: "alt+left", action: "moveFinished", type: "keyup" },
    { key: "alt+right", action: "moveFinished", type: "keyup" },
    { key: "alt+up", action: "moveFinished", type: "keyup" },
    { key: "alt+down", action: "moveFinished", type: "keyup" },

    { key: "meta+z", action: "undo" },
    { key: "meta+shift+z", action: "redo" },
    { key: "shift+z", action: "undoViewport" },
    { key: "alt+shift+z", action: "redoViewport" },

    { key: "x", action: "ui.swapSlots" },
    { key: "shift+x", action: "swapColors" },

    { key: "f2", action: "enter" },

    { key: "p", action: "pathTool" },
    { key: "r", action: "rectangleTool" },
    { key: "o", action: "circleTool" },
    { key: "v", action: "pointerTool" },
    { key: "d", action: "pointerDirectTool" },
    { key: "l", action: "lineTool" },
    { key: "y", action: "pencilTool" },
    { key: "a", action: "artboardTool" },
    { key: "shift+o", action: "artboardTool" },
    { key: "shift+a", action: "artboardViewerTool" },
    { key: "t", action: "textTool" },
    { key: "i", action: "imageTool" },

    { key: "h", action: "handTool" },
    { key: "space", action: "handTool", repeatable: false },
    { key: "space", action: "handToolRelease", type: "keyup" },

    { key: "meta+s", action: "save" },
    { key: "meta+alt+s", action: "forceSave" },

    { key: "f3", action: "general.search" },
    { key: "esc", action: "general.cancel" },
    { key: "enter", action: "enter" },

    { key: "z", action: "zoomIn" },
    { key: "alt+z", action: "zoomOut" },
    { key: "meta+1", action: "zoom100" },
    { key: "meta+2", action: "zoom2:1" },
    { key: "meta+3", action: "zoom4:1" },
    { key: "meta+4", action: "zoom8:1" },
    { key: "meta+.", action: "zoomFit" },
    { key: "meta+alt+s", action: "zoomSelection" },

    { key: "f", action: "toggleFrame" }
];

export const DefaultScheme: IShortcutScheme = {
    mac: MacShortcuts,
    windows: WindowsShortcuts
}