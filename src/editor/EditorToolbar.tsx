import * as React from "react";
import { dispatch, Component, listenTo, CarbonLabel } from "../CarbonFlux";
import EditorActions from "./EditorActions";
import Dropdown from "../shared/Dropdown";
import { FormattedMessage } from "react-intl";
import * as core from "carbon-core";
import PreviewActions from "../preview/PreviewActions";
import EditorStore from "./EditorStore";
import PreviewStore from "../preview/PreviewStore";
import styled from "styled-components";

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
        if(!this.mounted) {
            return;
        }

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
                var item: any = core.DataNode.getImmediateChildById(core.app.activePage, codeItem.id, true);
                if ((item instanceof core.Artboard)) {
                    states = item.getStates();
                    let stateId = EditorStore.state.stateId;
                    stateIndex = states.findIndex(s=>s.id === stateId);
                }
            }
        }

        this.setState({
            codeItems: EditorStore.state.codeItems,
            artboardIndex: Math.max(0, currentIndex),
            states: states,
            stateIndex: stateIndex
        });
    }

    @listenTo(PreviewStore)
    onChange() {
        if(!this.mounted) {
            return;
        }
        this.setState({ displayMode: PreviewStore.state.displayMode });
    }

    renderCurrentArtboard = (selectedItemIndex) => {
        let current = "";
        if (this.state.codeItems[selectedItemIndex]) {
            current = this.state.codeItems[selectedItemIndex].name;
        }

        return current;
    }

    renderDisplayMode = () => {
        let id = "@preview.originalsize";
        switch (this.state.displayMode) {
            case core.PreviewDisplayMode.Fill:
                id = "@preview.fill"
                break;
            case core.PreviewDisplayMode.Fit:
                id = "@preview.fit"
                break;
            case core.PreviewDisplayMode.Responsive:
                id = "@preview.responsive"
                break;
        }
        return <FormattedMessage id={id} tagName="div" />;
    }

    changeDisplayMode = (value: core.PreviewDisplayMode) => {
        dispatch(PreviewActions.changePreviewDisplayMode(value));
    }

    changeArtboard = (index) => {
        let item = this.state.codeItems[index];
        if (!item) {
            return;
        }

        dispatch(PreviewActions.navigateTo(item.id, {}));
    }

    changeState=(index)=> {
        let state = this.state.states[index];
        core.PreviewModel.current.activeArtboard.setProps({stateId:state.id});
    }

    renderCurrentState = (selectedStateIndex) => {
        let current = "";
        if (this.state.states[selectedStateIndex]) {
            current = this.state.states[selectedStateIndex].name;
        }

        return current;
    }

    renderStates() {
        if(!(this.state.states && this.state.states.length > 1) ) {
            return;
        }

        return <Dropdown
            autoClose={true}
            selectedItem={this.state.stateIndex}
            onSelect={this.changeState}
            renderSelected={this.renderCurrentState}
        >
            {this.state.states.map(a => <p key={a.id}><span>{a.name}</span></p>)}
        </Dropdown>
    }

    render() {
        return <div className="editor-toolbar">
            <CurrentArtboard
                autoClose={true}
                selectedItem={this.state.artboardIndex}
                onSelect={this.changeArtboard}
                renderSelected={this.renderCurrentArtboard}
            >
                {this.state.codeItems.map(a => <p key={a.id}><span>{a.name}</span></p>)}
            </CurrentArtboard>
            {this.renderStates()}
            <div className="editor-toolbar_button editor-toolbar_button__restart" onClick={this._onRestart}></div>

            <DisplayMode
                autoClose={true}
                className="drop_down_fixed80 toolbar-align-end"
                selectedItem={this.state.displayMode}
                onSelect={this.changeDisplayMode}
                renderSelected={this.renderDisplayMode}>
                <p><CarbonLabel id="@preview.originalsize" /></p>
                <p><CarbonLabel id="@preview.fit" /></p>
                <p><CarbonLabel id="@preview.fill" /></p>
                <p><CarbonLabel id="@preview.responsive" /></p>
            </DisplayMode>
        </div>
    }
}

const CurrentArtboard = styled(Dropdown).attrs<any>({})`
    width: 160px;
`;

const DisplayMode = styled(Dropdown).attrs<any>({})`
    width: 120px;
`;
