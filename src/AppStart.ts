import {RichAppContainer} from "./RichAppContainer";
import * as eventDispatcher from "./CarbonEventDispatcher";
import { hot } from 'react-hot-loader'

eventDispatcher.registerEvents();

export default hot(module)(RichAppContainer);