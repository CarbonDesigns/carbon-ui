import * as React from "react";

import PreviewWorkspace from './PreviewWorkspace';
import AppLoaderComponent from '../AppLoaderComponent';

//import "./_preview.less";

export default class PreviewAppContainer extends AppLoaderComponent {
    render() {
        return <PreviewWorkspace/>;
    }
}
