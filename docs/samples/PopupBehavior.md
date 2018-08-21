/* carbonium.io
* Read docs at https://github.com/CarbonDesigns/carbon-ui/tree/master/docs/
*/

import { PopupBehavior, PopupPosition } from "./behaviors"

let popup = new PopupBehavior(artboard, "Artboard 3", PopupPosition.Center);
popup.hide();

Group_1.onClick = (e) => {
    popup.show();
    e.stopPropagation();
    e.preventDefault();
}

popup.onReady(frame => {
    frame.registerEventHandler("close", () => {
        if (popup.visible) {
            popup.hide();
        }
    })
    frame.scrollVertical = true;
    frame.scrollHorizontal = false;
});