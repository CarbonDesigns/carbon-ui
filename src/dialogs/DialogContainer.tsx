import * as React from "react";
import { Component } from "../CarbonFlux";
import { DialogAction } from "./DialogActions";
import DialogRegistry from "./DialogRegistry";
import styled from "styled-components";

import { ThemeProvider } from 'styled-components';
import {colors} from '../theme';

interface DialogState {
    visible: boolean;
    dialogComponent?: any;
    dialogArgs?: object;
}

export default class DialogContainer extends Component<{}, DialogState>{
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            dialogComponent: null,
            dialogArgs: null
        };
    }

    canHandleActions() {
        return true;
    }
    onAction(action: DialogAction) {
        switch (action.type) {
            case "Dialog_Show":
                this.setState({ visible: true, dialogComponent: DialogRegistry.getDialog(action.dialogType), dialogArgs: action.args });
                return;
            case "Dialog_Hide":
                this.setState({ visible: false, dialogComponent: null });
                return;
        }
    }

    render() {
        if (!this.state.visible) {
            return null;
        }
        return <DialogOverlay>
            <ThemeProvider theme={colors}>
                <this.state.dialogComponent {...this.state.dialogArgs} />
            </ThemeProvider>
        </DialogOverlay>;
    }
}

const DialogOverlay = styled.div`
    position:absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
`;