import React from "react";
import { dispatch, Component, listenTo, CarbonLabel } from "../CarbonFlux";
import EditorActions from "./EditorActions";
import Dropdown from "../shared/Dropdown";
import { FormattedMessage } from "react-intl";
import { app, PreviewDisplayMode, IArtboard } from "carbon-core";
import PreviewActions from "../preview/PreviewActions";
import EditorStore from "./EditorStore";
import PreviewStore from "../preview/PreviewStore";

export default class EditorToolbar extends Component<any, any> {
    _onRestart = (e) => {
        dispatch(EditorActions.restart());

        return false;
    }

    constructor(props, context) {
        super(props, context);
        this.state = { artboards: [], artboardIndex: 0 }
    }

    @listenTo(EditorStore)
    onEditorStoreChanged() {
        let id = null;
        if (EditorStore.state.currentArtboard) {
            id = EditorStore.state.currentArtboard.id;
        }

        let currentIndex = EditorStore.state.artboards.findIndex(a => a.id === id);
        this.setState({
            artboards: EditorStore.state.artboards,
            artboardIndex: Math.max(0, currentIndex)
        });
    }

    @listenTo(PreviewStore)
    onChange() {
        this.setState({ displayMode: PreviewStore.state.displayMode });
    }

    componentDidMount() {
        super.componentDidMount();
    }

    renderCurrentArtboard = (selectedItemIndex) => {
        const __target = <FormattedMessage id="transition.target" />;
        let current = "";
        if (this.state.artboards[selectedItemIndex]) {
            current = this.state.artboards[selectedItemIndex].name;
        }

        return <div className="editor-toolbar__dropdown">
            <div className="editor-toolbar__dropdown-value">{current}</div>
        </div>
    }

    renderDisplayMode = () => {
        let id = "@preview.originalsize";
        switch (this.state.displayMode) {
            case PreviewDisplayMode.Fill:
                id = "@preview.fill"
                break;
            case PreviewDisplayMode.Fit:
                id = "@preview.fit"
                break;
            case PreviewDisplayMode.Responsive:
                id = "@preview.responsive"
                break;
        }
        return <FormattedMessage id={id} tagName="div" />;
    }

    changeDisplayMode = (value: PreviewDisplayMode) => {
        // this.setState({ displayMode: value });
        dispatch(PreviewActions.changePreviewDisplayMode(value));
    }

    changeArtboard = (index) => {
        let artboard: IArtboard = this.state.artboards[index];
        if (artboard) {
            dispatch(PreviewActions.navigateTo(artboard.id, {}));
        }
    }

    render() {
        return <div className="editor-toolbar">

            <Dropdown
                autoClose={true}
                className="drop_down_toolbar"
                selectedItem={this.state.artboardIndex}
                onSelect={this.changeArtboard}
                renderSelected={this.renderCurrentArtboard}
            >
                {this.state.artboards.map(a => <p key={a.id}><span>{a.name}</span></p>)}
            </Dropdown>
            <div className="editor-toolbar_button editor-toolbar_button__restart" onClick={this._onRestart}></div>

            <Dropdown
                autoClose={true}
                className="drop_down_fixed80 toolbar-align-end"
                selectedItem={this.state.displayMode}
                onSelect={this.changeDisplayMode}
                renderSelected={this.renderDisplayMode}>
                <p><CarbonLabel id="@preview.originalsize" /></p>
                <p><CarbonLabel id="@preview.fit" /></p>
                <p><CarbonLabel id="@preview.fill" /></p>
                <p><CarbonLabel id="@preview.responsive" /></p>
            </Dropdown>
        </div>
    }
}