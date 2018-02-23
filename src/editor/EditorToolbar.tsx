import React from "react";
import { dispatch, Component, listenTo, CarbonLabel } from "../CarbonFlux";
import EditorActions from "./EditorActions";
import Dropdown from "../shared/Dropdown";
import { FormattedMessage } from "react-intl";
import { app, PreviewDisplayMode, IArtboard, DataNode, Artboard } from "carbon-core";
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
        this.state = { codeItems: [], artboardIndex: 0, stateIndex: 0, states: [] }
    }

    @listenTo(EditorStore)
    onEditorStoreChanged() {
        let id = null;
        if (EditorStore.state.currentItem && !(EditorStore.state.currentItem as any).isDisposed()) {
            id = EditorStore.state.currentItem.id;
        }

        let currentIndex = EditorStore.state.codeItems.findIndex(a => a.id === id);
        let states = [];
        let stateIndex = 0;
        if (currentIndex >= 0) {
            let codeItem = EditorStore.state.codeItems[currentIndex];
            if (codeItem) {
                var item: any = DataNode.getImmediateChildById(app.activePage, codeItem.id, true);
                if ((item instanceof Artboard)) {
                    states = item.getStates();
                    let stateId = item.stateId;
                    stateIndex = states.findIndex(s=>s.id === stateId);
                }
            }
        }

        this.setState({
            codeItems: EditorStore.state.codeItems,
            artboardIndex: Math.max(0, currentIndex),
            states: states,
            sateIndex: stateIndex
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
        let current = "";
        if (this.state.codeItems[selectedItemIndex]) {
            current = this.state.codeItems[selectedItemIndex].name;
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
        dispatch(PreviewActions.changePreviewDisplayMode(value));
    }

    changeArtboard = (index) => {
        let item = this.state.codeItems[index];
        if (!item) {
            return;
        }

        if (item.type === "artboard") {
            dispatch(PreviewActions.navigateTo(item.id, {}));
        } else if (item.type === "page") {
            dispatch(EditorActions.showPageCode(item.id));
        }
    }

    changeState(index) {

    }

    renderCurrentState = (selectedStateIndex) => {
        let current = "";
        if (this.state.states[selectedStateIndex]) {
            current = this.state.states[selectedStateIndex].name;
        }

        return <div className="editor-toolbar__dropdown">
            <div className="editor-toolbar__dropdown-value">{current}</div>
        </div>
    }

    renderStates() {
        return <Dropdown
            autoClose={true}
            className="drop_down_toolbar"
            selectedItem={this.state.stateIndex}
            onSelect={this.changeState}
            renderSelected={this.renderCurrentState}
        >
            {this.state.states.map(a => <p key={a.id}><span>{a.name}</span></p>)}
        </Dropdown>
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
                {this.state.codeItems.map(a => <p key={a.id}><span>{a.name}</span></p>)}
            </Dropdown>
            {this.renderStates()}
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