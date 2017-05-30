import appContainer from "./MirroringAppContainer";
import eventDispatcher from "../CarbonEventDispatcher";
import ActionManagerExtensions from "../ActionManagerExtensions";

ActionManagerExtensions.init();
eventDispatcher.registerEvents();

export default appContainer;