import { DialogType } from "./DialogActions";

export default class DialogRegistry {
    private static map = {};

    static register(dialogType: DialogType, dialog){
        DialogRegistry.map[dialogType] = dialog;
    }

    static getDialog(dialogType: DialogType){
        var dialog = DialogRegistry.map[dialogType];
        if (!dialog){
            throw new Error(`Could not find dialog ${dialogType}. Make sure dialog file is required`);
        }
        return dialog;
    }
}