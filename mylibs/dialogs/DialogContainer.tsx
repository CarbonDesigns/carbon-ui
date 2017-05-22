import React from "react";
import { Component } from "../CarbonFlux";
import { DialogAction } from "./DialogActions";
import DialogRegistry from "./DialogRegistry";

interface IDialogState{
    visible: boolean;
    dialogComponent?: any;
}

export default class DialogContainer extends Component<{}, IDialogState>{
    constructor(props){
        super(props);
        this.state = {
            visible: false,
            dialogComponent: null
        };
    }

    canHandleActions(){
        return true;
    }
    onAction(action: DialogAction){
        switch (action.type){
            case "Dialog_Show":
                this.setState({visible: true, dialogComponent: DialogRegistry.getDialog(action.dialogType)});
                return;
            case "Dialog_Hide":
                this.setState({visible: false, dialogComponent: null});
                return;
        }
    }

    render(){
        if (!this.state.visible){
            return null;
        }
        return <div className="dialogOverlay">
            <this.state.dialogComponent/>
        </div>;
    }
}