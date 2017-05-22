import {RichAppContainer} from "./RichAppContainer";
import * as eventDispatcher from "./CarbonEventDispatcher";
import * as ActionManagerExtensions from "./ActionManagerExtensions";

ActionManagerExtensions.init();
eventDispatcher.registerEvents();

export default RichAppContainer;