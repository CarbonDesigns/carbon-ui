export type DialogType = "IdleDialog";

export type DialogAction =
    { type: "Dialog_Show", dialogType: DialogType } |
    { type: "Dialog_Hide" };
