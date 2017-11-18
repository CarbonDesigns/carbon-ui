import React from "react";
import { dispatch } from "../CarbonFlux";
import EditorActions from "./EditorActions";

export default class EditorToolbar extends React.Component<any, any> {
    _onRun = (e) => {
        dispatch(EditorActions.run());
        return false;
    }

    render() {
        return <div className="editor-toolbar">
            <a href="#" onClick={this._onRun}>Run</a>
        </div>
    }
}